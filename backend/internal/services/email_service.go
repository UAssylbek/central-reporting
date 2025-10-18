// backend/internal/services/email_service.go
package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
)

// EmailService предоставляет функциональность отправки email
type EmailService struct {
	smtpHost     string
	smtpPort     string
	smtpUsername string
	smtpPassword string
	fromEmail    string
	fromName     string
}

// NewEmailService создает новый экземпляр EmailService
func NewEmailService() *EmailService {
	return &EmailService{
		smtpHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		smtpPort:     getEnv("SMTP_PORT", "587"),
		smtpUsername: getEnv("SMTP_USERNAME", ""),
		smtpPassword: getEnv("SMTP_PASSWORD", ""),
		fromEmail:    getEnv("SMTP_FROM_EMAIL", "noreply@central-reporting.kz"),
		fromName:     getEnv("SMTP_FROM_NAME", "Central Reporting"),
	}
}

// SendPasswordResetEmail отправляет email со ссылкой для сброса пароля
func (s *EmailService) SendPasswordResetEmail(toEmail, username, resetToken string) error {
	// Формируем ссылку для сброса пароля
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:3000")
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, resetToken)

	// Формируем тело письма
	subject := "Восстановление пароля - Central Reporting"
	body := fmt.Sprintf(`
Здравствуйте, %s!

Вы получили это письмо, потому что был запрошен сброс пароля для вашего аккаунта в системе Central Reporting.

Чтобы установить новый пароль, перейдите по следующей ссылке:
%s

Ссылка действительна в течение 1 часа.

Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.

---
С уважением,
Команда Central Reporting
`, username, resetLink)

	return s.sendEmail(toEmail, subject, body)
}

// sendEmail отправляет email с использованием SMTP
func (s *EmailService) sendEmail(to, subject, body string) error {
	// Проверяем, настроен ли SMTP
	if s.smtpUsername == "" || s.smtpPassword == "" {
		log.Printf("SMTP not configured. Email would be sent to: %s", to)
		log.Printf("Subject: %s", subject)
		log.Printf("Body:\n%s", body)
		log.Println("========================================")
		return nil // В режиме разработки не отправляем реальные письма
	}

	// Формируем заголовки письма
	from := fmt.Sprintf("%s <%s>", s.fromName, s.fromEmail)
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"utf-8\""

	// Собираем полное сообщение
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Настройка аутентификации
	auth := smtp.PlainAuth("", s.smtpUsername, s.smtpPassword, s.smtpHost)

	// Отправка письма
	addr := fmt.Sprintf("%s:%s", s.smtpHost, s.smtpPort)
	err := smtp.SendMail(addr, auth, s.fromEmail, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("Password reset email sent to: %s", to)
	return nil
}

// SendWelcomeEmail отправляет приветственное письмо новому пользователю
func (s *EmailService) SendWelcomeEmail(toEmail, username, temporaryPassword string) error {
	subject := "Добро пожаловать в Central Reporting"
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:3000")
	loginLink := fmt.Sprintf("%s/login", frontendURL)

	body := fmt.Sprintf(`
Здравствуйте, %s!

Для вас был создан аккаунт в системе Central Reporting.

Ваши учетные данные:
Логин: %s
Временный пароль: %s

Пожалуйста, войдите в систему по ссылке:
%s

ВАЖНО: После первого входа рекомендуем изменить пароль в настройках профиля.

---
С уважением,
Команда Central Reporting
`, username, username, temporaryPassword, loginLink)

	return s.sendEmail(toEmail, subject, body)
}

// getEnv получает значение переменной окружения или возвращает значение по умолчанию
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return strings.TrimSpace(value)
}
