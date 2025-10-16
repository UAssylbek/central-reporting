package utils

import (
	"html"
	"strings"
)

// SanitizeString очищает строку от опасных символов
func SanitizeString(s string) string {
	// Удаляем HTML теги
	s = html.EscapeString(s)
	// Убираем лишние пробелы
	s = strings.TrimSpace(s)
	return s
}

// SanitizeUsername очищает username
func SanitizeUsername(username string) string {
	// Убираем пробелы и приводим к нижнему регистру
	username = strings.ToLower(strings.TrimSpace(username))
	// Удаляем всё кроме букв, цифр, точек, подчёркиваний, дефисов
	var result strings.Builder
	for _, r := range username {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '_' || r == '-' {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// SanitizeEmail простая очистка email
func SanitizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
