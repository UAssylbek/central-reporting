package auth

import (
	"net/http"
	"strings"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

func JWTMiddleware(secret string, userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		claims, err := ValidateToken(tokenString, secret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		user, err := userRepo.GetByID(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// ✅ ДОБАВИТЬ: Проверка активности пользователя
		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{
				"error":        "Your account has been blocked",
				"force_logout": true,
				"reason":       "Your account was blocked by administrator",
			})
			c.Abort()
			return
		}

		if user.TokenVersion != claims.TokenVersion {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":        "Token has been invalidated",
				"force_logout": true,
				"reason":       "Your account settings have been changed by administrator",
			})
			c.Abort()
			return
		}

		if user.TokenVersion != claims.TokenVersion {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":        "Token has been invalidated",
				"force_logout": true,
				"reason":       "Your account settings have been changed by administrator",
			})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AdminMiddleware проверяет, что пользователь является администратором
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in context"})
			c.Abort()
			return
		}

		if role != models.RoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// AdminOrModeratorMiddleware проверяет, что пользователь является администратором или модератором
func AdminOrModeratorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found in context"})
			c.Abort()
			return
		}

		if role != models.RoleAdmin && role != models.RoleModerator {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin or moderator access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
