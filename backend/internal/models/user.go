package models

import (
    "time"
)

type UserRole string

const (
    RoleAdmin UserRole = "admin"
    RoleUser  UserRole = "user"
)

type User struct {
    ID        int       `json:"id" db:"id"`
    Username  string    `json:"username" db:"username"`
    Password  string    `json:"-" db:"password"`
    Role      UserRole  `json:"role" db:"role"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserRequest struct {
    Username string   `json:"username" binding:"required,min=3"`
    Password string   `json:"password" binding:"required,min=6"`
    Role     UserRole `json:"role" binding:"required,oneof=admin user"`
}

type UpdateUserRequest struct {
    Username string   `json:"username,omitempty" binding:"omitempty,min=3"`
    Password string   `json:"password,omitempty" binding:"omitempty,min=6"`
    Role     UserRole `json:"role,omitempty" binding:"omitempty,oneof=admin user"`
}

type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
    User  User   `json:"user"`
    Token string `json:"token"`
}