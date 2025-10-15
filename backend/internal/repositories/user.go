package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

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

// GetAll возвращает список пользователей
func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	// ВАЖНО: не включаем password в SELECT для списка пользователей
	query := `SELECT id, full_name, username, avatar_url, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, emails, phones, 
	          position, department, birth_date, address, city, country, postal_code, social_links, 
	          timezone, work_hours, comment, custom_fields, tags, is_active, blocked_reason, 
	          blocked_at, blocked_by, role, is_first_login, is_online, last_seen, created_by, 
	          updated_by, created_at, updated_at, token_version 
	          FROM users ORDER BY created_at DESC`

	err := r.db.Select(&users, query)
	if err != nil {
		log.Printf("Database error in GetAll: %v", err)
	}
	return users, err
}

// GetAccessibleUsers возвращает список пользователей, доступных для модератора
func (r *UserRepository) GetAccessibleUsers(moderatorID int) ([]models.User, error) {
	moderator, err := r.GetByID(moderatorID)
	if err != nil {
		return nil, err
	}

	if len(moderator.AccessibleUsers) == 0 {
		return []models.User{}, nil
	}

	var users []models.User
	// ВАЖНО: не включаем password в SELECT для списка
	query := `SELECT id, full_name, username, avatar_url, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, emails, phones, 
	          position, department, birth_date, address, city, country, postal_code, social_links, 
	          timezone, work_hours, comment, custom_fields, tags, is_active, blocked_reason, 
	          blocked_at, blocked_by, role, is_first_login, is_online, last_seen, created_by, 
	          updated_by, created_at, updated_at, token_version 
	          FROM users WHERE id = ANY($1::int[]) ORDER BY created_at DESC`

	err = r.db.Select(&users, query, pq.Array(moderator.AccessibleUsers))
	return users, err
}

// GetByID возвращает пользователя по ID (БЕЗ пароля для безопасности)
func (r *UserRepository) GetByID(id int) (*models.User, error) {
	var user models.User
	// Не включаем password, т.к. это публичный метод
	query := `SELECT id, full_name, username, avatar_url, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, emails, phones, 
	          position, department, birth_date, address, city, country, postal_code, social_links, 
	          timezone, work_hours, comment, custom_fields, tags, is_active, blocked_reason, 
	          blocked_at, blocked_by, role, is_first_login, is_online, last_seen, created_by, 
	          updated_by, created_at, updated_at, token_version 
	          FROM users WHERE id = $1`

	err := r.db.Get(&user, query, id)
	return &user, err
}

// GetByUsername возвращает пользователя по имени (С паролем для аутентификации)
func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	// ВКЛЮЧАЕМ password, т.к. используется для аутентификации
	query := `SELECT id, full_name, username, password, avatar_url, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, emails, phones, 
	          position, department, birth_date, address, city, country, postal_code, social_links, 
	          timezone, work_hours, comment, custom_fields, tags, is_active, blocked_reason, 
	          blocked_at, blocked_by, role, is_first_login, is_online, last_seen, created_by, 
	          updated_by, created_at, updated_at, token_version 
	          FROM users WHERE LOWER(username) = LOWER($1)`

	err := r.db.Get(&user, query, username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// Create создает нового пользователя
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
	}

	// Устанавливаем is_first_login если требуется смена пароля
	if user.RequirePasswordChange {
		user.IsFirstLogin = true
	}

	// Парсим дату рождения если она задана
	var birthDate interface{}
	if user.BirthDate.Valid {
		birthDate = user.BirthDate.Time
	}

	query := `
        INSERT INTO users (
            full_name, username, password, avatar_url, require_password_change, disable_password_change, 
            show_in_selection, available_organizations, accessible_users, emails, phones, 
            position, department, birth_date, address, city, country, postal_code, social_links, 
            timezone, work_hours, comment, custom_fields, tags, is_active, role, is_first_login, created_by
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) 
        RETURNING id, created_at, updated_at`

	err := r.db.QueryRow(query,
		user.FullName,
		user.Username,
		hashedPassword,
		nullStringToInterface(user.AvatarURL),
		user.RequirePasswordChange,
		user.DisablePasswordChange,
		user.ShowInSelection,
		user.AvailableOrganizations,
		user.AccessibleUsers,
		user.Emails,
		user.Phones,
		nullStringToInterface(user.Position),
		nullStringToInterface(user.Department),
		birthDate,
		nullStringToInterface(user.Address),
		nullStringToInterface(user.City),
		nullStringToInterface(user.Country),
		nullStringToInterface(user.PostalCode),
		user.SocialLinks,
		nullStringToInterface(user.Timezone),
		nullStringToInterface(user.WorkHours),
		nullStringToInterface(user.Comment),
		user.CustomFields,
		user.Tags,
		user.IsActive,
		user.Role,
		user.IsFirstLogin,
		nullIntToInterface(user.CreatedBy),
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		log.Printf("Failed to create user: %v", err)
		return err
	}

	log.Printf("User created successfully - ID: %d", user.ID)
	return nil
}

