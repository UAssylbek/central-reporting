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

	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var users []models.User
	var err error

	// Если модератор - показываем только доступных ему пользователей
	if role == models.RoleModerator {
		log.Printf("Moderator %d requesting accessible users", userID.(int))
		users, err = h.userRepo.GetAccessibleUsers(userID.(int))
	} else {
		// Для админа - показываем всех пользователей
		users, err = h.userRepo.GetAll()
	}

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

	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	// Если модератор - проверяем доступ
	if role == models.RoleModerator {
		canAccess, err := h.userRepo.CanModeratorAccessUser(userID.(int), id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки доступа"})
			return
		}
		if !canAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа к этому пользователю"})
			return
		}
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

	role, _ := c.Get("role")

	// Модераторы не могут создавать пользователей
	if role == models.RoleModerator {
		c.JSON(http.StatusForbidden, gin.H{"error": "Модераторы не могут создавать пользователей"})
		return
	}

	// Если роль не указана, ставим "user" по умолчанию
	if req.Role == "" {
		req.Role = models.RoleUser
	}

	// Проверяем существует ли пользователь с таким username
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
		AccessibleUsers:        req.AccessibleUsers,
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

	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	// Если модератор - проверяем доступ и ограничиваем возможности
	if role == models.RoleModerator {
		canAccess, err := h.userRepo.CanModeratorAccessUser(userID.(int), id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки доступа"})
			return
		}
		if !canAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа к этому пользователю"})
			return
		}

		// Модератор может изменять ТОЛЬКО доступные организации
		// Очищаем все остальные поля
		req = models.UpdateUserRequest{
			AvailableOrganizations: req.AvailableOrganizations,
		}
	}

	// Если меняется username, проверяем что он не занят
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

	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	// Модераторы не могут удалять пользователей
	if role == models.RoleModerator {
		c.JSON(http.StatusForbidden, gin.H{"error": "Модераторы не могут удалять пользователей"})
		return
	}

	// Проверяем что пользователь не пытается удалить сам себя
	if userID.(int) == id {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Нельзя удалить самого себя"})
		return
	}

	if err := h.userRepo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пользователь удален успешно"})
}

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
