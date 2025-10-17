package services

import (
	"fmt"
	"log"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/UAssylbek/central-reporting/internal/utils"
)

// UserService содержит бизнес-логику для работы с пользователями
type UserService struct {
	userRepo *repositories.UserRepository
}

// NewUserService создает новый экземпляр UserService
func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
	}
}

// GetAllUsers возвращает список всех пользователей с пагинацией
// Для админов - все пользователи, для модераторов - только доступные
func (s *UserService) GetAllUsers(role models.UserRole, moderatorID int, params repositories.PaginationParams) (interface{}, error) {
	if role == models.RoleModerator {
		// Moderator видит только доступных ему пользователей
		users, err := s.userRepo.GetAccessibleUsersLight(moderatorID)
		if err != nil {
			log.Printf("Error getting accessible users: %v", err)
			return nil, fmt.Errorf("failed to get users")
		}

		return map[string]interface{}{
			"users": users,
			"total": len(users),
		}, nil
	}

	// Admin видит всех пользователей с пагинацией
	result, err := s.userRepo.GetAllPaginatedLight(params)
	if err != nil {
		log.Printf("Error getting paginated users: %v", err)
		return nil, fmt.Errorf("failed to get users")
	}

	return result, nil
}

// GetUserByID возвращает пользователя по ID с проверкой доступа
func (s *UserService) GetUserByID(userID int, requestorRole models.UserRole, requestorID int) (*models.User, error) {
	// Проверка доступа для модераторов
	if requestorRole == models.RoleModerator {
		canAccess, err := s.userRepo.CanModeratorAccessUser(requestorID, userID)
		if err != nil {
			return nil, fmt.Errorf("access check failed: %w", err)
		}
		if !canAccess {
			return nil, fmt.Errorf("access denied")
		}
	}

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return user, nil
}

// CreateUser создает нового пользователя с валидацией
func (s *UserService) CreateUser(req models.CreateUserRequest, creatorID int) (*models.User, error) {
	// Валидация username
	valid, errMsg := utils.ValidateUsername(req.Username)
	if !valid {
		return nil, fmt.Errorf("username validation failed: %s", errMsg)
	}

	// Валидация emails
	validEmails := []string{}
	for _, email := range req.Emails {
		cleanEmail := utils.SanitizeEmail(email)
		if cleanEmail != "" {
			if !utils.ValidateEmail(cleanEmail) {
				return nil, fmt.Errorf("invalid email: %s", email)
			}
			validEmails = append(validEmails, cleanEmail)
		}
	}

	// Валидация phones
	validPhones := []string{}
	for _, phone := range req.Phones {
		if phone != "" {
			if !utils.ValidatePhone(phone) {
				return nil, fmt.Errorf("invalid phone: %s", phone)
			}
			validPhones = append(validPhones, phone)
		}
	}

	// Валидация пароля если указан
	if req.Password != "" {
		validation := utils.ValidatePassword(req.Password)
		if !validation.Valid {
			return nil, fmt.Errorf("password validation failed: %s", validation.Message)
		}
	}

	// Проверка на существующего пользователя
	existingUser, _ := s.userRepo.GetByUsername(req.Username)
	if existingUser != nil {
		return nil, fmt.Errorf("user with username '%s' already exists", req.Username)
	}

	// Создание пользователя
	user := s.buildUserFromRequest(req, creatorID)

	if err := s.userRepo.Create(&user); err != nil {
		log.Printf("Failed to create user: %v", err)
		return nil, fmt.Errorf("failed to create user")
	}

	log.Printf("AUDIT: User %d created user %d (%s) with role %s",
		creatorID, user.ID, user.Username, user.Role)

	// Очищаем пароль перед возвратом
	user.Password = models.NullString{}
	return &user, nil
}

