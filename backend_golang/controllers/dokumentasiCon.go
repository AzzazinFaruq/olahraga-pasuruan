package controllers
import (
	"backend_golang/models"
	"backend_golang/setup"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"github.com/gin-gonic/gin"
)
func AddDokumentasi(c *gin.Context) {
	var dokumentasi models.Dokumentasi
	file, err := c.FormFile("dokumentasi")
	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG"})
			return
		}
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file maksimal 5MB"})
			return
		}
		timestamp := time.Now().Unix()
		filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
		uploadPath := "public/uploads/dokumentasi/" + filename
		if err := os.MkdirAll("public/uploads/dokumentasi", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori upload"})
			return
		}
		if err := c.SaveUploadedFile(file, uploadPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file dokumentasi"})
			return
		}
		dokumentasi.Dokumentasi = uploadPath
	}
	atletId := c.PostForm("atlet_id")
	if atletId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "atlet_id tidak boleh kosong"})
		return
	}
	var atletIdInt uint
	if _, err := fmt.Sscanf(atletId, "%d", &atletIdInt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "atlet_id harus berupa angka yang valid"})
		return
	}
	dokumentasi.AtletId = atletIdInt
	if err := setup.DB.Create(&dokumentasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambah dokumentasi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dokumentasi berhasil ditambahkan", "data": dokumentasi})
}
func GetAllDokumentasi(c *gin.Context) {
	var dokumentasi []models.Dokumentasi
	if err := setup.DB.Find(&dokumentasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": dokumentasi})
}
func GetDokumentasiById(c *gin.Context) {
	id := c.Param("id")
	var dokumentasi models.Dokumentasi
	if err := setup.DB.First(&dokumentasi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dokumentasi tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": dokumentasi})
}
func UpdateDokumentasi(c *gin.Context) {
	id := c.Param("id")
	var dokumentasi models.Dokumentasi
	if err := setup.DB.First(&dokumentasi, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dokumentasi tidak ditemukan"})
		return
	}
	file, err := c.FormFile("dokumentasi")
	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG"})
			return
		}
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file maksimal 5MB"})
			return
		}
		timestamp := time.Now().Unix()
		filename := fmt.Sprintf("%d_%s", timestamp, file.Filename)
		uploadPath := "public/uploads/dokumentasi_atlet/" + filename
		if err := os.MkdirAll("public/uploads/dokumentasi_atlet", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori upload"})
			return
		}
		if err := c.SaveUploadedFile(file, uploadPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file dokumentasi"})
			return
		}
		dokumentasi.Dokumentasi = uploadPath
	}
	atletId := c.PostForm("atlet_id")
	if atletId != "" {
		var atletIdInt uint
		if _, err := fmt.Sscanf(atletId, "%d", &atletIdInt); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "atlet_id harus berupa angka yang valid"})
			return
		}
		dokumentasi.AtletId = atletIdInt
	}
	if err := setup.DB.Save(&dokumentasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update dokumentasi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dokumentasi berhasil diupdate", "data": dokumentasi})
}
func DeleteDokumentasi(c *gin.Context) {
	id := c.Param("id")
	if err := setup.DB.Delete(&models.Dokumentasi{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus dokumentasi"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dokumentasi berhasil dihapus"})
}
