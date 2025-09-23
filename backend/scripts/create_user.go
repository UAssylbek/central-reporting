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
	username := flag.String("username", "", "Username for the new user")
	password := flag.String("password", "", "Password for the new user")
	role := flag.String("role", "user", "Role for the new user (admin or user)")

	flag.Parse()

	if *username == "" || *password == "" {
		log.Fatal("Username and password are required")
	}

	if *role != "admin" && *role != "user" {
		log.Fatal("Role must be either 'admin' or 'user'")
	}

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

	// Create user
	user := models.User{
		Username: *username,
		Password: *password,
		Role:     models.UserRole(*role),
	}

	if err := userRepo.Create(&user); err != nil {
		log.Fatal("Failed to create user:", err)
	}

	fmt.Printf("User '%s' created successfully with role '%s'\n", *username, *role)
}
