package handlers

import (
	"log"
	"net/http"

	"github.com/UAssylbek/central-reporting/internal/auth"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/UAssylbek/central-reporting/internal/utils"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo  *repositories.UserRepository
	jwtSecret string
}

func NewAuthHandler(userRepo *repositories.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Login godoc
// @Summary Вход в систему
// @Description Аутентификация пользователя и получение JWT токена
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Учетные данные"
// @Success 200 {object} models.LoginResponse "Успешная авторизация"
// @Failure 400 {object} map[string]string "Неверный формат запроса"
// @Failure 401 {object} map[string]string "Неверные учетные данные"
// @Failure 403 {object} map[string]interface{} "Пользователь заблокирован"
// @Failure 500 {object} map[string]string "Внутренняя ошибка сервера"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt - Username: %s, Password length: %d", req.Username, len(req.Password))

	user, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		log.Printf("Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
		return
	}
	if user == nil {
		log.Printf("User not found: %s", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	// ✅ ДОБАВИТЬ: Проверка на блокировку пользователя
	if !user.IsActive {
		log.Printf("User %s is blocked", user.Username)

		reason := "Ваш аккаунт заблокирован"
		if user.BlockedReason.Valid && user.BlockedReason.String != "" {
			reason = user.BlockedReason.String
		}

		c.JSON(http.StatusForbidden, gin.H{
			"error":   reason,
			"blocked": true,
		})
		return
	}

	hasPassword := user.Password.Valid && user.Password.String != ""
	log.Printf("User found - ID: %d, IsFirstLogin: %v, RequirePasswordChange: %v, HasPassword: %v",
		user.ID, user.IsFirstLogin, user.RequirePasswordChange, hasPassword)

	// Специальная логика для первого входа с требованием смены пароля
	if user.IsFirstLogin && user.RequirePasswordChange {
		log.Printf("First login with password change required")

		// Если пароль в БД пустой - пропускаем любой введённый пароль
		if hasPassword {
			log.Printf("Checking password (password exists in DB)")
			// Если пароль задан - проверяем его
			isValid, err := h.userRepo.CheckPassword(user.ID, req.Password)
			if err != nil {
				log.Printf("Error checking password: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки пароля"})
				return
			}
			if !isValid {
				log.Printf("Password check failed")
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
				return
			}
			log.Printf("Password check passed")
		} else {
			log.Printf("Password is empty in DB - allowing login without password check")
		}
	} else {
		log.Printf("Regular login - checking password")
		// Обычная проверка пароля для всех остальных случаев
		isValid, err := h.userRepo.CheckPassword(user.ID, req.Password)
		if err != nil {
			log.Printf("Error checking password: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки пароля"})
			return
		}
		if !isValid {
			log.Printf("Password check failed")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
			return
		}
		log.Printf("Password check passed")
	}

	log.Printf("Updating user activity for user %d", user.ID)
	if err := h.userRepo.UpdateUserActivity(user.ID); err != nil {
		log.Printf("Failed to update activity: %v", err)
	}

	token, err := auth.GenerateToken(*user, h.jwtSecret)
	if err != nil {
		log.Printf("Failed to generate JWT: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	log.Printf("Login successful for user: %s (ID: %d)", user.Username, user.ID)
	c.JSON(http.StatusOK, models.LoginResponse{
		User:                  *user,
		Token:                 token,
		RequirePasswordChange: user.RequirePasswordChange,
	})
}

// Me godoc
// @Summary Получить текущего пользователя
// @Description Возвращает информацию о текущем авторизованном пользователе
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]models.User "Данные пользователя"
// @Failure 401 {object} map[string]string "Не авторизован"
// @Failure 404 {object} map[string]string "Пользователь не найден"
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, err := h.userRepo.GetByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// Logout godoc
// @Summary Выход из системы
// @Description Завершение сеанса пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]string "Успешный выход"
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if exists {
		log.Printf("Logout: Setting user %d as offline", userID.(int))
		err := h.userRepo.SetUserOffline(userID.(int))
		if err != nil {
			log.Printf("Logout: Failed to set user %d offline: %v", userID.(int), err)
		} else {
			log.Printf("Logout: User %d successfully set offline", userID.(int))
		}
	} else {
		log.Printf("Logout: user_id not found in context")
	}
	c.JSON(http.StatusOK, gin.H{"message": "Выход выполнен успешно"})
}

// ChangePassword godoc
// @Summary Смена пароля
// @Description Изменение пароля пользователя
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.ChangePasswordRequest true "Старый и новый пароли"
// @Success 200 {object} map[string]string "Пароль успешно изменен"
// @Failure 400 {object} map[string]interface{} "Ошибка валидации"
// @Failure 401 {object} map[string]string "Не авторизован"
// @Failure 403 {object} map[string]string "Смена пароля запрещена"
// @Failure 404 {object} map[string]string "Пользователь не найден"
// @Router /auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем что новый пароль и подтверждение совпадают
	if req.NewPassword != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Пароли не совпадают"})
		return
	}

	// Валидация пароля на соответствие требованиям безопасности
	validation := utils.ValidatePassword(req.NewPassword)
	if !validation.Valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  validation.Message,
			"errors": validation.Errors,
		})
		return
	}

	userID, _ := c.Get("user_id")
	user, err := h.userRepo.GetByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Проверяем что пользователю разрешено менять пароль
	if user.DisablePasswordChange {
		c.JSON(http.StatusForbidden, gin.H{"error": "Смена пароля запрещена"})
		return
	}

	// Для первого входа разрешаем пустой старый пароль
	if !user.IsFirstLogin {
		// Обычная проверка старого пароля
		isValid, err := h.userRepo.CheckPassword(user.ID, req.OldPassword)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки пароля"})
			return
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный текущий пароль"})
			return
		}
	} else {
		// Для первого входа проверяем старый пароль только если он был задан
		hasPassword := user.Password.Valid && user.Password.String != ""
		if hasPassword {
			isValid, err := h.userRepo.CheckPassword(user.ID, req.OldPassword)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки пароля"})
				return
			}
			if !isValid {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный текущий пароль"})
				return
			}
		}
		// Если пароля не было - пропускаем проверку
	}

	// Меняем пароль
	if err := h.userRepo.ChangePassword(userID.(int), req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось изменить пароль"})
		return
	}

	log.Printf("AUDIT: User %d (%s) changed their password",
		userID.(int),
		user.Username,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}
