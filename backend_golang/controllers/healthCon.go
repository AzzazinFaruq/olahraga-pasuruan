package controllers
import (
	"backend_golang/setup"
	"net/http"
	"github.com/gin-gonic/gin"
)
func HealthCheck(c *gin.Context) {
	sqlDB, err := setup.DB.DB()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":   "unhealthy",
			"database": "disconnected",
			"error":    err.Error(),
		})
		return
	}
	if err := sqlDB.Ping(); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status":   "unhealthy", 
			"database": "ping failed",
			"error":    err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":   "healthy",
		"database": "connected",
		"service":  "atlet-porprov-pasuruan",
	})
}
