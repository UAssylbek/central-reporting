package utils

import (
	"fmt"
	"regexp"
	"unicode"
)

// PasswordValidationResult содержит результат валидации пароля
type PasswordValidationResult struct {
	Valid   bool
	Message string
	Errors  []string
}

// ValidatePassword проверяет пароль на соответствие требованиям безопасности
func ValidatePassword(password string) PasswordValidationResult {
	result := PasswordValidationResult{
		Valid:  true,
		Errors: []string{},
	}

	// Минимальная длина 8 символов
	if len(password) < 8 {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль должен содержать минимум 8 символов")
	}

	// Максимальная длина 128 символов (защита от DoS)
	if len(password) > 128 {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль не должен превышать 128 символов")
	}

	// Проверка на наличие заглавных букв
	hasUpper := false
	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
			break
		}
	}
	if !hasUpper {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль должен содержать хотя бы одну заглавную букву")
	}

	// Проверка на наличие строчных букв
	hasLower := false
	for _, char := range password {
		if unicode.IsLower(char) {
			hasLower = true
			break
		}
	}
	if !hasLower {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль должен содержать хотя бы одну строчную букву")
	}

	// Проверка на наличие цифр
	hasDigit := false
	for _, char := range password {
		if unicode.IsDigit(char) {
			hasDigit = true
			break
		}
	}
	if !hasDigit {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль должен содержать хотя бы одну цифру")
	}

	// Проверка на наличие специальных символов
	specialChars := `!@#$%^&*()_+-=[]{}|;:'",.<>?/\` + "`~"
	hasSpecial := false
	for _, char := range password {
		for _, special := range specialChars {
			if char == special {
				hasSpecial = true
				break
			}
		}
		if hasSpecial {
			break
		}
	}
	if !hasSpecial {
		result.Valid = false
		result.Errors = append(result.Errors, "Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)")
	}

	// Формируем итоговое сообщение
	if !result.Valid {
		result.Message = "Пароль не соответствует требованиям безопасности"
	} else {
		result.Message = "Пароль соответствует требованиям безопасности"
	}

	return result
}

// ValidateEmail проверяет корректность email адреса
func ValidateEmail(email string) bool {
	if email == "" {
		return false
	}
	// RFC 5322 simplified regex
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// ValidatePhone проверяет корректность номера телефона
func ValidatePhone(phone string) bool {
	if phone == "" {
		return false
	}
	// Поддержка международных форматов: +7, +1, и т.д.
	// Формат: +[код страны][номер], минимум 10 цифр, максимум 15
	phoneRegex := regexp.MustCompile(`^\+?[1-9]\d{9,14}$`)
	// Убираем все не-цифры кроме +
	cleanPhone := regexp.MustCompile(`[^\d+]`).ReplaceAllString(phone, "")
	return phoneRegex.MatchString(cleanPhone)
}

// ValidateUsername проверяет корректность username
func ValidateUsername(username string) (bool, string) {
	if username == "" {
		return false, "Логин не может быть пустым"
	}

	if len(username) < 3 {
		return false, "Логин должен содержать минимум 3 символа"
	}

	if len(username) > 50 {
		return false, "Логин не должен превышать 50 символов"
	}

	// Только латинские буквы, цифры, точки, дефисы и подчеркивания
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)
	if !usernameRegex.MatchString(username) {
		return false, "Логин может содержать только латинские буквы, цифры, точки, дефисы и подчеркивания"
	}

	return true, ""
}

// FormatValidationErrors форматирует список ошибок валидации в строку
func FormatValidationErrors(errors []string) string {
	if len(errors) == 0 {
		return ""
	}
	if len(errors) == 1 {
		return errors[0]
	}

	result := "Ошибки валидации:\n"
	for i, err := range errors {
		result += fmt.Sprintf("%d. %s\n", i+1, err)
	}
	return result
}
