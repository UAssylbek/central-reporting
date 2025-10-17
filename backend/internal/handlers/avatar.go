package handlers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	MaxAvatarSize = 5 << 20 // 5MB
	AvatarDir     = "./uploads/avatars"
)

// Разрешенные MIME типы изображений
var allowedMIMETypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// Разрешенные расширения файлов
var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

type AvatarHandler struct {
	userRepo *repositories.UserRepository
}

func NewAvatarHandler(userRepo *repositories.UserRepository) *AvatarHandler {
	// Создаём директорию для аватарок если её нет
	os.MkdirAll(AvatarDir, 0755)
	return &AvatarHandler{userRepo: userRepo}
}

// UploadAvatar загружает аватар пользователя
func (h *AvatarHandler) UploadAvatar(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	currentUserID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Проверка прав доступа
	if role == models.RoleAdmin {
		// Админ может загружать аватар для любого пользователя
		// Продолжаем выполнение
	} else if currentUserID.(int) != userID {
		// Не админ пытается загрузить аватар другому пользователю
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Вы можете загружать только свой аватар",
		})
		return
	}

	// Получаем файл из запроса
	file, header, err := c.Request.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл не найден"})
		return
	}
	defer file.Close()

	// Проверяем размер файла
	if header.Size > MaxAvatarSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Размер файла превышает 5MB"})
		return
	}

	// Проверяем размер на 0 (пустой файл)
	if header.Size == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл пуст"})
		return
	}

	// Проверяем Content-Type из заголовка
	contentType := header.Header.Get("Content-Type")
	if !allowedMIMETypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Недопустимый тип файла. Разрешены только: JPEG, PNG, GIF, WebP",
		})
		return
	}

	// Проверяем расширение файла
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Недопустимое расширение файла. Разрешены только: .jpg, .jpeg, .png, .gif, .webp",
		})
		return
	}

	// Читаем первые 512 байт для определения реального MIME типа
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не удалось прочитать файл"})
		return
	}

	// Определяем MIME тип по содержимому
	detectedType := http.DetectContentType(buffer[:n])
	if !allowedMIMETypes[detectedType] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Обнаружен недопустимый тип файла. Файл не является изображением.",
		})
		return
	}

	// Возвращаем указатель в начало файла
	if _, err := file.Seek(0, 0); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обработки файла"})
		return
	}

	// Генерируем уникальное имя файла (только имя, без пути)
	filename := fmt.Sprintf("%d_%s%s", userID, uuid.New().String(), ext)

	// Защита от directory traversal - очищаем имя файла
	filename = filepath.Base(filename)

	// Создаем абсолютный путь к файлу
	absAvatarDir, err := filepath.Abs(AvatarDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка конфигурации сервера"})
		return
	}

	filePath := filepath.Join(absAvatarDir, filename)

	// Проверяем что итоговый путь находится внутри AvatarDir (защита от directory traversal)
	if !strings.HasPrefix(filePath, absAvatarDir) {
		log.Printf("Security: Directory traversal attempt detected. Path: %s", filePath)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Недопустимое имя файла"})
		return
	}

	// Удаляем старый аватар если есть
	user, err := h.userRepo.GetByID(userID)
	if err == nil && user.AvatarURL.Valid && user.AvatarURL.String != "" {
		oldPath := strings.TrimPrefix(user.AvatarURL.String, "/uploads/avatars/")
		os.Remove(filepath.Join(AvatarDir, oldPath))
	}

	// Сохраняем новый файл с безопасными правами доступа (0644 = rw-r--r--)
	dst, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
	if err != nil {
		log.Printf("Failed to create avatar file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}
	defer dst.Close()

	// Копируем данные с ограничением размера (дополнительная защита)
	written, err := io.CopyN(dst, file, MaxAvatarSize+1)
	if err != nil && err != io.EOF {
		log.Printf("Failed to save avatar: %v", err)
		os.Remove(filePath) // Удаляем частично созданный файл
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}

	// Проверяем что не превышен лимит
	if written > MaxAvatarSize {
		os.Remove(filePath)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Размер файла превышает допустимый лимит"})
		return
	}

	// 🔧 ИСПРАВЛЕНИЕ: Создаем указатель на строку правильно
	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)
	updateReq := models.UpdateUserRequest{
		AvatarURL: &avatarURL, // ✅ Указатель на переменную
	}

	if err := h.userRepo.Update(userID, updateReq, currentUserID.(int)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить профиль"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"avatar_url": avatarURL})
}

// DeleteAvatar удаляет аватар пользователя
func (h *AvatarHandler) DeleteAvatar(c *gin.Context) {
	idStr := c.Param("id")
	userID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	currentUserID, _ := c.Get("user_id")
	role, _ := c.Get("role")

	// Проверка прав доступа
	if role == models.RoleAdmin {
		// Админ может удалять аватар любого пользователя
		// Продолжаем выполнение
	} else if currentUserID.(int) != userID {
		// Не админ пытается удалить аватар другого пользователя
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Вы можете удалять только свой аватар",
		})
		return
	}

	// Получаем текущего пользователя
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Удаляем файл если он есть
	if user.AvatarURL.Valid && user.AvatarURL.String != "" {
		oldPath := strings.TrimPrefix(user.AvatarURL.String, "/uploads/avatars/")
		filePath := filepath.Join(AvatarDir, oldPath)
		if err := os.Remove(filePath); err != nil {
			log.Printf("Warning: failed to remove avatar file %s: %v", filePath, err)
			// Продолжаем даже если файл не удалился
		}
	}

	// 🔧 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: передаем указатель на пустую строку
	emptyString := ""
	updateReq := models.UpdateUserRequest{
		AvatarURL: &emptyString, // Теперь это указатель!
	}

	if err := h.userRepo.Update(userID, updateReq, currentUserID.(int)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить профиль"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Аватар удалён"})
}
