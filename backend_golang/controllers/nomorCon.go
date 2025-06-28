package controllers
import (
	"backend_golang/models"
	"backend_golang/setup"
	"net/http"
	"github.com/gin-gonic/gin"
)
func AddNomor(c *gin.Context) {
	var input struct {
		NamaNomor string `json:"nama_nomor" binding:"required"`
		CaborID   uint   `json:"cabor_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var nomor models.Nomor
	nomor.NamaNomor = input.NamaNomor
	nomor.CaborID = input.CaborID
	if err := setup.DB.Create(&nomor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah nomor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nomor berhasil ditambahkan", "data": nomor})
}
func GetAllNomor(c *gin.Context) {
	var nomor []models.Nomor

		if err := setup.DB.Preload("Cabor").Find(&nomor).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	
	c.JSON(http.StatusOK, gin.H{"data": nomor})
}
func GetNomorById(c *gin.Context) {
	id := c.Param("id")
	var nomor models.Nomor
	if err := setup.DB.First(&nomor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nomor tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": nomor})
}
func UpdateNomor(c *gin.Context) {
	id := c.Param("id")
	var nomor models.Nomor
	if err := setup.DB.First(&nomor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nomor tidak ditemukan"})
		return
	}
	var input struct {
		NamaNomor string `json:"nama_nomor"`
		CaborID   uint   `json:"cabor_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.NamaNomor != "" {
		nomor.NamaNomor = input.NamaNomor
	}
	if input.CaborID != 0 {
		nomor.CaborID = input.CaborID
	}
	if err := setup.DB.Save(&nomor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update nomor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nomor berhasil diupdate", "data": nomor})
}
func DeleteNomor(c *gin.Context) {
	id := c.Param("id")
	if err := setup.DB.Delete(&models.Nomor{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus nomor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nomor berhasil dihapus"})
}
func GetNomorByCaborId(c *gin.Context) {
	caborId := c.Param("cabor_id")
	var nomors []models.Nomor
	if err := setup.DB.Where("cabor_id = ?", caborId).Find(&nomors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": nomors})
}
