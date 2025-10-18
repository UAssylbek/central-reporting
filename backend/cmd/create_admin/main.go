package main

import (
	"fmt"
	"log"

	"github.com/UAssylbek/central-reporting/internal/config"
	"github.com/UAssylbek/central-reporting/internal/database"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
)

func main() {
	fmt.Println("=== Создание администратора ===")

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize repository
	userRepo := repositories.NewUserRepository(db)

	// Проверяем существует ли уже admin
	existingAdmin, _ := userRepo.GetByUsername("admin")
	if existingAdmin != nil {
		fmt.Println("❌ Пользователь 'admin' уже существует!")
		fmt.Printf("ID: %d, Имя: %s, Роль: %s\n", existingAdmin.ID, existingAdmin.FullName, existingAdmin.Role)
		return
	}

	// Создаём администратора
	adminUser := &models.User{
		FullName: "Администратор Системы",
		Username: "admin",
		Password: models.NullString{
			String: "Admin123!", // Пароль по умолчанию
			Valid:  true,
		},
		Emails:   []string{"admin@central-reporting.kz"},
		Phones:   []string{"+77001234567"},
		Position: models.NullString{String: "Системный администратор", Valid: true},
		Department: models.NullString{String: "IT Department", Valid: true},
		Role:                  models.RoleAdmin,
		RequirePasswordChange: false, // Можно установить true, чтобы требовать смену пароля
		IsActive:              true,
		IsFirstLogin:          false,
		ShowInSelection:       true,
	}

	// Создаём пользователя
	err = userRepo.Create(adminUser)
	if err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	// Загружаем созданного пользователя чтобы получить ID
	user, err := userRepo.GetByUsername("admin")
	if err != nil {
		log.Fatal("Failed to get created user:", err)
	}

	fmt.Println("\n✅ Администратор успешно создан!")
	fmt.Println("========================================")
	fmt.Printf("ID:       %d\n", user.ID)
	fmt.Printf("Логин:    %s\n", user.Username)
	fmt.Printf("Пароль:   Admin123!\n")
	fmt.Printf("Имя:      %s\n", user.FullName)
	fmt.Printf("Роль:     %s\n", user.Role)
	fmt.Println("========================================")
	fmt.Println("\n⚠️  ВАЖНО: Измените пароль после первого входа!")
	fmt.Println("\nТеперь вы можете войти в систему:")
	fmt.Println("  1. Откройте http://localhost:3000/login")
	fmt.Println("  2. Логин: admin")
	fmt.Println("  3. Пароль: Admin123!")
}
