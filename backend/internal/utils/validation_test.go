package utils

import (
	"strings"
	"testing"
)

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		valid    bool
		errCount int
	}{
		{
			name:     "Valid strong password",
			password: "Test123!@#",
			valid:    true,
			errCount: 0,
		},
		{
			name:     "Valid with special chars",
			password: "MyP@ssw0rd!",
			valid:    true,
			errCount: 0,
		},
		{
			name:     "Too short",
			password: "Test1!",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "No uppercase",
			password: "test123!@#",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "No lowercase",
			password: "TEST123!@#",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "No digits",
			password: "TestTest!@#",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "No special chars",
			password: "TestTest123",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "Too long (129 chars)",
			password: strings.Repeat("A", 121) + "Test123!",
			valid:    false,
			errCount: 1,
		},
		{
			name:     "Empty password",
			password: "",
			valid:    false,
			errCount: 5,
		},
		{
			name:     "Multiple violations",
			password: "test",
			valid:    false,
			errCount: 4, // too short, no uppercase, no digits, no special
		},
		{
			name:     "Exactly 8 chars valid",
			password: "Test12!@",
			valid:    true,
			errCount: 0,
		},
		{
			name:     "Exactly 128 chars valid",
			password: strings.Repeat("A", 120) + "Test12!@",
			valid:    true,
			errCount: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidatePassword(tt.password)

			if result.Valid != tt.valid {
				t.Errorf("ValidatePassword(%q).Valid = %v, want %v",
					tt.password, result.Valid, tt.valid)
			}

			if len(result.Errors) != tt.errCount {
				t.Errorf("ValidatePassword(%q) error count = %d, want %d. Errors: %v",
					tt.password, len(result.Errors), tt.errCount, result.Errors)
			}

			if !result.Valid && result.Message == "" {
				t.Errorf("ValidatePassword(%q) should have a message when invalid", tt.password)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		valid bool
	}{
		{
			name:  "Valid simple email",
			email: "test@example.com",
			valid: true,
		},
		{
			name:  "Valid with subdomain",
			email: "user@mail.example.com",
			valid: true,
		},
		{
			name:  "Valid with plus",
			email: "user+tag@example.com",
			valid: true,
		},
		{
			name:  "Valid with dots",
			email: "first.last@example.com",
			valid: true,
		},
		{
			name:  "Valid with numbers",
			email: "user123@example456.com",
			valid: true,
		},
		{
			name:  "Invalid - no @",
			email: "testexample.com",
			valid: false,
		},
		{
			name:  "Invalid - no domain",
			email: "test@",
			valid: false,
		},
		{
			name:  "Invalid - no local part",
			email: "@example.com",
			valid: false,
		},
		{
			name:  "Invalid - double @",
			email: "test@@example.com",
			valid: false,
		},
		{
			name:  "Invalid - spaces",
			email: "test @example.com",
			valid: false,
		},
		{
			name:  "Invalid - no TLD",
			email: "test@example",
			valid: false,
		},
		{
			name:  "Empty email",
			email: "",
			valid: false,
		},
		{
			name:  "Invalid Cyrillic domain (regex doesn't support)",
			email: "test@example.рф",
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateEmail(tt.email)
			if result != tt.valid {
				t.Errorf("ValidateEmail(%q) = %v, want %v", tt.email, result, tt.valid)
			}
		})
	}
}

func TestValidatePhone(t *testing.T) {
	tests := []struct {
		name  string
		phone string
		valid bool
	}{
		{
			name:  "Valid international format",
			phone: "+77012345678",
			valid: true,
		},
		{
			name:  "Valid US number",
			phone: "+12025551234",
			valid: true,
		},
		{
			name:  "Valid Russian number",
			phone: "+79161234567",
			valid: true,
		},
		{
			name:  "Valid with 15 digits",
			phone: "+123456789012345",
			valid: true,
		},
		{
			name:  "Valid with 10 digits",
			phone: "+1234567890",
			valid: true,
		},
		{
			name:  "Valid without plus (sanitized)",
			phone: "77012345678",
			valid: true,
		},
		{
			name:  "Invalid - too short (9 digits)",
			phone: "+123456789",
			valid: false,
		},
		{
			name:  "Invalid - too long (16 digits)",
			phone: "+1234567890123456",
			valid: false,
		},
		{
			name:  "Invalid - has letters",
			phone: "+7701234ABC8",
			valid: false,
		},
		{
			name:  "Valid with spaces (sanitized)",
			phone: "+7 701 234 5678",
			valid: true,
		},
		{
			name:  "Valid with dashes (sanitized)",
			phone: "+7-701-234-5678",
			valid: true,
		},
		{
			name:  "Empty phone",
			phone: "",
			valid: false,
		},
		{
			name:  "Just plus sign",
			phone: "+",
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidatePhone(tt.phone)
			if result != tt.valid {
				t.Errorf("ValidatePhone(%q) = %v, want %v", tt.phone, result, tt.valid)
			}
		})
	}
}

