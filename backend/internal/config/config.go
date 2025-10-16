package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	Port           string
	AllowedOrigins []string
}

func Load() *Config {
	godotenv.Load()

	// Получаем базовые настройки
	databaseURL := getEnv("DATABASE_URL", "postgres://postgres:Qwerty123@localhost/central_reporting?sslmode=disable")
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key-change-in-production")
	port := getEnv("PORT", "8080")

	// Парсим ALLOWED_ORIGINS
	allowedOriginsStr := os.Getenv("ALLOWED_ORIGINS")
	var allowedOrigins []string
	if allowedOriginsStr != "" {
		allowedOrigins = strings.Split(allowedOriginsStr, ",")
		for i := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
		}
	} else {
		// Дефолтные значения для локальной разработки
		allowedOrigins = []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		}
	}

	return &Config{
		DatabaseURL:    databaseURL,
		JWTSecret:      jwtSecret,
		Port:           port,
		AllowedOrigins: allowedOrigins,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
