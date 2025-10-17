package auth

import (
	"testing"
	"time"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

const testSecret = "test-secret-key-for-testing-12345"

func TestGenerateToken(t *testing.T) {
	user := models.User{
		ID:           1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	token, err := GenerateToken(user, testSecret)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v, want nil", err)
	}

	if token == "" {
		t.Error("GenerateToken() returned empty token")
	}

	// Проверяем что токен валидный
	claims, err := ValidateToken(token, testSecret)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v, want nil", err)
	}

	// Проверяем claims
	if claims.UserID != user.ID {
		t.Errorf("claims.UserID = %d, want %d", claims.UserID, user.ID)
	}
	if claims.Username != user.Username {
		t.Errorf("claims.Username = %s, want %s", claims.Username, user.Username)
	}
	if claims.FullName != user.FullName {
		t.Errorf("claims.FullName = %s, want %s", claims.FullName, user.FullName)
	}
	if claims.Role != user.Role {
		t.Errorf("claims.Role = %s, want %s", claims.Role, user.Role)
	}
	if claims.TokenVersion != user.TokenVersion {
		t.Errorf("claims.TokenVersion = %d, want %d", claims.TokenVersion, user.TokenVersion)
	}
}

func TestGenerateTokenDifferentRoles(t *testing.T) {
	roles := []models.UserRole{
		models.RoleAdmin,
		models.RoleModerator,
		models.RoleUser,
	}

	for _, role := range roles {
		t.Run(string(role), func(t *testing.T) {
			user := models.User{
				ID:           1,
				Username:     "testuser",
				FullName:     "Test User",
				Role:         role,
				TokenVersion: 1,
			}

			token, err := GenerateToken(user, testSecret)
			if err != nil {
				t.Fatalf("GenerateToken() error = %v, want nil", err)
			}

			claims, err := ValidateToken(token, testSecret)
			if err != nil {
				t.Fatalf("ValidateToken() error = %v, want nil", err)
			}

			if claims.Role != role {
				t.Errorf("claims.Role = %s, want %s", claims.Role, role)
			}
		})
	}
}

func TestValidateToken(t *testing.T) {
	user := models.User{
		ID:           123,
		Username:     "validuser",
		FullName:     "Valid User",
		Role:         models.RoleModerator,
		TokenVersion: 5,
	}

	token, _ := GenerateToken(user, testSecret)

	claims, err := ValidateToken(token, testSecret)
	if err != nil {
		t.Fatalf("ValidateToken() error = %v, want nil", err)
	}

	if claims == nil {
		t.Fatal("ValidateToken() returned nil claims")
	}

	// Проверяем все поля
	if claims.UserID != user.ID {
		t.Errorf("UserID = %d, want %d", claims.UserID, user.ID)
	}
	if claims.Username != user.Username {
		t.Errorf("Username = %s, want %s", claims.Username, user.Username)
	}
	if claims.FullName != user.FullName {
		t.Errorf("FullName = %s, want %s", claims.FullName, user.FullName)
	}
	if claims.Role != user.Role {
		t.Errorf("Role = %s, want %s", claims.Role, user.Role)
	}
	if claims.TokenVersion != user.TokenVersion {
		t.Errorf("TokenVersion = %d, want %d", claims.TokenVersion, user.TokenVersion)
	}

	// Проверяем что есть ExpiresAt и IssuedAt
	if claims.ExpiresAt == nil {
		t.Error("ExpiresAt is nil")
	}
	if claims.IssuedAt == nil {
		t.Error("IssuedAt is nil")
	}

	// Проверяем что токен действителен в течение ~24 часов
	if claims.ExpiresAt != nil {
		expiresIn := time.Until(claims.ExpiresAt.Time)
		if expiresIn < 23*time.Hour || expiresIn > 25*time.Hour {
			t.Errorf("Token expires in %v, want ~24 hours", expiresIn)
		}
	}
}

