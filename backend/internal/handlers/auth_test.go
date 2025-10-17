package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

const testJWTSecret = "test-secret-key-for-auth-testing"

func setupAuthTest(t *testing.T) (*gin.Engine, *AuthHandler, sqlmock.Sqlmock) {
	gin.SetMode(gin.TestMode)

	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}

	sqlxDB := sqlx.NewDb(db, "postgres")
	userRepo := repositories.NewUserRepository(sqlxDB)
	authHandler := NewAuthHandler(userRepo, testJWTSecret)

	router := gin.New()
	router.POST("/login", authHandler.Login)
	router.POST("/logout", func(c *gin.Context) {
		c.Set("user_id", 1)
		authHandler.Logout(c)
	})
	router.POST("/change-password", func(c *gin.Context) {
		c.Set("user_id", 1)
		authHandler.ChangePassword(c)
	})
	router.GET("/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		authHandler.Me(c)
	})

	return router, authHandler, mock
}

func TestLogin_Success(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	// Hash пароля для тестов
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("TestPass123!"), bcrypt.DefaultCost)

	// Mock для GetByUsername
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(hashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, true, nil, nil,
		nil, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE LOWER\\(username\\) = LOWER\\(\\$1\\)").
		WithArgs("testuser").
		WillReturnRows(userRows)

	// Mock для GetByIDWithPassword (для CheckPassword)
	userRows2 := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(hashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, true, nil, nil,
		nil, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(userRows2)

	// Mock для UpdateUserActivity
	mock.ExpectExec("UPDATE users SET is_online = true, last_seen = (.+) WHERE id = \\$2").
		WithArgs(sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	// Запрос
	loginReq := models.LoginRequest{
		Username: "testuser",
		Password: "TestPass123!",
	}
	body, _ := json.Marshal(loginReq)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var response models.LoginResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Token == "" {
		t.Error("Token should not be empty")
	}

	if response.User.Username != "testuser" {
		t.Errorf("Username = %s, want testuser", response.User.Username)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	// Mock для GetByUsername - возвращаем пустой результат
	mock.ExpectQuery("SELECT (.+) FROM users WHERE LOWER\\(username\\) = LOWER\\(\\$1\\)").
		WithArgs("nonexistent").
		WillReturnRows(sqlmock.NewRows([]string{}))

	loginReq := models.LoginRequest{
		Username: "nonexistent",
		Password: "password",
	}
	body, _ := json.Marshal(loginReq)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestLogin_BlockedUser(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("TestPass123!"), bcrypt.DefaultCost)

	// Mock для заблокированного пользователя
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(hashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, false, "Account suspended", time.Now(), // is_active = false
		1, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE LOWER\\(username\\) = LOWER\\(\\$1\\)").
		WithArgs("testuser").
		WillReturnRows(userRows)

	loginReq := models.LoginRequest{
		Username: "testuser",
		Password: "TestPass123!",
	}
	body, _ := json.Marshal(loginReq)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("Expected status 403, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["blocked"] != true {
		t.Error("Response should indicate user is blocked")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("CorrectPass123!"), bcrypt.DefaultCost)

	// Mock для GetByUsername
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(hashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, true, nil, nil,
		nil, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE LOWER\\(username\\) = LOWER\\(\\$1\\)").
		WithArgs("testuser").
		WillReturnRows(userRows)

	// Mock для GetByIDWithPassword
	userRows2 := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(hashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, true, nil, nil,
		nil, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(userRows2)

	loginReq := models.LoginRequest{
		Username: "testuser",
		Password: "WrongPass123!", // Неправильный пароль
	}
	body, _ := json.Marshal(loginReq)

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestLogout(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	// Mock для SetUserOffline
	mock.ExpectExec("UPDATE users SET is_online = \\$1, last_seen = \\$2 WHERE id = \\$3").
		WithArgs(false, sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	req, _ := http.NewRequest("POST", "/logout", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestChangePassword_Success(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	oldHashedPassword, _ := bcrypt.GenerateFromPassword([]byte("OldPass123!"), bcrypt.DefaultCost)

	// Mock для GetByID
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "require_password_change",
		"disable_password_change", "show_in_selection", "available_organizations",
		"accessible_users", "emails", "phones", "position", "department",
		"birth_date", "address", "city", "country", "postal_code", "social_links",
		"timezone", "work_hours", "comment", "custom_fields", "tags", "is_active",
		"blocked_reason", "blocked_at", "blocked_by", "role", "is_first_login",
		"is_online", "last_seen", "created_by", "updated_by", "created_at",
		"updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", nil, false,
		false, true, `[]`,
		`[]`, `[]`, `[]`, nil, nil,
		nil, nil, nil, nil, nil, `{}`,
		nil, nil, nil, `{}`, `[]`, true,
		nil, nil, nil, "admin", false,
		false, time.Now(), nil, nil, time.Now(),
		time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(userRows)

	// Mock для GetByIDWithPassword (CheckPassword)
	userRows2 := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", string(oldHashedPassword), nil,
		false, false, true,
		`[]`, `[]`, `[]`, `[]`,
		nil, nil, nil, nil, nil, nil,
		nil, `{}`, nil, nil, nil,
		`{}`, `[]`, true, nil, nil,
		nil, "admin", false, false, time.Now(),
		nil, nil, time.Now(), time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(userRows2)

	// Mock для ChangePassword
	mock.ExpectExec("UPDATE users SET password = \\$1, require_password_change = false, is_first_login = false, token_version = token_version \\+ 1 WHERE id = \\$2").
		WithArgs(sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	changeReq := models.ChangePasswordRequest{
		OldPassword:     "OldPass123!",
		NewPassword:     "NewPass456!",
		ConfirmPassword: "NewPass456!",
	}
	body, _ := json.Marshal(changeReq)

	req, _ := http.NewRequest("POST", "/change-password", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestChangePassword_PasswordMismatch(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	changeReq := models.ChangePasswordRequest{
		OldPassword:     "OldPass123!",
		NewPassword:     "NewPass456!",
		ConfirmPassword: "DifferentPass456!", // Не совпадает
	}
	body, _ := json.Marshal(changeReq)

	req, _ := http.NewRequest("POST", "/change-password", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if response["error"] != "Пароли не совпадают" {
		t.Errorf("Expected password mismatch error, got: %v", response["error"])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestChangePassword_WeakPassword(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	changeReq := models.ChangePasswordRequest{
		OldPassword:     "OldPass123!",
		NewPassword:     "weak", // Слабый пароль
		ConfirmPassword: "weak",
	}
	body, _ := json.Marshal(changeReq)

	req, _ := http.NewRequest("POST", "/change-password", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	// Проверяем что есть ошибка валидации
	if response["error"] == nil && response["errors"] == nil {
		t.Errorf("Expected validation errors for weak password, got response: %v", response)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

func TestMe(t *testing.T) {
	router, _, mock := setupAuthTest(t)

	// Mock для GetByID
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "require_password_change",
		"disable_password_change", "show_in_selection", "available_organizations",
		"accessible_users", "emails", "phones", "position", "department",
		"birth_date", "address", "city", "country", "postal_code", "social_links",
		"timezone", "work_hours", "comment", "custom_fields", "tags", "is_active",
		"blocked_reason", "blocked_at", "blocked_by", "role", "is_first_login",
		"is_online", "last_seen", "created_by", "updated_by", "created_at",
		"updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", nil, false,
		false, true, `[]`,
		`[]`, `[]`, `[]`, nil, nil,
		nil, nil, nil, nil, nil, `{}`,
		nil, nil, nil, `{}`, `[]`, true,
		nil, nil, nil, "admin", false,
		false, time.Now(), nil, nil, time.Now(),
		time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(userRows)

	req, _ := http.NewRequest("GET", "/me", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	user := response["user"].(map[string]interface{})
	if user["username"] != "testuser" {
		t.Errorf("Expected username 'testuser', got %v", user["username"])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}
