package repositories

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"time"

	"github.com/jmoiron/sqlx"
)

// PasswordResetToken представляет токен для сброса пароля
type PasswordResetToken struct {
	ID        int          `json:"id" db:"id"`
	UserID    int          `json:"user_id" db:"user_id"`
	Token     string       `json:"token" db:"token"`
	ExpiresAt time.Time    `json:"expires_at" db:"expires_at"`
	Used      bool         `json:"used" db:"used"`
	UsedAt    sql.NullTime `json:"used_at" db:"used_at"`
	CreatedAt time.Time    `json:"created_at" db:"created_at"`
}

// PasswordResetRepository для работы с токенами сброса пароля
type PasswordResetRepository struct {
	db *sqlx.DB
}

// NewPasswordResetRepository создает новый репозиторий
func NewPasswordResetRepository(db *sqlx.DB) *PasswordResetRepository {
	return &PasswordResetRepository{db: db}
}

// GenerateToken создает новый токен для сброса пароля
func (r *PasswordResetRepository) GenerateToken(userID int, expirationHours int) (string, error) {
	// Генерируем случайный токен
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)

	expiresAt := time.Now().Add(time.Hour * time.Duration(expirationHours))

	query := `
		INSERT INTO password_reset_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING token
	`

	var savedToken string
	err := r.db.QueryRow(query, userID, token, expiresAt).Scan(&savedToken)
	return savedToken, err
}

// GetByToken возвращает токен по его значению
func (r *PasswordResetRepository) GetByToken(token string) (*PasswordResetToken, error) {
	var resetToken PasswordResetToken
	query := `
		SELECT id, user_id, token, expires_at, used, used_at, created_at
		FROM password_reset_tokens
		WHERE token = $1
	`
	err := r.db.Get(&resetToken, query, token)
	if err != nil {
		return nil, err
	}
	return &resetToken, nil
}

// ValidateToken проверяет валидность токена
func (r *PasswordResetRepository) ValidateToken(token string) (bool, int, error) {
	resetToken, err := r.GetByToken(token)
	if err != nil {
		return false, 0, err
	}

	// Проверяем что токен не использован
	if resetToken.Used {
		return false, 0, nil
	}

	// Проверяем что токен не истек
	if time.Now().After(resetToken.ExpiresAt) {
		return false, 0, nil
	}

	return true, resetToken.UserID, nil
}

// MarkAsUsed помечает токен как использованный
func (r *PasswordResetRepository) MarkAsUsed(token string) error {
	query := `
		UPDATE password_reset_tokens
		SET used = true, used_at = NOW()
		WHERE token = $1
	`
	_, err := r.db.Exec(query, token)
	return err
}

// DeleteExpiredTokens удаляет истекшие токены
func (r *PasswordResetRepository) DeleteExpiredTokens() (int64, error) {
	query := `
		DELETE FROM password_reset_tokens
		WHERE expires_at < NOW() OR (used = true AND used_at < NOW() - INTERVAL '7 days')
	`
	result, err := r.db.Exec(query)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// InvalidateAllUserTokens инвалидирует все токены пользователя
func (r *PasswordResetRepository) InvalidateAllUserTokens(userID int) error {
	query := `
		UPDATE password_reset_tokens
		SET used = true, used_at = NOW()
		WHERE user_id = $1 AND used = false
	`
	_, err := r.db.Exec(query, userID)
	return err
}