// Helper functions для конвертации nullable типов
func nullStringToInterface(ns models.NullString) interface{} {
	if ns.Valid && ns.String != "" {
		return ns.String
	}
	return nil
}

func nullIntToInterface(ni models.NullInt) interface{} {
	if ni.Valid {
		return ni.Int
	}
	return nil
}

func nullTimeToInterface(nt models.NullTime) interface{} {
	if nt.Valid {
		return nt.Time
	}
	return nil
}

// Update обновляет данные пользователя
func (r *UserRepository) Update(id int, updates models.UpdateUserRequest, updatedByUserID int) error {
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	// 🔧 ИСПРАВЛЕНИЕ: Инвалидация токена только при критичных изменениях
	shouldInvalidateToken := false

	// Основная информация
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

	// Аватарка - НЕ требует инвалидации токена
	if updates.AvatarURL != nil {
		setParts = append(setParts, fmt.Sprintf("avatar_url = $%d", argIndex))
		args = append(args, updates.AvatarURL)
		argIndex++
	}

	// 🔧 КРИТИЧНО: Пароль - требует инвалидации токена
	if updates.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updates.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		setParts = append(setParts, fmt.Sprintf("password = $%d", argIndex))
		args = append(args, string(hashedPassword))
		argIndex++
		shouldInvalidateToken = true
	} else if updates.ResetPassword {
		setParts = append(setParts, "password = NULL")
		shouldInvalidateToken = true
	}

	// Настройки доступа
	if updates.RequirePasswordChange != nil {
		setParts = append(setParts, fmt.Sprintf("require_password_change = $%d", argIndex))
		args = append(args, *updates.RequirePasswordChange)
		argIndex++

		if *updates.RequirePasswordChange {
			setParts = append(setParts, fmt.Sprintf("is_first_login = $%d", argIndex))
			args = append(args, true)
			argIndex++
			shouldInvalidateToken = true
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

	// Организации и пользователи - НЕ требуют инвалидации токена
	if len(updates.AvailableOrganizations) > 0 {
		setParts = append(setParts, fmt.Sprintf("available_organizations = $%d", argIndex))
		args = append(args, updates.AvailableOrganizations)
		argIndex++
	}

	if len(updates.AccessibleUsers) > 0 {
		setParts = append(setParts, fmt.Sprintf("accessible_users = $%d", argIndex))
		args = append(args, updates.AccessibleUsers)
		argIndex++
	}

	// Контактная информация - НЕ требует инвалидации токена
	if len(updates.Emails) > 0 {
		setParts = append(setParts, fmt.Sprintf("emails = $%d", argIndex))
		args = append(args, models.Emails(updates.Emails))
		argIndex++
	}

	if len(updates.Phones) > 0 {
		setParts = append(setParts, fmt.Sprintf("phones = $%d", argIndex))
		args = append(args, models.Phones(updates.Phones))
		argIndex++
	}

	// Личная информация - НЕ требует инвалидации токена
	if updates.Position != "" {
		setParts = append(setParts, fmt.Sprintf("position = $%d", argIndex))
		args = append(args, updates.Position)
		argIndex++
	}

	if updates.Department != "" {
		setParts = append(setParts, fmt.Sprintf("department = $%d", argIndex))
		args = append(args, updates.Department)
		argIndex++
	}

	if updates.BirthDate != "" {
		birthDate, err := time.Parse("2006-01-02", updates.BirthDate)
		if err == nil {
			setParts = append(setParts, fmt.Sprintf("birth_date = $%d", argIndex))
			args = append(args, birthDate)
			argIndex++
		}
	}

	if updates.Address != "" {
		setParts = append(setParts, fmt.Sprintf("address = $%d", argIndex))
		args = append(args, updates.Address)
		argIndex++
	}

	if updates.City != "" {
		setParts = append(setParts, fmt.Sprintf("city = $%d", argIndex))
		args = append(args, updates.City)
		argIndex++
	}

	if updates.Country != "" {
		setParts = append(setParts, fmt.Sprintf("country = $%d", argIndex))
		args = append(args, updates.Country)
		argIndex++
	}

	if updates.PostalCode != "" {
		setParts = append(setParts, fmt.Sprintf("postal_code = $%d", argIndex))
		args = append(args, updates.PostalCode)
		argIndex++
	}

	// Социальные сети - НЕ требуют инвалидации токена
	if len(updates.SocialLinks.Telegram) > 0 || len(updates.SocialLinks.WhatsApp) > 0 ||
		len(updates.SocialLinks.LinkedIn) > 0 || len(updates.SocialLinks.Facebook) > 0 ||
		len(updates.SocialLinks.Instagram) > 0 || len(updates.SocialLinks.Twitter) > 0 {
		setParts = append(setParts, fmt.Sprintf("social_links = $%d", argIndex))
		args = append(args, updates.SocialLinks)
		argIndex++
	}

	// Рабочие настройки - НЕ требуют инвалидации токена
	if updates.Timezone != "" {
		setParts = append(setParts, fmt.Sprintf("timezone = $%d", argIndex))
		args = append(args, updates.Timezone)
		argIndex++
	}

	if updates.WorkHours != "" {
		setParts = append(setParts, fmt.Sprintf("work_hours = $%d", argIndex))
		args = append(args, updates.WorkHours)
		argIndex++
	}

	// Дополнительные поля - НЕ требуют инвалидации токена
	if updates.Comment != "" {
		setParts = append(setParts, fmt.Sprintf("comment = $%d", argIndex))
		args = append(args, updates.Comment)
		argIndex++
	}

	if len(updates.CustomFields) > 0 {
		setParts = append(setParts, fmt.Sprintf("custom_fields = $%d", argIndex))
		args = append(args, updates.CustomFields)
		argIndex++
	}

	if len(updates.Tags) > 0 {
		setParts = append(setParts, fmt.Sprintf("tags = $%d", argIndex))
		args = append(args, models.Tags(updates.Tags))
		argIndex++
	}

	// 🔧 КРИТИЧНО: Блокировка/активность - требует инвалидации токена
	if updates.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *updates.IsActive)
		argIndex++

		if !*updates.IsActive {
			// Если блокируем пользователя
			setParts = append(setParts, fmt.Sprintf("blocked_at = $%d", argIndex))
			args = append(args, time.Now())
			argIndex++

			setParts = append(setParts, fmt.Sprintf("blocked_by = $%d", argIndex))
			args = append(args, updatedByUserID)
			argIndex++

			if updates.BlockedReason != "" {
				setParts = append(setParts, fmt.Sprintf("blocked_reason = $%d", argIndex))
				args = append(args, updates.BlockedReason)
				argIndex++
			}

			shouldInvalidateToken = true
		} else {
			// Если разблокируем
			setParts = append(setParts, "blocked_at = NULL, blocked_by = NULL, blocked_reason = NULL")
		}
	}

	// 🔧 КРИТИЧНО: Роль - требует инвалидации токена
	if updates.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, updates.Role)
		argIndex++
		shouldInvalidateToken = true
	}

	// Инвалидация токена если нужно
	if shouldInvalidateToken {
		setParts = append(setParts, "token_version = token_version + 1")
	}

	// Отслеживание кто обновил
	setParts = append(setParts, fmt.Sprintf("updated_by = $%d", argIndex))
	args = append(args, updatedByUserID)
	argIndex++

	if len(setParts) == 0 {
		return fmt.Errorf("nothing to update")
	}

	// Добавляем ID пользователя в конец
	args = append(args, id)

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = $%d",
		strings.Join(setParts, ", "), argIndex)

	log.Printf("Update query: %s", query)
	log.Printf("Update args: %v", args)

	_, err := r.db.Exec(query, args...)
	return err
}

