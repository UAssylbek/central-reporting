package middleware

import "github.com/gin-gonic/gin"

// SecurityHeaders добавляет заголовки безопасности к каждому ответу
func SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Защита от clickjacking (запрет отображения в iframe)
		c.Header("X-Frame-Options", "DENY")

		// Защита от MIME-sniffing атак
		c.Header("X-Content-Type-Options", "nosniff")

		// Включить встроенную защиту XSS в браузере
		c.Header("X-XSS-Protection", "1; mode=block")

		// Strict Transport Security - заставляет использовать HTTPS
		// Примечание: раскомментируйте когда будете использовать HTTPS в production
		// c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		// Content Security Policy - контролирует откуда можно загружать ресурсы
		// Базовая политика для API сервера
		c.Header("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none'")

		// Referrer Policy - контролирует передачу referrer заголовка
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions Policy (ранее Feature Policy) - отключает ненужные браузерные API
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		c.Next()
	}
}
