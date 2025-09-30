package handlers

import (
	"log"
	"net/http"

	"github.com/UAssylbek/central-reporting/internal/auth"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
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

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Login attempt - Username: %s, Password length: %d", req.Username, len(req.Password))

	user, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		log.Printf("User not found: %s", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
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
			if !h.userRepo.CheckPassword(user, req.Password) {
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
		if !h.userRepo.CheckPassword(user, req.Password) {
			log.Printf("Password check failed")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
			return
		}
		log.Printf("Password check passed")
	}

	token, err := auth.GenerateToken(*user, h.jwtSecret)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	// Устанавливаем пользователя как онлайн при успешном логине
	log.Printf("Login: Setting user %d as online", user.ID)
	err = h.userRepo.UpdateUserActivity(user.ID)
	if err != nil {
		log.Printf("Login: Failed to set user %d as online: %v", user.ID, err)
	}

	// Очищаем пароль перед отправкой
	user.Password = models.NullString{}

	// Определяем нужно ли менять пароль
	requirePasswordChange := user.IsFirstLogin && user.RequirePasswordChange

	log.Printf("Login successful - RequirePasswordChange: %v", requirePasswordChange)

	c.JSON(http.StatusOK, models.LoginResponse{
		User:                  *user,
		Token:                 token,
		RequirePasswordChange: requirePasswordChange,
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, err := h.userRepo.GetByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

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

// Новый метод для смены пароля при первом входе
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

	userID, _ := c.Get("user_id")
	user, err := h.userRepo.GetByUsername(c.GetString("username"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	// Проверяем что пользователю разрешено менять пароль
	if user.DisablePasswordChange {
		c.JSON(http.StatusForbidden, gin.H{"error": "Смена пароля запрещена"})
		return
	}

	// ИСПРАВЛЕНИЕ: Для первого входа разрешаем пустой старый пароль
	if !user.IsFirstLogin {
		// Обычная проверка старого пароля
		if !h.userRepo.CheckPassword(user, req.OldPassword) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный текущий пароль"})
			return
		}
	} else {
		// Для первого входа проверяем старый пароль только если он был задан
		hasPassword := user.Password.Valid && user.Password.String != ""
		if hasPassword {
			if !h.userRepo.CheckPassword(user, req.OldPassword) {
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

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}