// Delete удаляет пользователя
func (r *UserRepository) Delete(id int) error {
	query := "DELETE FROM users WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}

// SetOnlineStatus устанавливает онлайн статус
func (r *UserRepository) SetOnlineStatus(userID int, isOnline bool) error {
	query := "UPDATE users SET is_online = $1, last_seen = $2 WHERE id = $3"
	_, err := r.db.Exec(query, isOnline, time.Now(), userID)
	return err
}

// IncrementTokenVersion увеличивает версию токена
func (r *UserRepository) IncrementTokenVersion(userID int) error {
	query := "UPDATE users SET token_version = token_version + 1 WHERE id = $1"
	_, err := r.db.Exec(query, userID)
	return err
}

// CanModeratorAccessUser проверяет доступ модератора к пользователю
func (r *UserRepository) CanModeratorAccessUser(moderatorID, targetUserID int) (bool, error) {
	moderator, err := r.GetByID(moderatorID)
	if err != nil {
		return false, err
	}

	for _, id := range moderator.AccessibleUsers {
		if id == targetUserID {
			return true, nil
		}
	}

	return false, nil
}

// MarkOfflineInactiveUsers помечает неактивных пользователей как оффлайн
func (r *UserRepository) MarkOfflineInactiveUsers(inactiveMinutes int) error {
	threshold := time.Now().Add(-time.Duration(inactiveMinutes) * time.Minute)
	query := "UPDATE users SET is_online = false WHERE is_online = true AND last_seen < $1"
	_, err := r.db.Exec(query, threshold)
	return err
}

func (r *UserRepository) getByIDWithPassword(id int) (*models.User, error) {
	var user models.User
	// ВКЛЮЧАЕМ password для проверки
	query := `SELECT id, full_name, username, password, avatar_url, require_password_change, disable_password_change, 
	          show_in_selection, available_organizations, accessible_users, emails, phones, 
	          position, department, birth_date, address, city, country, postal_code, social_links, 
	          timezone, work_hours, comment, custom_fields, tags, is_active, blocked_reason, 
	          blocked_at, blocked_by, role, is_first_login, is_online, last_seen, created_by, 
	          updated_by, created_at, updated_at, token_version 
	          FROM users WHERE id = $1`

	err := r.db.Get(&user, query, id)
	return &user, err
}

// CheckPassword проверяет пароль пользователя
func (r *UserRepository) CheckPassword(userID int, password string) (bool, error) {
	log.Printf("🟡 CheckPassword called for userID=%d, password length=%d", userID, len(password))

	// ✅ ИСПРАВЛЕНИЕ: используем getByIDWithPassword вместо GetByID
	user, err := r.getByIDWithPassword(userID)
	if err != nil {
		log.Printf("❌ getByIDWithPassword error: %v", err)
		return false, err
	}

	log.Printf("HEEELLOOO 1111")

	if !user.Password.Valid || user.Password.String == "" {
		// Пользователь без пароля
		log.Printf("User has no password, allowing empty password login")
		return password == "", nil
	}

	log.Printf("HEEELLOOO 22222")

	// Убираем возможные кавычки или пробелы вокруг хэша
	hash := strings.Trim(user.Password.String, "\" ")

	log.Printf("DB hash length: %d", len(hash))
	log.Printf("Password to check length: %d", len(password))

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		log.Printf("❌ Password mismatch: %v", err)
		return false, nil
	}

	log.Printf("✅ Password match successful!")
	return true, nil
}

// ChangePassword изменяет пароль пользователя
func (r *UserRepository) ChangePassword(userID int, newPassword string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `UPDATE users SET password = $1, require_password_change = false, 
	          is_first_login = false, token_version = token_version + 1 WHERE id = $2`
	_, err = r.db.Exec(query, string(hashedPassword), userID)
	return err
}

// UpdateUserActivity обновляет активность пользователя
func (r *UserRepository) UpdateUserActivity(userID int) error {
	query := "UPDATE users SET is_online = true, last_seen = $1 WHERE id = $2"
	_, err := r.db.Exec(query, time.Now(), userID)
	return err
}

// SetUserOffline помечает пользователя как оффлайн
func (r *UserRepository) SetUserOffline(userID int) error {
	return r.SetOnlineStatus(userID, false)
}

// UpdateOfflineUsers помечает неактивных пользователей как оффлайн
func (r *UserRepository) UpdateOfflineUsers(inactiveMinutes int) error {
	return r.MarkOfflineInactiveUsers(inactiveMinutes)
}
