package auth

import (
	"errors"
	"time"

	"github.com/UAssylbek/central-reporting/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID       int             `json:"user_id"`
	Username     string          `json:"username"`
	FullName     string          `json:"full_name"`
	Role         models.UserRole `json:"role"`
	TokenVersion int             `json:"token_version"`
	jwt.RegisteredClaims
}

func GenerateToken(user models.User, secret string) (string, error) {
	claims := Claims{
		UserID:       user.ID,
		Username:     user.Username,
		FullName:     user.FullName,
		Role:         user.Role,
		TokenVersion: user.TokenVersion,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ValidateToken(tokenString, secret string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
