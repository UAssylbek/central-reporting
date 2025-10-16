package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

const (
	errInvalidUserID      = "Неверный ID пользователя"
	errNoAccess           = "Нет доступа к этому пользователю"
	errUserAlreadyExists  = "Пользователь с логином '%s' уже существует"
	errFailedToGetUsers   = "Не удалось получить список пользователей"
	errFailedToCreateUser = "Не удалось создать пользователя"
	errFailedToUpdateUser = "Не удалось обновить пользователя"
	errFailedToDeleteUser = "Не удалось удалить пользователя"
	errUserNotFound       = "Пользователь не найден"
	errCannotDeleteSelf   = "Вы не можете удалить самого себя"
)

func (h *UserHandler) GetUserByID(c *gin.Context) {
	h.GetUser(c)
}

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

// CreateUser создаёт нового пользователя
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role, _ := c.Get("role")
	currentUserID, _ := c.Get("user_id")

	if role != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Только администраторы могут создавать пользователей",
		})
		return
	}

	// Проверка на существующего пользователя
	existingUser, _ := h.userRepo.GetByUsername(req.Username)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf(errUserAlreadyExists, req.Username),
		})
		return
	}

	// Функция для создания NullString
	createNullString := func(s string) models.NullString {
		return models.NullString{
			String: s,
			Valid:  s != "",
		}
	}

	// Парсим дату рождения
	var birthDate models.NullTime
	if req.BirthDate != "" {
		parsedDate, err := time.Parse("2006-01-02", req.BirthDate)
		if err == nil {
			birthDate = models.NullTime{Time: parsedDate, Valid: true}
		}
	}

	// Инициализируем массивы если они nil
	if req.Emails == nil {
		req.Emails = []string{}
	}
	if req.Phones == nil {
		req.Phones = []string{}
	}
	if req.Tags == nil {
		req.Tags = []string{}
	}
	if req.CustomFields == nil {
		req.CustomFields = models.CustomFields{}
	}

	user := models.User{
		FullName:               req.FullName,
		Username:               req.Username,
		Password:               createNullString(req.Password),
		AvatarURL:              createNullString(req.AvatarURL),
		RequirePasswordChange:  req.RequirePasswordChange,
		DisablePasswordChange:  req.DisablePasswordChange,
		ShowInSelection:        req.ShowInSelection,
		AvailableOrganizations: req.AvailableOrganizations,
		AccessibleUsers:        req.AccessibleUsers,
		Emails:                 models.Emails(req.Emails),
		Phones:                 models.Phones(req.Phones),
		Position:               createNullString(req.Position),
		Department:             createNullString(req.Department),
		BirthDate:              birthDate,
		Address:                createNullString(req.Address),
		City:                   createNullString(req.City),
		Country:                createNullString(req.Country),
		PostalCode:             createNullString(req.PostalCode),
		SocialLinks:            req.SocialLinks,
		Timezone:               createNullString(req.Timezone),
		WorkHours:              createNullString(req.WorkHours),
		Comment:                createNullString(req.Comment),
		CustomFields:           req.CustomFields,
		Tags:                   models.Tags(req.Tags),
		IsActive:               true,
		Role:                   req.Role,
		IsFirstLogin:           true,
		CreatedBy:              models.NullInt{Int: currentUserID.(int), Valid: true},
	}

	// Если пароль не задан, но требуется его смена при первом входе
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

// UpdateUser обновляет данные пользователя
func (h *UserHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errInvalidUserID})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")
	currentUserID := userID.(int)

	// 🔧 ИСПРАВЛЕНИЕ 1: Администратор имеет полный доступ без ограничений
	if role == models.RoleAdmin {
		// Админ может редактировать любого, включая себя
		// Никаких проверок не требуется
	} else if role == models.RoleModerator {
		// 🔧 ИСПРАВЛЕНИЕ 2: Модератор может редактировать себя или доступных ему пользователей
		if currentUserID == id {
			// Модератор редактирует себя - разрешаем базовые поля
			// Но НЕ разрешаем менять роль, username, password, organizations
			if req.Role != "" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Модераторы не могут изменять свою роль"})
				return
			}
			if req.Username != "" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Модераторы не могут изменять свой логин"})
				return
			}
			if req.Password != "" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Используйте отдельную форму для смены пароля"})
				return
			}
		} else {
			// Модератор редактирует другого пользователя - проверяем доступ
			canAccess, err := h.userRepo.CanModeratorAccessUser(currentUserID, id)
			if err != nil || !canAccess {
				c.JSON(http.StatusForbidden, gin.H{"error": errNoAccess})
				return
			}

			// Модератор может менять ТОЛЬКО available_organizations у своих пользователей
			// Очищаем все остальные поля из запроса
			req = models.UpdateUserRequest{
				AvailableOrganizations: req.AvailableOrganizations,
			}
		}
	} else if role == models.RoleUser {
		// 🔧 ИСПРАВЛЕНИЕ 3: Обычный пользователь может редактировать только себя
		if currentUserID != id {
			c.JSON(http.StatusForbidden, gin.H{"error": errNoAccess})
			return
		}

		// User НЕ может менять: роль, username, password, доступные организации
		if req.Role != "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Вы не можете изменять свою роль"})
			return
		}
		if req.Username != "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Вы не можете изменять свой логин"})
			return
		}
		if req.Password != "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Используйте отдельную форму для смены пароля"})
			return
		}
		if len(req.AvailableOrganizations) > 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Вы не можете изменять доступные организации"})
			return
		}
	}

	// Проверка на существование пользователя с таким username (только если username меняется)
	if req.Username != "" {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != id {
			c.JSON(http.StatusConflict, gin.H{
				"error": fmt.Sprintf(errUserAlreadyExists, req.Username),
			})
			return
		}
	}

	// Выполняем обновление
	if err := h.userRepo.Update(id, req, currentUserID); err != nil {
		log.Printf("Failed to update user %d: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": errFailedToUpdateUser,
		})
		return
	}

	// Получаем обновлённого пользователя
	updatedUser, err := h.userRepo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Не удалось получить обновлённого пользователя",
		})
		return
	}

	// Очищаем пароль перед отправкой
	updatedUser.Password = models.NullString{}
	c.JSON(http.StatusOK, gin.H{"user": updatedUser})
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