// UpdateUser обновляет пользователя с проверкой прав доступа
func (s *UserService) UpdateUser(userID int, req models.UpdateUserRequest, updaterRole models.UserRole, updaterID int) (*models.User, error) {
	// Проверка доступа для модераторов
	if updaterRole == models.RoleModerator && updaterID != userID {
		canAccess, err := s.userRepo.CanModeratorAccessUser(updaterID, userID)
		if err != nil || !canAccess {
			return nil, fmt.Errorf("access denied")
		}

		// Модератор может редактировать только организации
		req = models.UpdateUserRequest{
			AvailableOrganizations: req.AvailableOrganizations,
		}
	}

	// Ограничения для обычных пользователей
	if updaterRole == models.RoleUser {
		if updaterID != userID {
			return nil, fmt.Errorf("access denied")
		}

		// User не может менять роль, username, пароль, организации
		req.Role = ""
		req.Username = ""
		req.Password = ""
		req.AvailableOrganizations = nil
		req.AccessibleUsers = nil
	}

	// Проверка на существование username если меняется
	if req.Username != "" {
		existingUser, _ := s.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != userID {
			return nil, fmt.Errorf("username already exists")
		}
	}

	// Выполняем обновление
	if err := s.userRepo.Update(userID, req, updaterID); err != nil {
		log.Printf("Failed to update user %d: %v", userID, err)
		return nil, fmt.Errorf("failed to update user")
	}

	log.Printf("AUDIT: User %d updated user %d", updaterID, userID)

	// Получаем обновленного пользователя
	updatedUser, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated user")
	}

	updatedUser.Password = models.NullString{}
	return updatedUser, nil
}

// DeleteUser удаляет пользователя (только для админов)
func (s *UserService) DeleteUser(userID int, deleterID int) error {
	// Нельзя удалить самого себя
	if userID == deleterID {
		return fmt.Errorf("cannot delete yourself")
	}

	if err := s.userRepo.Delete(userID); err != nil {
		return fmt.Errorf("failed to delete user")
	}

	log.Printf("AUDIT: User %d deleted user %d", deleterID, userID)
	return nil
}

// SetOnlineStatus устанавливает онлайн статус пользователя
func (s *UserService) SetOnlineStatus(userID int, isOnline bool) error {
	return s.userRepo.SetOnlineStatus(userID, isOnline)
}

// UpdateUserActivity обновляет время последней активности
func (s *UserService) UpdateUserActivity(userID int) error {
	return s.userRepo.UpdateUserActivity(userID)
}

// buildUserFromRequest создает модель User из CreateUserRequest
func (s *UserService) buildUserFromRequest(req models.CreateUserRequest, creatorID int) models.User {
	createNullString := func(s string) models.NullString {
		return models.NullString{
			String: s,
			Valid:  s != "",
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
		FullName:               utils.SanitizeString(req.FullName),
		Username:               utils.SanitizeUsername(req.Username),
		Password:               createNullString(req.Password),
		AvatarURL:              createNullString(req.AvatarURL),
		RequirePasswordChange:  req.RequirePasswordChange,
		DisablePasswordChange:  req.DisablePasswordChange,
		ShowInSelection:        req.ShowInSelection,
		AvailableOrganizations: req.AvailableOrganizations,
		AccessibleUsers:        req.AccessibleUsers,
		Emails:                 models.Emails(req.Emails),
		Phones:                 models.Phones(req.Phones),
		Position:               createNullString(utils.SanitizeString(req.Position)),
		Department:             createNullString(utils.SanitizeString(req.Department)),
		Address:                createNullString(utils.SanitizeString(req.Address)),
		City:                   createNullString(utils.SanitizeString(req.City)),
		Country:                createNullString(utils.SanitizeString(req.Country)),
		PostalCode:             createNullString(req.PostalCode),
		SocialLinks:            req.SocialLinks,
		Timezone:               createNullString(req.Timezone),
		WorkHours:              createNullString(req.WorkHours),
		Comment:                createNullString(utils.SanitizeString(req.Comment)),
		CustomFields:           req.CustomFields,
		Tags:                   models.Tags(req.Tags),
		IsActive:               true,
		Role:                   req.Role,
		IsFirstLogin:           true,
		CreatedBy:              models.NullInt{Int: creatorID, Valid: true},
	}

	// Парсим дату рождения если указана
	if req.BirthDate != "" {
		// Parsing logic будет в handlers
	}

	return user
}
