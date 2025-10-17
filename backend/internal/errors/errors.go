package errors

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AppError представляет ошибку приложения с HTTP кодом
type AppError struct {
	Code    int         `json:"-"`
	Message string      `json:"error"`
	Details interface{} `json:"details,omitempty"`
}

// Error реализует интерфейс error
func (e *AppError) Error() string {
	return e.Message
}

// Предопределенные ошибки
var (
	// Auth errors
	ErrInvalidCredentials = &AppError{
		Code:    http.StatusUnauthorized,
		Message: "Неверные учетные данные",
	}
	ErrUnauthorized = &AppError{
		Code:    http.StatusUnauthorized,
		Message: "Необходима авторизация",
	}
	ErrAccountBlocked = &AppError{
		Code:    http.StatusForbidden,
		Message: "Ваш аккаунт заблокирован",
	}
	ErrPasswordChangeForbidden = &AppError{
		Code:    http.StatusForbidden,
		Message: "Смена пароля запрещена",
	}
	ErrInvalidToken = &AppError{
		Code:    http.StatusUnauthorized,
		Message: "Неверный или истекший токен",
	}

	// User errors
	ErrUserNotFound = &AppError{
		Code:    http.StatusNotFound,
		Message: "Пользователь не найден",
	}
	ErrUserAlreadyExists = &AppError{
		Code:    http.StatusConflict,
		Message: "Пользователь с таким логином уже существует",
	}
	ErrInvalidUserID = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Неверный ID пользователя",
	}
	ErrAccessDenied = &AppError{
		Code:    http.StatusForbidden,
		Message: "Нет доступа к этому ресурсу",
	}
	ErrCannotDeleteSelf = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Вы не можете удалить самого себя",
	}

	// Validation errors
	ErrInvalidInput = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Неверный формат данных",
	}
	ErrWeakPassword = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Пароль не соответствует требованиям безопасности",
	}
	ErrPasswordMismatch = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Пароли не совпадают",
	}
	ErrInvalidEmail = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Некорректный email адрес",
	}
	ErrInvalidPhone = &AppError{
		Code:    http.StatusBadRequest,
		Message: "Некорректный номер телефона",
	}

	// Server errors
	ErrInternal = &AppError{
		Code:    http.StatusInternalServerError,
		Message: "Внутренняя ошибка сервера",
	}
	ErrDatabaseError = &AppError{
		Code:    http.StatusInternalServerError,
		Message: "Ошибка при работе с базой данных",
	}

	// Rate limiting
	ErrTooManyRequests = &AppError{
		Code:    http.StatusTooManyRequests,
		Message: "Слишком много запросов. Пожалуйста, попробуйте позже",
	}
)

// NewAppError создает новую ошибку приложения
func NewAppError(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

// WithDetails добавляет дополнительные детали к ошибке
func (e *AppError) WithDetails(details interface{}) *AppError {
	return &AppError{
		Code:    e.Code,
		Message: e.Message,
		Details: details,
	}
}

// RespondWithError отправляет ошибку клиенту
func RespondWithError(c *gin.Context, err error) {
	if appErr, ok := err.(*AppError); ok {
		c.JSON(appErr.Code, gin.H{
			"error":   appErr.Message,
			"details": appErr.Details,
		})
		return
	}

	// Для неизвестных ошибок возвращаем 500
	c.JSON(http.StatusInternalServerError, gin.H{
		"error": "Внутренняя ошибка сервера",
	})
}

// RespondWithSuccess отправляет успешный ответ
func RespondWithSuccess(c *gin.Context, code int, data interface{}) {
	c.JSON(code, data)
}
