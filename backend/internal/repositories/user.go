package repositories

import (
	"strings"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	var users []models.User
	query := "SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC"
	err := r.db.Select(&users, query)
	return users, err
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, role, created_at, updated_at FROM users WHERE id = $1"
	err := r.db.Get(&user, query, id)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, password, role, created_at, updated_at FROM users WHERE username = $1"
	err := r.db.Get(&user, query, username)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(user *models.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	query := `
        INSERT INTO users (username, password, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query, user.Username, string(hashedPassword), user.Role).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) Update(id int, updates models.UpdateUserRequest) error {
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	if updates.Username != "" {
		setParts = append(setParts, "username = $"+string(rune(argIndex+48)))
		args = append(args, updates.Username)
		argIndex++
	}

	if updates.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(updates.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		setParts = append(setParts, "password = $"+string(rune(argIndex+48)))
		args = append(args, string(hashedPassword))
		argIndex++
	}

	if updates.Role != "" {
		setParts = append(setParts, "role = $"+string(rune(argIndex+48)))
		args = append(args, updates.Role)
		argIndex++
	}

	if len(setParts) == 0 {
		return nil
	}

	setParts = append(setParts, "updated_at = NOW()")
	args = append(args, id)

	query := "UPDATE users SET " + strings.Join(setParts, ", ") + " WHERE id = $" + string(rune(argIndex+48))
	_, err := r.db.Exec(query, args...)
	return err
}

func (r *UserRepository) Delete(id int) error {
	query := "DELETE FROM users WHERE id = $1"
	_, err := r.db.Exec(query, id)
	return err
}

func (r *UserRepository) CheckPassword(user *models.User, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}
