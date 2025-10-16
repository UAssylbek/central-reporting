package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	lastSeen time.Time
	count    int
}

type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int
	window   time.Duration
}

func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
	}

	go rl.cleanupVisitors()
	return rl
}

func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.window {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		rl.mu.Lock()
		v, exists := rl.visitors[ip]

		if !exists {
			rl.visitors[ip] = &visitor{
				lastSeen: time.Now(),
				count:    1,
			}
			rl.mu.Unlock()
			c.Next()
			return
		}

		if time.Since(v.lastSeen) > rl.window {
			v.count = 1
			v.lastSeen = time.Now()
			rl.mu.Unlock()
			c.Next()
			return
		}

		if v.count >= rl.rate {
			rl.mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		v.count++
		v.lastSeen = time.Now()
		rl.mu.Unlock()
		c.Next()
	}
}