func TestValidateUsername(t *testing.T) {
	tests := []struct {
		name     string
		username string
		valid    bool
		errMsg   string
	}{
		{
			name:     "Valid simple username",
			username: "user123",
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Valid with underscore",
			username: "user_name",
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Valid with dot",
			username: "user.name",
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Valid with dash",
			username: "user-name",
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Valid minimum length (3 chars)",
			username: "abc",
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Valid maximum length (50 chars)",
			username: strings.Repeat("a", 50),
			valid:    true,
			errMsg:   "",
		},
		{
			name:     "Invalid - too short (2 chars)",
			username: "ab",
			valid:    false,
			errMsg:   "минимум 3 символа",
		},
		{
			name:     "Invalid - too long (51 chars)",
			username: strings.Repeat("a", 51),
			valid:    false,
			errMsg:   "не должен превышать 50",
		},
		{
			name:     "Invalid - has spaces",
			username: "user name",
			valid:    false,
			errMsg:   "только латинские буквы",
		},
		{
			name:     "Invalid - has special chars",
			username: "user@name",
			valid:    false,
			errMsg:   "только латинские буквы",
		},
		{
			name:     "Invalid - Cyrillic",
			username: "пользователь",
			valid:    false,
			errMsg:   "только латинские буквы",
		},
		{
			name:     "Empty username",
			username: "",
			valid:    false,
			errMsg:   "не может быть пустым",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid, errMsg := ValidateUsername(tt.username)

			if valid != tt.valid {
				t.Errorf("ValidateUsername(%q) valid = %v, want %v", tt.username, valid, tt.valid)
			}

			if !tt.valid && errMsg == "" {
				t.Errorf("ValidateUsername(%q) should return error message when invalid", tt.username)
			}

			if !tt.valid && tt.errMsg != "" {
				// Проверяем что сообщение содержит ожидаемую подстроку
				if !contains(errMsg, tt.errMsg) {
					t.Errorf("ValidateUsername(%q) error message = %q, want to contain %q",
						tt.username, errMsg, tt.errMsg)
				}
			}
		})
	}
}

func TestSanitizeString(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Normal string",
			input:    "Hello World",
			expected: "Hello World",
		},
		{
			name:     "String with extra spaces",
			input:    "  Hello   World  ",
			expected: "Hello   World", // Sanitize только trim, не заменяет внутренние пробелы
		},
		{
			name:     "String with tabs",
			input:    "Hello\tWorld",
			expected: "Hello\tWorld", // HTML escaped как &#9;, но не заменяет
		},
		{
			name:     "String with newlines",
			input:    "Hello\nWorld",
			expected: "Hello\nWorld", // HTML escaped как &#10;, но не заменяет
		},
		{
			name:     "Empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "Only spaces",
			input:    "    ",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeString(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeString(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSanitizeEmail(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Normal email",
			input:    "test@example.com",
			expected: "test@example.com",
		},
		{
			name:     "Email with spaces",
			input:    "  test@example.com  ",
			expected: "test@example.com",
		},
		{
			name:     "Uppercase email",
			input:    "TEST@EXAMPLE.COM",
			expected: "test@example.com",
		},
		{
			name:     "Mixed case with spaces",
			input:    "  Test@Example.COM  ",
			expected: "test@example.com",
		},
		{
			name:     "Empty email",
			input:    "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeEmail(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeEmail(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSanitizeUsername(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Normal username",
			input:    "testuser",
			expected: "testuser",
		},
		{
			name:     "Username with spaces",
			input:    "  testuser  ",
			expected: "testuser",
		},
		{
			name:     "Uppercase username",
			input:    "TESTUSER",
			expected: "testuser",
		},
		{
			name:     "Mixed case",
			input:    "TestUser",
			expected: "testuser",
		},
		{
			name:     "Empty username",
			input:    "",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeUsername(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeUsername(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

// Helper function to check if string contains substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(len(s) > 0 && len(substr) > 0 && indexOf(s, substr) >= 0))
}

func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
