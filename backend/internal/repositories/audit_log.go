package repositories

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/jmoiron/sqlx"
)

// AuditLogEntry представляет запись в журнале аудита
type AuditLogEntry struct {
	ID           int                    `json:"id" db:"id"`
	UserID       sql.NullInt64          `json:"user_id" db:"user_id"`
	Action       string                 `json:"action" db:"action"`
	TargetUserID sql.NullInt64          `json:"target_user_id" db:"target_user_id"`
	Details      map[string]interface{} `json:"details" db:"details"`
	IPAddress    sql.NullString         `json:"ip_address" db:"ip_address"`
	UserAgent    sql.NullString         `json:"user_agent" db:"user_agent"`
	CreatedAt    time.Time              `json:"created_at" db:"created_at"`
}

// AuditLogRepository для работы с audit логами
type AuditLogRepository struct {
	db *sqlx.DB
}

// NewAuditLogRepository создает новый репозиторий
func NewAuditLogRepository(db *sqlx.DB) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

// Log записывает действие пользователя в журнал аудита
func (r *AuditLogRepository) Log(
	userID int,
	action string,
	targetUserID *int,
	details map[string]interface{},
	ipAddress string,
	userAgent string,
) error {
	detailsJSON, err := json.Marshal(details)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO audit_log (user_id, action, target_user_id, details, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	var targetUserIDVal interface{}
	if targetUserID != nil {
		targetUserIDVal = *targetUserID
	}

	_, err = r.db.Exec(query, userID, action, targetUserIDVal, detailsJSON, ipAddress, userAgent)
	return err
}

// GetByUserID возвращает историю действий пользователя
func (r *AuditLogRepository) GetByUserID(userID int, limit int) ([]AuditLogEntry, error) {
	var logs []AuditLogEntry
	query := `
		SELECT id, user_id, action, target_user_id, details, ip_address, user_agent, created_at
		FROM audit_log
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	err := r.db.Select(&logs, query, userID, limit)
	return logs, err
}

// GetByAction возвращает все действия определенного типа
func (r *AuditLogRepository) GetByAction(action string, limit int) ([]AuditLogEntry, error) {
	var logs []AuditLogEntry
	query := `
		SELECT id, user_id, action, target_user_id, details, ip_address, user_agent, created_at
		FROM audit_log
		WHERE action = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	err := r.db.Select(&logs, query, action, limit)
	return logs, err
}

// GetRecent возвращает последние записи из журнала
func (r *AuditLogRepository) GetRecent(limit int) ([]AuditLogEntry, error) {
	var logs []AuditLogEntry
	query := `
		SELECT id, user_id, action, target_user_id, details, ip_address, user_agent, created_at
		FROM audit_log
		ORDER BY created_at DESC
		LIMIT $1
	`
	err := r.db.Select(&logs, query, limit)
	return logs, err
}

// DeleteOldLogs удаляет логи старше указанного количества дней
func (r *AuditLogRepository) DeleteOldLogs(olderThanDays int) (int64, error) {
	query := `
		DELETE FROM audit_log
		WHERE created_at < NOW() - INTERVAL '1 day' * $1
	`
	result, err := r.db.Exec(query, olderThanDays)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// Константы для типов действий
const (
	ActionLogin          = "login"
	ActionLogout         = "logout"
	ActionCreateUser     = "create_user"
	ActionUpdateUser     = "update_user"
	ActionDeleteUser     = "delete_user"
	ActionChangePassword = "change_password"
	ActionBlockUser      = "block_user"
	ActionUnblockUser    = "unblock_user"
	ActionUploadAvatar   = "upload_avatar"
	ActionDeleteAvatar   = "delete_avatar"
)
