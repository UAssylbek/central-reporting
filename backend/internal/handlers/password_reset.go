package handlers

import (
	"log"
	"net/http"

	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/UAssylbek/central-reporting/internal/services"
	"github.com/UAssylbek/central-reporting/internal/utils"
	"github.com/gin-gonic/gin"
)

// PasswordResetHandler обрабатывает запросы на сброс пароля
type PasswordResetHandler struct {
	userRepo          *repositories.UserRepository
	passwordResetRepo *repositories.PasswordResetRepository
	emailService      *services.EmailService
}

// NewPasswordResetHandler создает новый handler
func NewPasswordResetHandler(
	userRepo *repositories.UserRepository,
	passwordResetRepo *repositories.PasswordResetRepository,
	emailService *services.EmailService,
) *PasswordResetHandler {
	return &PasswordResetHandler{
		userRepo:          userRepo,
		passwordResetRepo: passwordResetRepo,
		emailService:      emailService,
	}
}

// ForgotPasswordRequest запрос на сброс пароля
type ForgotPasswordRequest struct {
	UsernameOrEmail string `json:"username_or_email" binding:"required"`
}

// ResetPasswordRequest запрос на установку нового пароля
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// ForgotPassword godoc
// @Summary Запрос на сброс пароля
// @Description Отправляет email с ссылкой для сброса пароля
// @Tags auth
// @Accept json
// @Produce json
// @Param request body ForgotPasswordRequest true "Username или email"
// @Success 200 {object} map[string]string "Ссылка для сброса отправлена"
// @Failure 400 {object} map[string]string "Неверный запрос"
// @Failure 404 {object} map[string]string "Пользователь не найден"
// @Failure 500 {object} map[string]string "Ошибка сервера"
// @Router /auth/forgot-password [post]
func (h *PasswordResetHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ищем пользователя по username
	user, err := h.userRepo.GetByUsername(req.UsernameOrEmail)
	if err != nil || user == nil {
		// Не раскрываем информацию о существовании пользователя
		c.JSON(http.StatusOK, gin.H{
			"message": "Если пользователь существует, на email будет отправлена ссылка для сброса пароля",
		})
		return
	}

	// Проверяем что у пользователя есть email
	if len(user.Emails) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "Если пользователь существует, на email будет отправлена ссылка для сброса пароля",
		})
		return
	}

	// Генерируем токен (действителен 1 час)
	token, err := h.passwordResetRepo.GenerateToken(user.ID, 1)
	if err != nil {
		log.Printf("Failed to generate reset token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	// Отправляем email с токеном
	if err := h.emailService.SendPasswordResetEmail(user.Emails[0], user.Username, token); err != nil {
		log.Printf("Failed to send password reset email: %v", err)
		// Не раскрываем пользователю, что email не отправлен
	}

	log.Printf("Password reset token generated for user %s", user.Username)

	c.JSON(http.StatusOK, gin.H{
		"message": "Ссылка для сброса пароля отправлена на email",
		// В development режиме можно возвращать токен для тестирования
		// "token": token, // УБРАТЬ В PRODUCTION!
	})
}

// ResetPassword godoc
// @Summary Сброс пароля
// @Description Устанавливает новый пароль по токену
// @Tags auth
// @Accept json
// @Produce json
// @Param request body ResetPasswordRequest true "Токен и новый пароль"
// @Success 200 {object} map[string]string "Пароль успешно изменен"
// @Failure 400 {object} map[string]interface{} "Неверный токен или пароль"
// @Failure 500 {object} map[string]string "Ошибка сервера"
// @Router /auth/reset-password [post]
func (h *PasswordResetHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Валидация нового пароля
	validation := utils.ValidatePassword(req.NewPassword)
	if !validation.Valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  validation.Message,
			"errors": validation.Errors,
		})
		return
	}

	// Проверяем токен
	valid, userID, err := h.passwordResetRepo.ValidateToken(req.Token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный токен"})
		return
	}

	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Токен недействителен или истек"})
		return
	}

	// Меняем пароль
	if err := h.userRepo.ChangePassword(userID, req.NewPassword); err != nil {
		log.Printf("Failed to change password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось изменить пароль"})
		return
	}

	// Помечаем токен как использованный
	if err := h.passwordResetRepo.MarkAsUsed(req.Token); err != nil {
		log.Printf("Failed to mark token as used: %v", err)
	}

	// Инвалидируем все другие токены пользователя
	if err := h.passwordResetRepo.InvalidateAllUserTokens(userID); err != nil {
		log.Printf("Failed to invalidate user tokens: %v", err)
	}

	log.Printf("AUDIT: User %d reset their password", userID)

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}
