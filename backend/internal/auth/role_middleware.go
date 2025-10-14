package auth

import (
	"net/http"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/gin-gonic/gin"
)

// RoleMiddleware проверяет роль пользователя
func RoleMiddleware(allowedRoles []models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
			c.Abort()
			return
		}

		userRole := role.(models.UserRole)

		// Проверяем есть ли роль пользователя в списке разрешённых
		allowed := false
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Недостаточно прав доступа"})
			c.Abort()
			return
		}

		c.Next()
	}
}
