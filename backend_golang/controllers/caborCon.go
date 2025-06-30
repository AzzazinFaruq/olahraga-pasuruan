package controllers
import (
	"backend_golang/models"
	"backend_golang/setup"
	"net/http"
	"strconv"
	"strings"
	"github.com/gin-gonic/gin"
)
func GetAllCabor(c *gin.Context) {
	var cabor []models.Cabor
	if err := setup.DB.Find(&cabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   cabor,
		"status": true,
	})
}
func GetCaborList(c *gin.Context) {
	var cabor []models.Cabor
	if err := setup.DB.Find(&cabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   cabor,
		"status": true,
	})
}
func GetCaborById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.ParseUint(id, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID harus berupa angka",
			"status": false,
		})
		return
	}
	var cabor models.Cabor
	if err := setup.DB.First(&cabor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Cabor tidak ditemukan",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   cabor,
		"status": true,
	})
}
func AddCabor(c *gin.Context) {
	var input struct {
		NamaCabor string `json:"nama_cabor" binding:"required,min=2,max=100"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "status": false})
		return
	}
	input.NamaCabor = strings.TrimSpace(input.NamaCabor)
	var existingCabor models.Cabor
	if err := setup.DB.Where("nama_cabor = ?", input.NamaCabor).First(&existingCabor).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error":  "Cabor dengan nama tersebut sudah ada",
			"status": false,
		})
		return
	}
	cabor := models.Cabor{
		NamaCabor: input.NamaCabor,
	}
	if err := setup.DB.Create(&cabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Failed to create Cabor",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Cabor berhasil ditambahkan",
		"status":  true,
		"data":    cabor,
	})
}
func UpdateCabor(c *gin.Context) {
	id := c.Param("id")
	var cabor models.Cabor
	if err := setup.DB.First(&cabor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cabor tidak ditemukan"})
		return
	}
	var input struct {
		NamaCabor string `json:"nama_cabor"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.NamaCabor != "" {
		cabor.NamaCabor = input.NamaCabor
	}
	if err := setup.DB.Save(&cabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update cabor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cabor berhasil diupdate", "data": cabor})
}
func DeleteCabor(c *gin.Context) {
	id := c.Param("id")
	if err := setup.DB.Delete(&models.Cabor{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus cabor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cabor berhasil dihapus"})
}
func CountCabor(c *gin.Context) {
	var count int64
	if err := setup.DB.Model(&models.Cabor{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"jumlah_cabor": count,
		"status": true,
	})
}
