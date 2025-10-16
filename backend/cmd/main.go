package main

import (
	"log"
	"time"

	"github.com/UAssylbek/central-reporting/internal/auth"
	"github.com/UAssylbek/central-reporting/internal/config"
	"github.com/UAssylbek/central-reporting/internal/database"
	"github.com/UAssylbek/central-reporting/internal/handlers"
	"github.com/UAssylbek/central-reporting/internal/middleware"
	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	loginLimiter := middleware.NewRateLimiter(5, time.Minute)       // 5 попыток в минуту
	createUserLimiter := middleware.NewRateLimiter(10, time.Minute) // 10 создаий в минуту

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
	avatarHandler := handlers.NewAvatarHandler(userRepo)

	// Setup router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// ✅ Используем конфиг вместо hardcoded
		allowedOrigins := make(map[string]bool)
		for _, o := range cfg.AllowedOrigins {
			allowedOrigins[o] = true
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
	r.POST("/api/auth/login", loginLimiter.Middleware(), authHandler.Login)

	// Protected routes (доступны всем авторизованным пользователям)
	protected := r.Group("/api")
	protected.Use(auth.JWTMiddleware(cfg.JWTSecret, userRepo))
	protected.Use(auth.ActivityMiddleware(userRepo))
	{
		// Auth routes
		protected.GET("/auth/me", authHandler.Me)
		protected.POST("/auth/logout", authHandler.Logout)
		protected.POST("/auth/change-password", authHandler.ChangePassword)

		// User routes
		protected.GET("/users/organizations", userHandler.GetOrganizations)

		// 🔧 КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ: Перенесли сюда из adminModeratorRoutes
		// Теперь ВСЕ авторизованные пользователи могут обращаться к этому роуту
		// Проверка прав происходит внутри хендлера UpdateUser
		protected.PUT("/users/:id", userHandler.UpdateUser)

		// Avatar routes (доступны всем авторизованным пользователям)
		protected.POST("/users/:id/avatar", avatarHandler.UploadAvatar)
		protected.DELETE("/users/:id/avatar", avatarHandler.DeleteAvatar)
	}

	// Admin & Moderator routes
	adminModeratorRoutes := r.Group("/api")
	adminModeratorRoutes.Use(auth.JWTMiddleware(cfg.JWTSecret, userRepo))
	adminModeratorRoutes.Use(auth.ActivityMiddleware(userRepo))
	adminModeratorRoutes.Use(auth.RoleMiddleware([]models.UserRole{models.RoleAdmin, models.RoleModerator}))
	{
		adminModeratorRoutes.GET("/users", userHandler.GetUsers)
		adminModeratorRoutes.GET("/users/:id", userHandler.GetUserByID)
		// 🔧 УБРАЛИ ОТСЮДА: adminModeratorRoutes.PUT("/users/:id", userHandler.UpdateUser)
	}

	// Admin only routes
	adminOnly := protected.Group("/")
	adminOnly.Use(auth.AdminMiddleware())
	{
		adminOnly.POST("/users", createUserLimiter.Middleware(), userHandler.CreateUser)
		adminOnly.DELETE("/users/:id", userHandler.DeleteUser)
	}

	// Serving uploaded files (avatars)
	r.Static("/uploads", "./uploads")

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
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
