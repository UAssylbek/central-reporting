package main

import (
	"log"

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
		c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Header("Access-Control-Allow-Credentials", "true")
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
	protected.Use(auth.JWTMiddleware(cfg.JWTSecret))
	{
		protected.GET("/auth/me", authHandler.Me)
		protected.POST("/auth/logout", authHandler.Logout)

		// Admin only routes
		adminOnly := protected.Group("/")
		adminOnly.Use(auth.AdminMiddleware())
		{
			adminOnly.GET("/users", userHandler.GetUsers)
			adminOnly.POST("/users", userHandler.CreateUser)
			adminOnly.PUT("/users/:id", userHandler.UpdateUser)
			adminOnly.DELETE("/users/:id", userHandler.DeleteUser)
		}
	}

	log.Printf("Server starting on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
