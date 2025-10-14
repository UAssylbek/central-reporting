package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type UserRole string

const (
	RoleAdmin     UserRole = "admin"
	RoleModerator UserRole = "moderator"
	RoleUser      UserRole = "user"
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

// Список доступных пользователей для модератора
type AccessibleUsers []int

func (a *AccessibleUsers) Scan(value interface{}) error {
	if value == nil {
		*a = AccessibleUsers{}
		return nil
	}

	switch s := value.(type) {
	case []byte:
		return json.Unmarshal(s, a)
	case string:
		return json.Unmarshal([]byte(s), a)
	default:
		return errors.New("cannot scan AccessibleUsers")
	}
}

func (a AccessibleUsers) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "[]", nil
	}
	return json.Marshal(a)
}

// Массив email адресов
type Emails []string

func (e *Emails) Scan(value interface{}) error {
	if value == nil {
		*e = Emails{}
		return nil
	}

	switch s := value.(type) {
	case []byte:
		return json.Unmarshal(s, e)
	case string:
		return json.Unmarshal([]byte(s), e)
	default:
		return errors.New("cannot scan Emails")
	}
}

func (e Emails) Value() (driver.Value, error) {
	if len(e) == 0 {
		return "[]", nil
	}
	return json.Marshal(e)
}

// Массив телефонов
type Phones []string

func (p *Phones) Scan(value interface{}) error {
	if value == nil {
		*p = Phones{}
		return nil
	}

	switch s := value.(type) {
	case []byte:
		return json.Unmarshal(s, p)
	case string:
		return json.Unmarshal([]byte(s), p)
	default:
		return errors.New("cannot scan Phones")
	}
}

func (p Phones) Value() (driver.Value, error) {
	if len(p) == 0 {
		return "[]", nil
	}
	return json.Marshal(p)
}

// Социальные сети
type SocialLinks struct {
	Telegram  string `json:"telegram,omitempty"`
	WhatsApp  string `json:"whatsapp,omitempty"`
	LinkedIn  string `json:"linkedin,omitempty"`
	Facebook  string `json:"facebook,omitempty"`
	Instagram string `json:"instagram,omitempty"`
	Twitter   string `json:"twitter,omitempty"`
}

func (s *SocialLinks) Scan(value interface{}) error {
	if value == nil {
		*s = SocialLinks{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, s)
	case string:
		return json.Unmarshal([]byte(v), s)
	default:
		return errors.New("cannot scan SocialLinks")
	}
}

func (s SocialLinks) Value() (driver.Value, error) {
	return json.Marshal(s)
}

// Кастомные поля (гибкие дополнительные данные)
type CustomFields map[string]interface{}

func (c *CustomFields) Scan(value interface{}) error {
	if value == nil {
		*c = CustomFields{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, c)
	case string:
		return json.Unmarshal([]byte(v), c)
	default:
		return errors.New("cannot scan CustomFields")
	}
}

func (c CustomFields) Value() (driver.Value, error) {
	if len(c) == 0 {
		return "{}", nil
	}
	return json.Marshal(c)
}

// Теги пользователя
type Tags []string

func (t *Tags) Scan(value interface{}) error {
	if value == nil {
		*t = Tags{}
		return nil
	}

	switch s := value.(type) {
	case []byte:
		return json.Unmarshal(s, t)
	case string:
		return json.Unmarshal([]byte(s), t)
	default:
		return errors.New("cannot scan Tags")
	}
}

func (t Tags) Value() (driver.Value, error) {
	if len(t) == 0 {
		return "[]", nil
	}
	return json.Marshal(t)
}

// Nullable строка
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
	case []byte:
		ns.String = string(s)
	case string:
		ns.String = s
	default:
		return errors.New("cannot scan NullString")
	}
	return nil
}

func (ns NullString) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return ns.String, nil
}

// Nullable int
type NullInt struct {
	Int   int
	Valid bool
}

func (ni *NullInt) Scan(value interface{}) error {
	if value == nil {
		ni.Int, ni.Valid = 0, false
		return nil
	}
	ni.Valid = true
	switch v := value.(type) {
	case int64:
		ni.Int = int(v)
	case int:
		ni.Int = v
	default:
		return errors.New("cannot scan NullInt")
	}
	return nil
}

func (ni NullInt) Value() (driver.Value, error) {
	if !ni.Valid {
		return nil, nil
	}
	return ni.Int, nil
}

// Nullable Time
type NullTime struct {
	Time  time.Time
	Valid bool
}

func (nt *NullTime) Scan(value interface{}) error {
	if value == nil {
		nt.Time, nt.Valid = time.Time{}, false
		return nil
	}
	nt.Valid = true
	switch v := value.(type) {
	case time.Time:
		nt.Time = v
	default:
		return errors.New("cannot scan NullTime")
	}
	return nil
}

func (nt NullTime) Value() (driver.Value, error) {
	if !nt.Valid {
		return nil, nil
	}
	return nt.Time, nil
}

