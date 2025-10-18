package repositories

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

// Organization представляет организацию
type Organization struct {
	ID        int            `json:"id" db:"id"`
	Name      string         `json:"name" db:"name"`
	Code      sql.NullString `json:"code" db:"code"`
	ParentID  sql.NullInt64  `json:"parent_id" db:"parent_id"`
	IsActive  bool           `json:"is_active" db:"is_active"`
	CreatedAt time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt time.Time      `json:"updated_at" db:"updated_at"`
}

// OrganizationRepository для работы с организациями
type OrganizationRepository struct {
	db *sqlx.DB
}

// NewOrganizationRepository создает новый репозиторий
func NewOrganizationRepository(db *sqlx.DB) *OrganizationRepository {
	return &OrganizationRepository{db: db}
}

// GetAll возвращает все активные организации
func (r *OrganizationRepository) GetAll() ([]Organization, error) {
	var orgs []Organization
	query := `
		SELECT id, name, code, parent_id, is_active, created_at, updated_at
		FROM organizations
		WHERE is_active = true
		ORDER BY name ASC
	`
	err := r.db.Select(&orgs, query)
	return orgs, err
}

// GetByID возвращает организацию по ID
func (r *OrganizationRepository) GetByID(id int) (*Organization, error) {
	var org Organization
	query := `
		SELECT id, name, code, parent_id, is_active, created_at, updated_at
		FROM organizations
		WHERE id = $1
	`
	err := r.db.Get(&org, query, id)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// GetByCode возвращает организацию по коду
func (r *OrganizationRepository) GetByCode(code string) (*Organization, error) {
	var org Organization
	query := `
		SELECT id, name, code, parent_id, is_active, created_at, updated_at
		FROM organizations
		WHERE code = $1
	`
	err := r.db.Get(&org, query, code)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

// Create создает новую организацию
func (r *OrganizationRepository) Create(name, code string, parentID *int) (*Organization, error) {
	var org Organization
	query := `
		INSERT INTO organizations (name, code, parent_id)
		VALUES ($1, $2, $3)
		RETURNING id, name, code, parent_id, is_active, created_at, updated_at
	`

	var parentIDVal interface{}
	if parentID != nil {
		parentIDVal = *parentID
	}

	err := r.db.QueryRowx(query, name, code, parentIDVal).StructScan(&org)
	return &org, err
}

// Update обновляет организацию
func (r *OrganizationRepository) Update(id int, name, code string, isActive bool) error {
	query := `
		UPDATE organizations
		SET name = $1, code = $2, is_active = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.Exec(query, name, code, isActive, id)
	return err
}

// Delete удаляет организацию (мягкое удаление - is_active = false)
func (r *OrganizationRepository) Delete(id int) error {
	query := `
		UPDATE organizations
		SET is_active = false, updated_at = NOW()
		WHERE id = $1
	`
	_, err := r.db.Exec(query, id)
	return err
}

// HardDelete полностью удаляет организацию из БД
func (r *OrganizationRepository) HardDelete(id int) error {
	query := "DELETE FROM organizations WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}
