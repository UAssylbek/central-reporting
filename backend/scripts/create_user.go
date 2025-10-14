package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/UAssylbek/central-reporting/internal/config"
	"github.com/UAssylbek/central-reporting/internal/database"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
)

func main() {
	fullName := flag.String("fullname", "", "Full name of the user (required)")
	username := flag.String("username", "", "Username for login (required)")
	password := flag.String("password", "", "Password (optional, can be empty)")
	role := flag.String("role", "user", "Role: admin or user")
	email := flag.String("email", "", "Email address (optional)")
	phone := flag.String("phone", "", "Phone number (optional)")

	flag.Parse()

	// Валидация обязательных полей
	if *username == "" {
		log.Fatal("❌ Username is required. Use -username flag")
	}

	if *fullName == "" {
		log.Fatal("❌ Full name is required. Use -fullname flag")
	}

	if *role != "admin" && *role != "user" {
		log.Fatal("❌ Role must be either 'admin' or 'user'")
	}

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize repository
	userRepo := repositories.NewUserRepository(db)

	// Проверяем не существует ли уже такой пользователь
	existingUser, _ := userRepo.GetByUsername(*username)
	if existingUser != nil {
		log.Fatalf("❌ User with username '%s' already exists (ID: %d)", *username, existingUser.ID)
	}

	// Создаем nullable строки для опциональных полей
	createNullString := func(s string) models.NullString {
		return models.NullString{
			String: s,
			Valid:  s != "",
		}
	}

	// Создаём массивы для новых полей
	emails := models.Emails{}
	if *email != "" {
		emails = models.Emails{*email}
	}

	phones := models.Phones{}
	if *phone != "" {
		phones = models.Phones{*phone}
	}

	// Create user
	user := models.User{
		FullName:               *fullName,
		Username:               *username,
		Password:               createNullString(*password),
		Role:                   models.UserRole(*role),
		RequirePasswordChange:  false,
		DisablePasswordChange:  false,
		ShowInSelection:        true,
		IsFirstLogin:           false,
		IsOnline:               false,
		IsActive:               true,
		Emails:                 emails,
		Phones:                 phones,
		SocialLinks:            models.SocialLinks{},
		CustomFields:           models.CustomFields{},
		Tags:                   models.Tags{},
		AvailableOrganizations: models.Organizations{},
		AccessibleUsers:        models.AccessibleUsers{},
	}

	if err := userRepo.Create(&user); err != nil {
		log.Fatal("❌ Failed to create user:", err)
	}

	fmt.Println("\n✅ User created successfully!")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("  ID:        %d\n", user.ID)
	fmt.Printf("  Full Name: %s\n", *fullName)
	fmt.Printf("  Username:  %s\n", *username)
	if *password != "" {
		fmt.Printf("  Password:  %s\n", *password)
	} else {
		fmt.Printf("  Password:  (empty - user can login without password)\n")
	}
	fmt.Printf("  Role:      %s\n", *role)
	if *email != "" {
		fmt.Printf("  Email:     %s\n", *email)
	}
	if *phone != "" {
		fmt.Printf("  Phone:     %s\n", *phone)
	}
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}