// Основная модель User
type User struct {
	ID       int        `json:"id" db:"id"`
	FullName string     `json:"full_name" db:"full_name"`
	Username string     `json:"username" db:"username"`
	Password NullString `json:"-" db:"password"`

	// Аватарка
	AvatarURL NullString `json:"avatar_url" db:"avatar_url"`

	// Настройки доступа
	RequirePasswordChange  bool            `json:"require_password_change" db:"require_password_change"`
	DisablePasswordChange  bool            `json:"disable_password_change" db:"disable_password_change"`
	ShowInSelection        bool            `json:"show_in_selection" db:"show_in_selection"`
	AvailableOrganizations Organizations   `json:"available_organizations" db:"available_organizations"`
	AccessibleUsers        AccessibleUsers `json:"accessible_users" db:"accessible_users"`

	// Контактная информация
	Emails Emails `json:"emails" db:"emails"`
	Phones Phones `json:"phones" db:"phones"`

	// Личная информация
	Position   NullString `json:"position" db:"position"`
	Department NullString `json:"department" db:"department"`
	BirthDate  NullTime   `json:"birth_date" db:"birth_date"`

	// Адрес
	Address    NullString `json:"address" db:"address"`
	City       NullString `json:"city" db:"city"`
	Country    NullString `json:"country" db:"country"`
	PostalCode NullString `json:"postal_code" db:"postal_code"`

	// Социальные сети
	SocialLinks SocialLinks `json:"social_links" db:"social_links"`

	// Рабочие настройки
	Timezone  NullString `json:"timezone" db:"timezone"`
	WorkHours NullString `json:"work_hours" db:"work_hours"`

	// Дополнительные поля
	Comment      NullString   `json:"comment" db:"comment"`
	CustomFields CustomFields `json:"custom_fields" db:"custom_fields"`
	Tags         Tags         `json:"tags" db:"tags"`

	// Статус
	IsActive      bool       `json:"is_active" db:"is_active"`
	BlockedReason NullString `json:"blocked_reason" db:"blocked_reason"`
	BlockedAt     NullTime   `json:"blocked_at" db:"blocked_at"`
	BlockedBy     NullInt    `json:"blocked_by" db:"blocked_by"`

	// Системные поля
	Role         UserRole `json:"role" db:"role"`
	IsFirstLogin bool     `json:"is_first_login" db:"is_first_login"`
	IsOnline     bool     `json:"is_online" db:"is_online"`
	LastSeen     NullTime `json:"last_seen" db:"last_seen"`
	TokenVersion int      `json:"-" db:"token_version"`

	// История изменений
	CreatedBy NullInt   `json:"created_by" db:"created_by"`
	UpdatedBy NullInt   `json:"updated_by" db:"updated_by"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// Request для создания пользователя
type CreateUserRequest struct {
	FullName               string          `json:"full_name" binding:"required"`
	Username               string          `json:"username" binding:"required"`
	Password               string          `json:"password"`
	AvatarURL              string          `json:"avatar_url"`
	RequirePasswordChange  bool            `json:"require_password_change"`
	DisablePasswordChange  bool            `json:"disable_password_change"`
	ShowInSelection        bool            `json:"show_in_selection"`
	AvailableOrganizations Organizations   `json:"available_organizations"`
	AccessibleUsers        AccessibleUsers `json:"accessible_users"`
	Emails                 []string        `json:"emails"`
	Phones                 []string        `json:"phones"`
	Position               string          `json:"position"`
	Department             string          `json:"department"`
	BirthDate              string          `json:"birth_date"` // Формат: "2006-01-02"
	Address                string          `json:"address"`
	City                   string          `json:"city"`
	Country                string          `json:"country"`
	PostalCode             string          `json:"postal_code"`
	SocialLinks            SocialLinks     `json:"social_links"`
	Timezone               string          `json:"timezone"`
	WorkHours              string          `json:"work_hours"`
	Comment                string          `json:"comment"`
	CustomFields           CustomFields    `json:"custom_fields"`
	Tags                   []string        `json:"tags"`
	Role                   UserRole        `json:"role" binding:"required"`
}

// Request для обновления пользователя
type UpdateUserRequest struct {
	FullName               string          `json:"full_name,omitempty"`
	Username               string          `json:"username,omitempty"`
	Password               string          `json:"password,omitempty"`
	AvatarURL              string          `json:"avatar_url,omitempty"`
	ResetPassword          bool            `json:"reset_password,omitempty"`
	RequirePasswordChange  *bool           `json:"require_password_change,omitempty"`
	DisablePasswordChange  *bool           `json:"disable_password_change,omitempty"`
	ShowInSelection        *bool           `json:"show_in_selection,omitempty"`
	AvailableOrganizations Organizations   `json:"available_organizations,omitempty"`
	AccessibleUsers        AccessibleUsers `json:"accessible_users,omitempty"`
	Emails                 []string        `json:"emails,omitempty"`
	Phones                 []string        `json:"phones,omitempty"`
	Position               string          `json:"position,omitempty"`
	Department             string          `json:"department,omitempty"`
	BirthDate              string          `json:"birth_date,omitempty"`
	Address                string          `json:"address,omitempty"`
	City                   string          `json:"city,omitempty"`
	Country                string          `json:"country,omitempty"`
	PostalCode             string          `json:"postal_code,omitempty"`
	SocialLinks            SocialLinks     `json:"social_links,omitempty"`
	Timezone               string          `json:"timezone,omitempty"`
	WorkHours              string          `json:"work_hours,omitempty"`
	Comment                string          `json:"comment,omitempty"`
	CustomFields           CustomFields    `json:"custom_fields,omitempty"`
	Tags                   []string        `json:"tags,omitempty"`
	IsActive               *bool           `json:"is_active,omitempty"`
	BlockedReason          string          `json:"blocked_reason,omitempty"`
	Role                   UserRole        `json:"role,omitempty"`
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
