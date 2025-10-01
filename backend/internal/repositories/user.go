package repositories

import (
	"fmt"
	"log"
	"strings"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetAll возвращает список пользователей с учётом прав доступа
func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	query := `SELECT id, full_name, username, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, email, phone, additional_email, 
	          comment, role, is_first_login, is_online, last_seen, created_at, updated_at 
	          FROM users ORDER BY created_at DESC`

	log.Printf("Executing query: %s", query)
	err := r.db.Select(&users, query)
	if err != nil {
		log.Printf("Database error in GetAll: %v", err)
	}
	return users, err
}

// GetAccessibleUsers возвращает список пользователей, доступных для модератора
func (r *UserRepository) GetAccessibleUsers(moderatorID int) ([]models.User, error) {
	// Сначала получаем самого модератора
	moderator, err := r.GetByID(moderatorID)
	if err != nil {
		log.Printf("Error getting moderator %d: %v", moderatorID, err)
		return nil, err
	}

	log.Printf("Moderator %d has accessible_users: %v", moderatorID, moderator.AccessibleUsers)

	// Если нет доступных пользователей, возвращаем пустой список
	if len(moderator.AccessibleUsers) == 0 {
		log.Printf("Moderator %d has no accessible users", moderatorID)
		return []models.User{}, nil
	}

	// Преобразуем []int в interface{} слайс для PostgreSQL
	ids := make([]interface{}, len(moderator.AccessibleUsers))
	for i, id := range moderator.AccessibleUsers {
		ids[i] = id
	}

	// Формируем список ID для SQL запроса
	var users []models.User
	query := `SELECT id, full_name, username, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, email, phone, additional_email, 
	          comment, role, is_first_login, is_online, last_seen, created_at, updated_at 
	          FROM users WHERE id = ANY($1::int[]) ORDER BY created_at DESC`

	// Используем pq.Array для правильной передачи массива
	err = r.db.Select(&users, query, pq.Array(moderator.AccessibleUsers))
	if err != nil {
		log.Printf("Database error in GetAccessibleUsers: %v", err)
		return nil, err
	}

	log.Printf("Found %d accessible users for moderator %d", len(users), moderatorID)
	return users, nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	var user models.User
	query := `SELECT id, full_name, username, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, email, phone, additional_email, 
	          comment, role, is_first_login, is_online, last_seen, created_at, updated_at 
	          FROM users WHERE id = $1`
	err := r.db.Get(&user, query, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	query := `SELECT id, full_name, username, password, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, email, phone, additional_email, 
	          comment, role, is_first_login, created_at, updated_at 
	          FROM users WHERE LOWER(username) = LOWER($1)`

	log.Printf("Looking for user with username: %s", username)

	err := r.db.Get(&user, query, username)
	if err != nil {
		log.Printf("User not found or error: %v", err)
		return nil, err
	}

	hasPassword := user.Password.Valid && user.Password.String != ""
	log.Printf("User found: ID=%d, Username=%s, HasPassword=%v", user.ID, user.Username, hasPassword)
	return &user, nil
}

func (r *UserRepository) Create(user *models.User) error {
	var hashedPassword *string

	// Хешируем пароль только если он задан
	if user.Password.Valid && user.Password.String != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(user.Password.String), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		hashStr := string(hash)
		hashedPassword = &hashStr
		log.Printf("Password hashed for user: %s", user.Username)
	} else {
		log.Printf("No password provided for user: %s", user.Username)
	}

	// Подготавливаем nullable поля
	var email, phone, additionalEmail, comment interface{}

	if user.Email.Valid && user.Email.String != "" {
		email = user.Email.String
	}
	if user.Phone.Valid && user.Phone.String != "" {
		phone = user.Phone.String
	}
	if user.AdditionalEmail.Valid && user.AdditionalEmail.String != "" {
		additionalEmail = user.AdditionalEmail.String
	}
	if user.Comment.Valid && user.Comment.String != "" {
		comment = user.Comment.String
	}

	// Устанавливаем is_first_login если требуется смена пароля
	if user.RequirePasswordChange {
		user.IsFirstLogin = true
		log.Printf("Setting IsFirstLogin=true for user: %s (RequirePasswordChange=true)", user.Username)
	}

	log.Printf("Creating user: %s, IsFirstLogin: %v, RequirePasswordChange: %v",
		user.Username, user.IsFirstLogin, user.RequirePasswordChange)

	query := `
        INSERT INTO users (full_name, username, password, require_password_change, disable_password_change, 
                          show_in_selection, available_organizations, accessible_users, email, phone, additional_email, 
                          comment, role, is_first_login) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(query,
		user.FullName, user.Username, hashedPassword, user.RequirePasswordChange, user.DisablePasswordChange,
		user.ShowInSelection, user.AvailableOrganizations, user.AccessibleUsers, email, phone, additionalEmail,
		comment, user.Role, user.IsFirstLogin).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return err
	}

	log.Printf("User created successfully - ID: %d", user.ID)
	return nil
}

func (r *UserRepository) Update(id int, updates models.UpdateUserRequest) error {
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	shouldInvalidateToken := false

	if updates.FullName != "" {
		setParts = append(setParts, fmt.Sprintf("full_name = $%d", argIndex))
		args = append(args, updates.FullName)
		argIndex++
	}

	if updates.Username != "" {
		setParts = append(setParts, fmt.Sprintf("username = $%d", argIndex))
		args = append(args, updates.Username)
		argIndex++
	}

	if updates.Password != "" {
		// Новый пароль установлен
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updates.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		setParts = append(setParts, fmt.Sprintf("password = $%d", argIndex))
		args = append(args, string(hashedPassword))
		argIndex++
		shouldInvalidateToken = true
	} else if updates.ResetPassword {
		// Пароль сброшен
		setParts = append(setParts, "password = NULL")
		shouldInvalidateToken = true
	}

	if updates.RequirePasswordChange != nil {
		setParts = append(setParts, fmt.Sprintf("require_password_change = $%d", argIndex))
		args = append(args, *updates.RequirePasswordChange)
		argIndex++

		if *updates.RequirePasswordChange {
			setParts = append(setParts, fmt.Sprintf("is_first_login = $%d", argIndex))
			args = append(args, true)
			argIndex++
			shouldInvalidateToken = true // Требуется смена пароля
		}
	}

	if updates.DisablePasswordChange != nil {
		setParts = append(setParts, fmt.Sprintf("disable_password_change = $%d", argIndex))
		args = append(args, *updates.DisablePasswordChange)
		argIndex++
	}

	if updates.ShowInSelection != nil {
		setParts = append(setParts, fmt.Sprintf("show_in_selection = $%d", argIndex))
		args = append(args, *updates.ShowInSelection)
		argIndex++
	}

	if updates.AvailableOrganizations != nil {
		setParts = append(setParts, fmt.Sprintf("available_organizations = $%d", argIndex))
		args = append(args, updates.AvailableOrganizations)
		argIndex++
	}

	if updates.AccessibleUsers != nil {
		setParts = append(setParts, fmt.Sprintf("accessible_users = $%d", argIndex))
		args = append(args, updates.AccessibleUsers)
		argIndex++
	}

	if updates.Email != "" {
		setParts = append(setParts, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, updates.Email)
		argIndex++
	}

	if updates.Phone != "" {
		setParts = append(setParts, fmt.Sprintf("phone = $%d", argIndex))
		args = append(args, updates.Phone)
		argIndex++
	}

	if updates.AdditionalEmail != "" {
		setParts = append(setParts, fmt.Sprintf("additional_email = $%d", argIndex))
		args = append(args, updates.AdditionalEmail)
		argIndex++
	}

	if updates.Comment != "" {
		setParts = append(setParts, fmt.Sprintf("comment = $%d", argIndex))
		args = append(args, updates.Comment)
		argIndex++
	}

	// РОЛЬ - КРИТИЧНО ДЛЯ БЕЗОПАСНОСТИ
	if updates.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, updates.Role)
		argIndex++
		shouldInvalidateToken = true // РОЛЬ ИЗМЕНЕНА - инвалидируем токен!
		log.Printf("Role changed for user %d, invalidating token", id)
	}

	// Если нужно инвалидировать токен - увеличиваем версию
	if shouldInvalidateToken {
		setParts = append(setParts, "token_version = token_version + 1")
		log.Printf("Invalidating token for user %d due to security changes", id)
	}

	if len(setParts) == 0 {
		return nil
	}

	setParts = append(setParts, "updated_at = NOW()")
	args = append(args, id)

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d", strings.Join(setParts, ", "), argIndex)
	_, err := r.db.Exec(query, args...)
	return err
}

func (r *UserRepository) Delete(id int) error {
	query := "DELETE FROM users WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}

func (r *UserRepository) CheckPassword(user *models.User, password string) bool {
	// Если пароль в БД пустой/NULL, то любой пароль (включая пустой) проходит
	if !user.Password.Valid || user.Password.String == "" {
		log.Printf("Password is NULL or empty in DB - allowing login")
		return true
	}

	log.Printf("Checking password hash")
	err := bcrypt.CompareHashAndPassword([]byte(user.Password.String), []byte(password))
	return err == nil
}

// Новый метод для смены пароля при первом входе
func (r *UserRepository) ChangePassword(userID int, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `UPDATE users SET password = $1, is_first_login = FALSE, 
	          require_password_change = FALSE, updated_at = NOW() WHERE id = $2`
	_, err = r.db.Exec(query, string(hashedPassword), userID)
	return err
}

// UpdateUserActivity обновляет время последней активности и статус онлайн
func (r *UserRepository) UpdateUserActivity(userID int) error {
	query := `UPDATE users SET is_online = TRUE, last_seen = NOW(), updated_at = NOW() WHERE id = $1`
	result, err := r.db.Exec(query, userID)
	if err != nil {
		log.Printf("UpdateUserActivity ERROR for user %d: %v", userID, err)
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	log.Printf("UpdateUserActivity: user %d, rows affected: %d", userID, rowsAffected)
	return nil
}

// SetUserOffline устанавливает пользователя в офлайн
func (r *UserRepository) SetUserOffline(userID int) error {
	query := `UPDATE users SET is_online = FALSE, updated_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(query, userID)
	return err
}

// UpdateOfflineUsers помечает пользователей как офлайн если они неактивны более N минут
func (r *UserRepository) UpdateOfflineUsers(inactiveMinutes int) error {
	query := `UPDATE users 
	          SET is_online = FALSE 
	          WHERE is_online = TRUE 
	          AND last_seen < NOW() - INTERVAL '1 minute' * $1`
	result, err := r.db.Exec(query, inactiveMinutes)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	log.Printf("UpdateOfflineUsers: Set %d users as offline (inactive > %d mins)", rowsAffected, inactiveMinutes)
	return nil
}

// CanModeratorAccessUser проверяет, может ли модератор управлять пользователем
func (r *UserRepository) CanModeratorAccessUser(moderatorID int, targetUserID int) (bool, error) {
	moderator, err := r.GetByID(moderatorID)
	if err != nil {
		return false, err
	}

	// Проверяем, что это действительно модератор
	if moderator.Role != models.RoleModerator {
		return false, nil
	}

	// Проверяем, есть ли targetUserID в списке доступных пользователей
	for _, userID := range moderator.AccessibleUsers {
		if userID == targetUserID {
			return true, nil
		}
	}

	return false, nil
}
