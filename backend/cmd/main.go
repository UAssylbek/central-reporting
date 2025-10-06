package main

import (
	"log"
	"time"

	"github.com/UAssylbek/central-reporting/internal/auth"
	"github.com/UAssylbek/central-reporting/internal/config"
	"github.com/UAssylbek/central-reporting/internal/database"
	"github.com/UAssylbek/central-reporting/internal/handlers"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)
	userHandler := handlers.NewUserHandler(userRepo)

	// Setup router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Список разрешённых доменов
		allowedOrigins := map[string]bool{
			"http://localhost:3000":       true, // Локальная разработка
			"http://192.168.110.129:3000": true, // Ваш IP в сети
			"https://your-production.com": true, // Продакшен домен
			// Добавьте другие нужные домены
		}

		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Public routes
	r.POST("/api/auth/login", authHandler.Login)

	// Protected routes
	protected := r.Group("/api")
	protected.Use(auth.JWTMiddleware(cfg.JWTSecret, userRepo))
	protected.Use(auth.ActivityMiddleware(userRepo))
	{
		// Auth routes
		protected.GET("/auth/me", authHandler.Me)
		protected.POST("/auth/logout", authHandler.Logout)
		protected.POST("/auth/change-password", authHandler.ChangePassword)

		// User routes (доступны всем авторизованным пользователям)
		protected.GET("/users/organizations", userHandler.GetOrganizations) // Список организаций
	}

	// Routes for Admin and Moderator
	adminOrModerator := protected.Group("/")
	adminOrModerator.Use(auth.AdminOrModeratorMiddleware())
	{
		// Модераторы могут просматривать своих пользователей и обновлять только организации
		adminOrModerator.GET("/users", userHandler.GetUsers)
		adminOrModerator.GET("/users/:id", userHandler.GetUser)
		adminOrModerator.PUT("/users/:id", userHandler.UpdateUser) // Модератор может изменять только организации
	}

	// Admin only routes
	adminOnly := protected.Group("/")
	adminOnly.Use(auth.AdminMiddleware())
	{
		adminOnly.POST("/users", userHandler.CreateUser)
		adminOnly.DELETE("/users/:id", userHandler.DeleteUser)
	}

	// Background task для обновления статусов офлайн
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			log.Printf("Running UpdateOfflineUsers check...")
			if err := userRepo.UpdateOfflineUsers(10); err != nil {
				log.Printf("Error updating offline users: %v", err)
			} else {
				log.Printf("UpdateOfflineUsers completed successfully")
			}
		}
	}()

	log.Printf("Server starting on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