func TestValidateTokenInvalidSecret(t *testing.T) {
	user := models.User{
		ID:           1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	token, _ := GenerateToken(user, testSecret)

	// Пытаемся валидировать с неправильным секретом
	_, err := ValidateToken(token, "wrong-secret-key")
	if err == nil {
		t.Error("ValidateToken() with wrong secret should return error")
	}
}

func TestValidateTokenInvalidFormat(t *testing.T) {
	tests := []struct {
		name  string
		token string
	}{
		{
			name:  "Empty token",
			token: "",
		},
		{
			name:  "Random string",
			token: "this-is-not-a-valid-jwt-token",
		},
		{
			name:  "Malformed JWT",
			token: "header.payload",
		},
		{
			name:  "Invalid base64",
			token: "invalid.base64.signature",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ValidateToken(tt.token, testSecret)
			if err == nil {
				t.Errorf("ValidateToken(%q) should return error for invalid token", tt.token)
			}
		})
	}
}

func TestValidateTokenExpired(t *testing.T) {
	// Создаем токен с истекшим сроком действия
	claims := Claims{
		UserID:       1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Истек час назад
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-25 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(testSecret))

	_, err := ValidateToken(tokenString, testSecret)
	if err == nil {
		t.Error("ValidateToken() should return error for expired token")
	}
}

func TestTokenVersionCheck(t *testing.T) {
	// Создаем два токена с разными версиями
	user1 := models.User{
		ID:           1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	user2 := models.User{
		ID:           1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 2, // Увеличенная версия
	}

	token1, _ := GenerateToken(user1, testSecret)
	token2, _ := GenerateToken(user2, testSecret)

	claims1, _ := ValidateToken(token1, testSecret)
	claims2, _ := ValidateToken(token2, testSecret)

	if claims1.TokenVersion != 1 {
		t.Errorf("claims1.TokenVersion = %d, want 1", claims1.TokenVersion)
	}

	if claims2.TokenVersion != 2 {
		t.Errorf("claims2.TokenVersion = %d, want 2", claims2.TokenVersion)
	}

	// В реальном приложении сервер должен проверять что TokenVersion в claims
	// соответствует текущей версии в БД
}

func TestGenerateMultipleTokens(t *testing.T) {
	user := models.User{
		ID:           1,
		Username:     "testuser",
		FullName:     "Test User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	// Генерируем несколько токенов
	tokens := make([]string, 5)
	for i := 0; i < 5; i++ {
		token, err := GenerateToken(user, testSecret)
		if err != nil {
			t.Fatalf("GenerateToken() error = %v", err)
		}
		tokens[i] = token

		// Небольшая задержка чтобы IssuedAt был разным
		time.Sleep(10 * time.Millisecond)
	}

	// Все токены должны быть валидными
	for i, token := range tokens {
		claims, err := ValidateToken(token, testSecret)
		if err != nil {
			t.Errorf("Token %d: ValidateToken() error = %v", i, err)
		}
		if claims.UserID != user.ID {
			t.Errorf("Token %d: UserID = %d, want %d", i, claims.UserID, user.ID)
		}
	}
}

func TestClaimsStructure(t *testing.T) {
	user := models.User{
		ID:           999,
		Username:     "structuretest",
		FullName:     "Structure Test User",
		Role:         models.RoleUser,
		TokenVersion: 10,
	}

	token, _ := GenerateToken(user, testSecret)
	claims, _ := ValidateToken(token, testSecret)

	// Проверяем что все обязательные поля заполнены
	if claims.UserID == 0 {
		t.Error("UserID should not be zero")
	}
	if claims.Username == "" {
		t.Error("Username should not be empty")
	}
	if claims.FullName == "" {
		t.Error("FullName should not be empty")
	}
	if claims.Role == "" {
		t.Error("Role should not be empty")
	}
	if claims.TokenVersion == 0 {
		t.Error("TokenVersion should not be zero")
	}
	if claims.ExpiresAt == nil {
		t.Error("ExpiresAt should not be nil")
	}
	if claims.IssuedAt == nil {
		t.Error("IssuedAt should not be nil")
	}
}

func BenchmarkGenerateToken(b *testing.B) {
	user := models.User{
		ID:           1,
		Username:     "benchuser",
		FullName:     "Benchmark User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = GenerateToken(user, testSecret)
	}
}

func BenchmarkValidateToken(b *testing.B) {
	user := models.User{
		ID:           1,
		Username:     "benchuser",
		FullName:     "Benchmark User",
		Role:         models.RoleAdmin,
		TokenVersion: 1,
	}

	token, _ := GenerateToken(user, testSecret)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = ValidateToken(token, testSecret)
	}
}
