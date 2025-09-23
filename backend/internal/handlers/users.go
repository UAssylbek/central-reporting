package handlers

import (
    "github.com/UAssylbek/central-reporting/internal/models"
    "github.com/UAssylbek/central-reporting/internal/repositories"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userRepo *repositories.UserRepository
}

func NewUserHandler(userRepo *repositories.UserRepository) *UserHandler {
    return &UserHandler{userRepo: userRepo}
}

func (h *UserHandler) GetUsers(c *gin.Context) {
    users, err := h.userRepo.GetAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"users": users})
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    var req models.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user := models.User{
        Username: req.Username,
        Password: req.Password,
        Role:     req.Role,
    }

    if err := h.userRepo.Create(&user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    // Clear password before sending response
    user.Password = ""
    c.JSON(http.StatusCreated, gin.H{"user": user})
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    var req models.UpdateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := h.userRepo.Update(id, req); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
    idStr := c.Param("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    if err := h.userRepo.Delete(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}