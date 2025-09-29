package auth

import (
	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

func ActivityMiddleware(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if exists {
			go userRepo.UpdateUserActivity(userID.(int))
		}
		c.Next()
	}
}
