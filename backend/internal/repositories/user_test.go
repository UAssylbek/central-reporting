package repositories

import (
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/jmoiron/sqlx"
)

// TestGetByID проверяет получение пользователя по ID
func TestGetByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	// Ожидаемые данные
	expectedUser := models.User{
		ID:       1,
		Username: "testuser",
		FullName: "Test User",
		Role:     models.RoleAdmin,
		IsActive: true,
	}

	rows := sqlmock.NewRows([]string{
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
		WillReturnRows(rows)

	user, err := repo.GetByID(1)
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if user.ID != expectedUser.ID {
		t.Errorf("GetByID() ID = %d, want %d", user.ID, expectedUser.ID)
	}
	if user.Username != expectedUser.Username {
		t.Errorf("GetByID() Username = %s, want %s", user.Username, expectedUser.Username)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestGetByUsername проверяет получение пользователя по username
func TestGetByUsername(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	rows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "password", "avatar_url",
		"require_password_change", "disable_password_change", "show_in_selection",
		"available_organizations", "accessible_users", "emails", "phones",
		"position", "department", "birth_date", "address", "city", "country",
		"postal_code", "social_links", "timezone", "work_hours", "comment",
		"custom_fields", "tags", "is_active", "blocked_reason", "blocked_at",
		"blocked_by", "role", "is_first_login", "is_online", "last_seen",
		"created_by", "updated_by", "created_at", "updated_at", "token_version",
	}).AddRow(
		1, "Test User", "testuser", "$2a$10$hashedpassword", nil,
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
		WillReturnRows(rows)

	user, err := repo.GetByUsername("testuser")
	if err != nil {
		t.Fatalf("GetByUsername() error = %v", err)
	}

	if user == nil {
		t.Fatal("GetByUsername() returned nil user")
	}

	if user.Username != "testuser" {
		t.Errorf("GetByUsername() Username = %s, want testuser", user.Username)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestGetByUsernameNotFound проверяет случай когда пользователь не найден
func TestGetByUsernameNotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE LOWER\\(username\\) = LOWER\\(\\$1\\)").
		WithArgs("nonexistent").
		WillReturnRows(sqlmock.NewRows([]string{}))

	user, err := repo.GetByUsername("nonexistent")
	if err != nil {
		t.Fatalf("GetByUsername() should not return error for not found: %v", err)
	}

	if user != nil {
		t.Error("GetByUsername() should return nil for nonexistent user")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestGetAllPaginatedLight проверяет пагинацию облегченного списка
func TestGetAllPaginatedLight(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	// Mock для COUNT
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(50)
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM users").
		WillReturnRows(countRows)

	// Mock для SELECT пользователей
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "position", "department",
		"role", "is_active", "is_online", "last_seen", "created_at",
		"show_in_selection", "require_password_change",
	}).
		AddRow(1, "User 1", "user1", "", "Developer", "IT", "user", true, false, time.Now(), time.Now(), true, false).
		AddRow(2, "User 2", "user2", "", "Manager", "HR", "moderator", true, true, time.Now(), time.Now(), true, false)

	mock.ExpectQuery("SELECT (.+) FROM users ORDER BY (.+) LIMIT \\$1 OFFSET \\$2").
		WithArgs(20, 0).
		WillReturnRows(userRows)

	params := PaginationParams{
		Page:     1,
		PageSize: 20,
		SortBy:   "created_at",
		SortDesc: true,
	}

	result, err := repo.GetAllPaginatedLight(params)
	if err != nil {
		t.Fatalf("GetAllPaginatedLight() error = %v", err)
	}

	if result.Total != 50 {
		t.Errorf("Total = %d, want 50", result.Total)
	}

	if len(result.Users) != 2 {
		t.Errorf("Got %d users, want 2", len(result.Users))
	}

	if result.TotalPages != 3 {
		t.Errorf("TotalPages = %d, want 3", result.TotalPages)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestIncrementTokenVersion проверяет увеличение версии токена
func TestIncrementTokenVersion(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	mock.ExpectExec("UPDATE users SET token_version = token_version \\+ 1 WHERE id = \\$1").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.IncrementTokenVersion(1)
	if err != nil {
		t.Fatalf("IncrementTokenVersion() error = %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestSetOnlineStatus проверяет установку онлайн статуса
func TestSetOnlineStatus(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	mock.ExpectExec("UPDATE users SET is_online = \\$1, last_seen = \\$2 WHERE id = \\$3").
		WithArgs(true, sqlmock.AnyArg(), 1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.SetOnlineStatus(1, true)
	if err != nil {
		t.Fatalf("SetOnlineStatus() error = %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestDelete проверяет удаление пользователя
func TestDelete(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	mock.ExpectExec("DELETE FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.Delete(1)
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestCanModeratorAccessUser проверяет доступ модератора к пользователю
func TestCanModeratorAccessUser(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	// Mock для получения модератора
	rows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "require_password_change",
		"disable_password_change", "show_in_selection", "available_organizations",
		"accessible_users", "emails", "phones", "position", "department",
		"birth_date", "address", "city", "country", "postal_code", "social_links",
		"timezone", "work_hours", "comment", "custom_fields", "tags", "is_active",
		"blocked_reason", "blocked_at", "blocked_by", "role", "is_first_login",
		"is_online", "last_seen", "created_by", "updated_by", "created_at",
		"updated_at", "token_version",
	}).AddRow(
		1, "Moderator", "moderator", nil, false,
		false, true, `[]`,
		`[5, 10, 15]`, `[]`, `[]`, nil, nil,
		nil, nil, nil, nil, nil, `{}`,
		nil, nil, nil, `{}`, `[]`, true,
		nil, nil, nil, "moderator", false,
		false, time.Now(), nil, nil, time.Now(),
		time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(rows)

	// Проверяем доступ к пользователю 10 (есть в списке)
	canAccess, err := repo.CanModeratorAccessUser(1, 10)
	if err != nil {
		t.Fatalf("CanModeratorAccessUser() error = %v", err)
	}

	if !canAccess {
		t.Error("CanModeratorAccessUser() should return true for accessible user")
	}

	// Mock для проверки доступа к недоступному пользователю
	rows2 := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "require_password_change",
		"disable_password_change", "show_in_selection", "available_organizations",
		"accessible_users", "emails", "phones", "position", "department",
		"birth_date", "address", "city", "country", "postal_code", "social_links",
		"timezone", "work_hours", "comment", "custom_fields", "tags", "is_active",
		"blocked_reason", "blocked_at", "blocked_by", "role", "is_first_login",
		"is_online", "last_seen", "created_by", "updated_by", "created_at",
		"updated_at", "token_version",
	}).AddRow(
		1, "Moderator", "moderator", nil, false,
		false, true, `[]`,
		`[5, 10, 15]`, `[]`, `[]`, nil, nil,
		nil, nil, nil, nil, nil, `{}`,
		nil, nil, nil, `{}`, `[]`, true,
		nil, nil, nil, "moderator", false,
		false, time.Now(), nil, nil, time.Now(),
		time.Now(), 1,
	)

	mock.ExpectQuery("SELECT (.+) FROM users WHERE id = \\$1").
		WithArgs(1).
		WillReturnRows(rows2)

	// Проверяем доступ к пользователю 99 (нет в списке)
	canAccess, err = repo.CanModeratorAccessUser(1, 99)
	if err != nil {
		t.Fatalf("CanModeratorAccessUser() error = %v", err)
	}

	if canAccess {
		t.Error("CanModeratorAccessUser() should return false for inaccessible user")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestMarkOfflineInactiveUsers проверяет пометку неактивных пользователей как оффлайн
func TestMarkOfflineInactiveUsers(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	mock.ExpectExec("UPDATE users SET is_online = false WHERE is_online = true AND last_seen < \\$1").
		WithArgs(sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(0, 3))

	err = repo.MarkOfflineInactiveUsers(5)
	if err != nil {
		t.Fatalf("MarkOfflineInactiveUsers() error = %v", err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestPaginationParamsDefaults проверяет дефолтные значения пагинации
func TestPaginationParamsDefaults(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	// Mock для COUNT
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(0)
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM users").
		WillReturnRows(countRows)

	// Mock для SELECT (пустой результат)
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "position", "department",
		"role", "is_active", "is_online", "last_seen", "created_at",
		"show_in_selection", "require_password_change",
	})

	mock.ExpectQuery("SELECT (.+) FROM users ORDER BY created_at ASC LIMIT \\$1 OFFSET \\$2").
		WithArgs(20, 0).
		WillReturnRows(userRows)

	// Передаем пустые параметры (SortDesc по умолчанию false = ASC)
	params := PaginationParams{}

	result, err := repo.GetAllPaginatedLight(params)
	if err != nil {
		t.Fatalf("GetAllPaginatedLight() error = %v", err)
	}

	// Проверяем что применились дефолтные значения
	if result.Page != 1 {
		t.Errorf("Default page = %d, want 1", result.Page)
	}
	if result.PageSize != 20 {
		t.Errorf("Default page_size = %d, want 20", result.PageSize)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestPaginationMaxPageSize проверяет ограничение максимального размера страницы
func TestPaginationMaxPageSize(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer db.Close()

	sqlxDB := sqlx.NewDb(db, "postgres")
	repo := NewUserRepository(sqlxDB)

	// Mock для COUNT
	countRows := sqlmock.NewRows([]string{"count"}).AddRow(0)
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM users").
		WillReturnRows(countRows)

	// Mock для SELECT - ожидаем что PageSize будет ограничен до 20 (не 200)
	userRows := sqlmock.NewRows([]string{
		"id", "full_name", "username", "avatar_url", "position", "department",
		"role", "is_active", "is_online", "last_seen", "created_at",
		"show_in_selection", "require_password_change",
	})

	mock.ExpectQuery("SELECT (.+) FROM users ORDER BY created_at DESC LIMIT \\$1 OFFSET \\$2").
		WithArgs(20, 0).
		WillReturnRows(userRows)

	// Пытаемся запросить 200 элементов (больше максимума)
	params := PaginationParams{
		Page:     1,
		PageSize: 200, // Превышает максимум
		SortBy:   "created_at",
		SortDesc: true,
	}

	result, err := repo.GetAllPaginatedLight(params)
	if err != nil {
		t.Fatalf("GetAllPaginatedLight() error = %v", err)
	}

	// Проверяем что PageSize был ограничен
	if result.PageSize != 20 {
		t.Errorf("PageSize = %d, want 20 (should be capped)", result.PageSize)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}
