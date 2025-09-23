package handlers

import (
    "github.com/UAssylbek/central-reporting/internal/auth"
    "github.com/UAssylbek/central-reporting/internal/models"
    "github.com/UAssylbek/central-reporting/internal/repositories"
    "net/http"
    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    userRepo  *repositories.UserRepository
    jwtSecret string
}

func NewAuthHandler(userRepo *repositories.UserRepository, jwtSecret string) *AuthHandler {
    return &AuthHandler{
        userRepo:  userRepo,
        jwtSecret: jwtSecret,
    }
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req models.LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.userRepo.GetByUsername(req.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    if !h.userRepo.CheckPassword(user, req.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    token, err := auth.GenerateToken(*user, h.jwtSecret)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    // Clear password before sending response
    user.Password = ""

    c.JSON(http.StatusOK, models.LoginResponse{
        User:  *user,
        Token: token,
    })
}

func (h *AuthHandler) Me(c *gin.Context) {
    userID, _ := c.Get("user_id")
    user, err := h.userRepo.GetByID(userID.(int))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"user": user})
}

func (h *AuthHandler) Logout(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}