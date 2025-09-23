package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    DatabaseURL string
    JWTSecret   string
    Port        string
}

func Load() *Config {
    godotenv.Load()

    return &Config{
        DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost/centralized_reporting?sslmode=disable"),
        JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
        Port:        getEnv("PORT", "8080"),
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}