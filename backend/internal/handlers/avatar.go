package handlers

import (
	"fmt"
	"io"
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
	if role == models.RoleModerator {
		canAccess, err := h.userRepo.CanModeratorAccessUser(currentUserID.(int), userID)
		if err != nil || !canAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа к этому пользователю"})
			return
		}
	} else if role == models.RoleUser && currentUserID.(int) != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Можно загружать только свой аватар"})
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

	// Проверяем тип файла
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл должен быть изображением"})
		return
	}

	// Получаем расширение файла
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		ext = ".jpg"
	}

	// Генерируем уникальное имя файла
	filename := fmt.Sprintf("%d_%s%s", userID, uuid.New().String(), ext)
	filePath := filepath.Join(AvatarDir, filename)

	// Удаляем старый аватар если есть
	user, err := h.userRepo.GetByID(userID)
	if err == nil && user.AvatarURL.Valid && user.AvatarURL.String != "" {
		oldPath := strings.TrimPrefix(user.AvatarURL.String, "/uploads/avatars/")
		os.Remove(filepath.Join(AvatarDir, oldPath))
	}

	// Сохраняем новый файл
	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
		return
	}

	// Обновляем URL в базе данных
	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)
	updateReq := models.UpdateUserRequest{
		AvatarURL: avatarURL,
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
	if role == models.RoleModerator {
		canAccess, err := h.userRepo.CanModeratorAccessUser(currentUserID.(int), userID)
		if err != nil || !canAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа к этому пользователю"})
			return
		}
	} else if role == models.RoleUser && currentUserID.(int) != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Можно удалять только свой аватар"})
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
		os.Remove(filepath.Join(AvatarDir, oldPath))
	}

	// Обновляем базу данных
	updateReq := models.UpdateUserRequest{
		AvatarURL: "",
	}

	if err := h.userRepo.Update(userID, updateReq, currentUserID.(int)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить профиль"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Аватар удалён"})
}
