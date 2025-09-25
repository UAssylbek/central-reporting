package handlers

import (
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

	user, err := h.userRepo.GetByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	// Проверяем пароль (учитываем что пароль может быть пустым в БД)
	if !h.userRepo.CheckPassword(user, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные учетные данные"})
		return
	}

	token, err := auth.GenerateToken(*user, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	// Очищаем пароль перед отправкой
	user.Password = ""

	// Определяем нужно ли менять пароль
	requirePasswordChange := user.IsFirstLogin && user.RequirePasswordChange

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

	// Проверяем старый пароль
	if !h.userRepo.CheckPassword(user, req.OldPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный текущий пароль"})
		return
	}

	// Меняем пароль
	if err := h.userRepo.ChangePassword(userID.(int), req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось изменить пароль"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}
