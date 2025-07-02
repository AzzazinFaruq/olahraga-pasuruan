package controllers

import (
	"backend_golang/models"
	"backend_golang/setup"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
	HasilPertandinganIdStr := strings.TrimSpace(c.PostForm("hasil_pertandingan_id"))
	if HasilPertandinganIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Hasil Pertandingan tidak boleh kosong",
		})
		return
	}
	
	HasilPertandinganId, err := strconv.ParseUint(HasilPertandinganIdStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Hasil Pertandingan harus berupa angka yang valid",
		})
		return
	}
	dokumentasi.HasilPertandinganId = uint(HasilPertandinganId)
	
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
func GetLatestDokumentasi(c *gin.Context) {
	var dokumentasi models.Dokumentasi
	if err := setup.DB.Order("created_at DESC").First(&dokumentasi).Error; err != nil {
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
	HasilPertandinganIdStr := strings.TrimSpace(c.PostForm("hasil_pertandingan_id"))
	if HasilPertandinganIdStr != "" {
		HasilPertandinganId, err := strconv.ParseUint(HasilPertandinganIdStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  false,
				"message": "ID Hasil Pertandingan harus berupa angka yang valid",
			})
			return
		}
		dokumentasi.HasilPertandinganId = uint(HasilPertandinganId)
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
func GetDokumentasiByHasilPertandinganID(c *gin.Context) {
	id := c.Param("id")
	var dokumentasi []models.Dokumentasi
	if err := setup.DB.Where("hasil_pertandingan_id = ?", id).Find(&dokumentasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": dokumentasi})
}