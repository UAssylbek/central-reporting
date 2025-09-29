package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

// Список доступных организаций как JSON массив
type Organizations []int

func (o *Organizations) Scan(value interface{}) error {
	if value == nil {
		*o = Organizations{}
		return nil
	}

	switch s := value.(type) {
	case []byte:
		return json.Unmarshal(s, o)
	case string:
		return json.Unmarshal([]byte(s), o)
	default:
		return errors.New("cannot scan Organizations")
	}
}

func (o Organizations) Value() (driver.Value, error) {
	if len(o) == 0 {
		return "[]", nil
	}
	return json.Marshal(o)
}

// Добавляем тип для nullable строк
type NullString struct {
	String string
	Valid  bool
}

func (ns *NullString) Scan(value interface{}) error {
	if value == nil {
		ns.String, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	switch s := value.(type) {
	case string:
		ns.String = s
	case []byte:
		ns.String = string(s)
	default:
		ns.String = ""
		ns.Valid = false
	}
	return nil
}

func (ns NullString) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return ns.String, nil
}

// Методы для JSON сериализации
func (ns NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte(`""`), nil
	}
	return json.Marshal(ns.String)
}

func (ns *NullString) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	ns.String = s
	ns.Valid = s != ""
	return nil
}

type User struct {
	ID                     int           `json:"id" db:"id"`
	FullName               string        `json:"full_name" db:"full_name"`
	Username               string        `json:"username" db:"username"`
	Password               NullString    `json:"-" db:"password"`
	RequirePasswordChange  bool          `json:"require_password_change" db:"require_password_change"`
	DisablePasswordChange  bool          `json:"disable_password_change" db:"disable_password_change"`
	ShowInSelection        bool          `json:"show_in_selection" db:"show_in_selection"`
	AvailableOrganizations Organizations `json:"available_organizations" db:"available_organizations"`
	Email                  NullString    `json:"email" db:"email"`
	Phone                  NullString    `json:"phone" db:"phone"`
	AdditionalEmail        NullString    `json:"additional_email" db:"additional_email"`
	Comment                NullString    `json:"comment" db:"comment"`
	Role                   UserRole      `json:"role" db:"role"`
	IsFirstLogin           bool          `json:"is_first_login" db:"is_first_login"`
	CreatedAt              time.Time     `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time     `json:"updated_at" db:"updated_at"`
	IsOnline               bool          `json:"is_online" db:"is_online"`
	LastSeen               time.Time     `json:"last_seen" db:"last_seen"`
}

type CreateUserRequest struct {
	FullName               string        `json:"full_name" binding:"required,min=2"`
	Username               string        `json:"username" binding:"required,min=3"`
	Password               string        `json:"password,omitempty"`
	RequirePasswordChange  bool          `json:"require_password_change"`
	DisablePasswordChange  bool          `json:"disable_password_change"`
	ShowInSelection        bool          `json:"show_in_selection"`
	AvailableOrganizations Organizations `json:"available_organizations"`
	Email                  string        `json:"email,omitempty"`
	Phone                  string        `json:"phone,omitempty"`
	AdditionalEmail        string        `json:"additional_email,omitempty"`
	Comment                string        `json:"comment,omitempty"`
	Role                   UserRole      `json:"role" binding:"required,oneof=admin user"`
}

type UpdateUserRequest struct {
	FullName               string        `json:"full_name,omitempty" binding:"omitempty,min=2"`
	Username               string        `json:"username,omitempty" binding:"omitempty,min=3"`
	Password               string        `json:"password,omitempty"`
	RequirePasswordChange  *bool         `json:"require_password_change,omitempty"`
	DisablePasswordChange  *bool         `json:"disable_password_change,omitempty"`
	ShowInSelection        *bool         `json:"show_in_selection,omitempty"`
	AvailableOrganizations Organizations `json:"available_organizations,omitempty"`
	Email                  string        `json:"email,omitempty"`
	Phone                  string        `json:"phone,omitempty"`
	AdditionalEmail        string        `json:"additional_email,omitempty"`
	Comment                string        `json:"comment,omitempty"`
	Role                   UserRole      `json:"role,omitempty" binding:"omitempty,oneof=admin user"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User                  User   `json:"user"`
	Token                 string `json:"token"`
	RequirePasswordChange bool   `json:"require_password_change"`
}

type ChangePasswordRequest struct {
	OldPassword     string `json:"old_password"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}
