package auth

import (
	"log"

	"github.com/UAssylbek/central-reporting/internal/repositories"
	"github.com/gin-gonic/gin"
)

func ActivityMiddleware(userRepo *repositories.UserRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if exists {
			log.Printf("ActivityMiddleware: Updating activity for user %d", userID.(int))
			go userRepo.UpdateUserActivity(userID.(int))
		} else {
			log.Printf("ActivityMiddleware: user_id not found in context")
		}
		c.Next()
	}
}
