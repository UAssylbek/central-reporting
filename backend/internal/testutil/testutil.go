package testutil

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// SetupTestDB создает тестовую базу данных
func SetupTestDB(t *testing.T) *sqlx.DB {
	// Используем отдельную тестовую БД
	dsn := "host=localhost port=5432 user=postgres password=postgres dbname=central_reporting_test sslmode=disable"

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Очищаем таблицы перед тестами
	CleanupTestDB(t, db)

	return db
}

// CleanupTestDB очищает все таблицы в тестовой БД
func CleanupTestDB(t *testing.T, db *sqlx.DB) {
	_, err := db.Exec("TRUNCATE TABLE users RESTART IDENTITY CASCADE")
	if err != nil {
		log.Printf("Warning: Failed to truncate users table: %v", err)
	}
}

// CreateTestUser создает тестового пользователя в БД
func CreateTestUser(t *testing.T, db *sqlx.DB, username, password, role string) int {
	query := `
		INSERT INTO users (full_name, username, password, role, is_active, show_in_selection)
		VALUES ($1, $2, $3, $4, true, true)
		RETURNING id
	`

	var userID int
	err := db.QueryRow(query, "Test "+username, username, password, role).Scan(&userID)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	return userID
}

// NullString создает sql.NullString
func NullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// NullInt создает sql.NullInt64
func NullInt(i int) sql.NullInt64 {
	if i == 0 {
		return sql.NullInt64{Valid: false}
	}
	return sql.NullInt64{Int64: int64(i), Valid: true}
}

// AssertEqual проверяет равенство значений
func AssertEqual(t *testing.T, expected, actual interface{}, message string) {
	if expected != actual {
		t.Errorf("%s: expected %v, got %v", message, expected, actual)
	}
}

// AssertNotNil проверяет что значение не nil
func AssertNotNil(t *testing.T, value interface{}, message string) {
	if value == nil {
		t.Errorf("%s: expected non-nil value", message)
	}
}

// AssertNil проверяет что значение nil
func AssertNil(t *testing.T, value interface{}, message string) {
	if value != nil {
		t.Errorf("%s: expected nil, got %v", message, value)
	}
}

// AssertNoError проверяет отсутствие ошибки
func AssertNoError(t *testing.T, err error, message string) {
	if err != nil {
		t.Errorf("%s: unexpected error: %v", message, err)
	}
}

// AssertError проверяет наличие ошибки
func AssertError(t *testing.T, err error, message string) {
	if err == nil {
		t.Errorf("%s: expected error, got nil", message)
	}
}

// AssertContains проверяет что строка содержит подстроку
func AssertContains(t *testing.T, str, substr, message string) {
	if str == "" || substr == "" {
		t.Errorf("%s: empty string provided", message)
		return
	}

	found := false
	for i := 0; i <= len(str)-len(substr); i++ {
		if str[i:i+len(substr)] == substr {
			found = true
			break
		}
	}

	if !found {
		t.Errorf("%s: '%s' does not contain '%s'", message, str, substr)
	}
}

// GetTestDBConfig возвращает конфигурацию для тестовой БД
func GetTestDBConfig() string {
	return "host=localhost port=5432 user=postgres password=postgres dbname=central_reporting_test sslmode=disable"
}

// SkipIfShort пропускает тест если запущен с -short
func SkipIfShort(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping test in short mode")
	}
}

// PrintTestSeparator печатает разделитель для читаемости логов
func PrintTestSeparator(testName string) {
	separator := strings.Repeat("=", 60)
	fmt.Println("\n" + separator)
	fmt.Printf("  TEST: %s\n", testName)
	fmt.Println(separator + "\n")
}
