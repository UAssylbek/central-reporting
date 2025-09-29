package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userRepo *repositories.UserRepository
}

func NewUserHandler(userRepo *repositories.UserRepository) *UserHandler {
	return &UserHandler{userRepo: userRepo}
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	log.Println("GetUsers handler called")

	users, err := h.userRepo.GetAll()
	if err != nil {
		log.Printf("Error in GetUsers handler: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список пользователей"})
		return
	}

	log.Printf("Found %d users", len(users))
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func (h *UserHandler) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	user, err := h.userRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Если роль не указана, ставим "user" по умолчанию
	if req.Role == "" {
		req.Role = models.RoleUser
	}

	// ДОБАВИТЬ: Проверяем существует ли пользователь с таким username
	existingUser, _ := h.userRepo.GetByUsername(req.Username)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf("Пользователь с логином '%s' уже существует", req.Username),
		})
		return
	}

	// Функция для создания NullString из строки
	createNullString := func(s string) models.NullString {
		return models.NullString{
			String: s,
			Valid:  s != "",
		}
	}

	user := models.User{
		FullName:               req.FullName,
		Username:               req.Username,
		Password:               createNullString(req.Password),
		RequirePasswordChange:  req.RequirePasswordChange,
		DisablePasswordChange:  req.DisablePasswordChange,
		ShowInSelection:        req.ShowInSelection,
		AvailableOrganizations: req.AvailableOrganizations,
		Email:                  createNullString(req.Email),
		Phone:                  createNullString(req.Phone),
		AdditionalEmail:        createNullString(req.AdditionalEmail),
		Comment:                createNullString(req.Comment),
		Role:                   req.Role,
		IsFirstLogin:           true,
	}

	// Если пароль не задан, но требуется его смена при первом входе, устанавливаем флаг
	if !user.Password.Valid && user.RequirePasswordChange {
		user.IsFirstLogin = true
	}

	if err := h.userRepo.Create(&user); err != nil {
		log.Printf("Failed to create user: %v", err)
		// Проверяем тип ошибки для более информативного сообщения
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			c.JSON(http.StatusConflict, gin.H{
				"error": fmt.Sprintf("Пользователь с логином '%s' уже существует", req.Username),
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось создать пользователя",
			})
		}
		return
	}

	// Очищаем пароль перед отправкой
	user.Password = models.NullString{}
	c.JSON(http.StatusCreated, gin.H{"user": user})
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ДОБАВИТЬ: Если меняется username, проверяем что он не занят
	if req.Username != "" {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != id {
			c.JSON(http.StatusConflict, gin.H{
				"error": fmt.Sprintf("Пользователь с логином '%s' уже существует", req.Username),
			})
			return
		}
	}

	if err := h.userRepo.Update(id, req); err != nil {
		log.Printf("Failed to update user: %v", err)
		if strings.Contains(err.Error(), "duplicate") || strings.Contains(err.Error(), "unique") {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Пользователь с таким логином уже существует",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось обновить пользователя",
			})
		}
		return
	}

	// Получаем обновленного пользователя
	user, err := h.userRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Пользователь обновлен успешно"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Пользователь обновлен успешно",
		"user":    user,
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	// Проверяем что пользователь не пытается удалить сам себя
	currentUserID, _ := c.Get("user_id")
	if currentUserID.(int) == id {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Нельзя удалить самого себя"})
		return
	}

	if err := h.userRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пользователь удален успешно"})
}

// Новый метод для получения списка организаций (заглушка)
func (h *UserHandler) GetOrganizations(c *gin.Context) {
	// TODO: Реализовать получение списка организаций из БД
	// Пока возвращаем заглушку
	organizations := []gin.H{
		{"id": 1, "name": "Министерство образования"},
		{"id": 2, "name": "Министерство здравоохранения"},
		{"id": 3, "name": "Министерство финансов"},
		{"id": 4, "name": "Акимат Алматы"},
		{"id": 5, "name": "Акимат Астаны"},
	}

	c.JSON(http.StatusOK, gin.H{"organizations": organizations})
}
