package services

import (
	"fmt"
	"log"

	"github.com/UAssylbek/central-reporting/internal/auth"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/UAssylbek/central-reporting/internal/utils"
)

// AuthService содержит бизнес-логику для аутентификации
type AuthService struct {
	userRepo  *repositories.UserRepository
	jwtSecret string
}

// NewAuthService создает новый экземпляр AuthService
func NewAuthService(userRepo *repositories.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// Login выполняет аутентификацию пользователя
func (s *AuthService) Login(username, password string) (*models.User, string, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		log.Printf("Database error during login: %v", err)
		return nil, "", fmt.Errorf("server error")
	}

	if user == nil {
		log.Printf("Login attempt for non-existent user: %s", username)
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Проверка блокировки
	if !user.IsActive {
		reason := "Your account is blocked"
		if user.BlockedReason.Valid && user.BlockedReason.String != "" {
			reason = user.BlockedReason.String
		}
		log.Printf("Blocked user login attempt: %s", username)
		return nil, "", fmt.Errorf("blocked: %s", reason)
	}

	// Проверка пароля
	if err := s.validatePassword(user, password); err != nil {
		return nil, "", err
	}

	// Обновляем активность
	if err := s.userRepo.UpdateUserActivity(user.ID); err != nil {
		log.Printf("Failed to update activity for user %d: %v", user.ID, err)
	}

	// Генерируем JWT токен
	token, err := auth.GenerateToken(*user, s.jwtSecret)
	if err != nil {
		log.Printf("Failed to generate JWT for user %d: %v", user.ID, err)
		return nil, "", fmt.Errorf("failed to generate token")
	}

	log.Printf("Successful login: user %s (ID: %d)", user.Username, user.ID)
	return user, token, nil
}

// Logout завершает сеанс пользователя
func (s *AuthService) Logout(userID int) error {
	log.Printf("Logging out user %d", userID)
	if err := s.userRepo.SetUserOffline(userID); err != nil {
		log.Printf("Failed to set user %d offline: %v", userID, err)
		return fmt.Errorf("logout failed")
	}
	return nil
}

// ChangePassword изменяет пароль пользователя
func (s *AuthService) ChangePassword(userID int, oldPassword, newPassword string) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	// Проверка что смена пароля разрешена
	if user.DisablePasswordChange {
		return fmt.Errorf("password change is disabled")
	}

	// Валидация нового пароля
	validation := utils.ValidatePassword(newPassword)
	if !validation.Valid {
		return fmt.Errorf("weak password: %s", validation.Message)
	}

	// Проверка старого пароля (кроме первого входа без пароля)
	if !user.IsFirstLogin {
		isValid, err := s.userRepo.CheckPassword(user.ID, oldPassword)
		if err != nil {
			return fmt.Errorf("password check failed")
		}
		if !isValid {
			return fmt.Errorf("incorrect old password")
		}
	} else {
		// Для первого входа проверяем старый пароль только если он был задан
		hasPassword := user.Password.Valid && user.Password.String != ""
		if hasPassword {
			isValid, err := s.userRepo.CheckPassword(user.ID, oldPassword)
			if err != nil {
				return fmt.Errorf("password check failed")
			}
			if !isValid {
				return fmt.Errorf("incorrect old password")
			}
		}
	}

	// Меняем пароль
	if err := s.userRepo.ChangePassword(userID, newPassword); err != nil {
		return fmt.Errorf("failed to change password")
	}

	log.Printf("AUDIT: User %d changed their password", userID)
	return nil
}

// GetCurrentUser возвращает информацию о текущем пользователе
func (s *AuthService) GetCurrentUser(userID int) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return user, nil
}

// validatePassword проверяет пароль с учетом логики первого входа
func (s *AuthService) validatePassword(user *models.User, password string) error {
	hasPassword := user.Password.Valid && user.Password.String != ""

	// Специальная логика для первого входа
	if user.IsFirstLogin && user.RequirePasswordChange {
		if hasPassword {
			// Если пароль задан - проверяем его
			isValid, err := s.userRepo.CheckPassword(user.ID, password)
			if err != nil {
				log.Printf("Password check error: %v", err)
				return fmt.Errorf("password check failed")
			}
			if !isValid {
				return fmt.Errorf("invalid credentials")
			}
		}
		// Если пароля нет - пропускаем проверку
		return nil
	}

	// Обычная проверка пароля
	isValid, err := s.userRepo.CheckPassword(user.ID, password)
	if err != nil {
		log.Printf("Password check error: %v", err)
		return fmt.Errorf("password check failed")
	}
	if !isValid {
		return fmt.Errorf("invalid credentials")
	}

	return nil
}
