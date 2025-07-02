package controllers

import (
	"backend_golang/models"
	"backend_golang/setup"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Helper untuk validasi file gambar
func isValidImageFileNews(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	allowedExts := []string{".jpg", ".jpeg", ".png"}
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			return true
		}
	}
	return false
}

// Helper upload file cover news
func handleCoverUpload(c *gin.Context, formFieldName string) (string, error) {
	file, err := c.FormFile(formFieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}
		return "", err
	}
	if !isValidImageFileNews(file.Filename) {
		return "", gin.Error{Err: err, Type: gin.ErrorTypeBind, Meta: "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG"}
	}
	if file.Size > 5*1024*1024 {
		return "", gin.Error{Err: err, Type: gin.ErrorTypeBind, Meta: "Ukuran file maksimal 5MB"}
	}
	timestamp := time.Now().Unix()
	sanitizedFilename := strings.ReplaceAll(file.Filename, " ", "_")
	newFilename := strconv.FormatInt(timestamp, 10) + "_" + sanitizedFilename
	uploadPath := filepath.Join("public/uploads/news", newFilename)
	if err := os.MkdirAll(filepath.Dir(uploadPath), 0755); err != nil {
		return "", gin.Error{Err: err, Type: gin.ErrorTypePrivate, Meta: "Gagal membuat direktori upload"}
	}
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		return "", gin.Error{Err: err, Type: gin.ErrorTypePrivate, Meta: "Gagal menyimpan file"}
	}
	return uploadPath, nil
}

// Get all news
func GetAllNews(c *gin.Context) {
	var news []models.News
	if err := setup.DB.Order("created_at desc").Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": news, "status": true})
}

// Get news by ID
func GetNewsById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.ParseUint(id, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID harus berupa angka", "status": false})
		return
	}
	var news models.News
	if err := setup.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Berita tidak ditemukan", "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": news, "status": true})
}

// Create news
func CreateNews(c *gin.Context) {
	var news models.News
	coverPath, err := handleCoverUpload(c, "cover")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": err.Error()})
		return
	}
	title := strings.TrimSpace(c.PostForm("title"))
	content := strings.TrimSpace(c.PostForm("content"))
	if coverPath == "" || title == "" || content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Semua field harus diisi dan cover harus berupa file gambar"})
		return
	}
	news.Cover = coverPath
	news.Title = title
	news.Content = content
	if err := setup.DB.Create(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": false, "message": "Gagal menambah berita: " + err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"status": true, "message": "Berita berhasil ditambahkan", "data": news})
}

// Update news
func UpdateNews(c *gin.Context) {
	id := c.Param("id")
	var news models.News
	if err := setup.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Berita tidak ditemukan", "status": false})
		return
	}
	coverPath, err := handleCoverUpload(c, "cover")
	if err != nil && err != http.ErrMissingFile {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "status": false})
		return
	}
	title := strings.TrimSpace(c.PostForm("title"))
	content := strings.TrimSpace(c.PostForm("content"))
	if coverPath != "" {
		// Hapus file cover lama jika ada file baru
		if news.Cover != "" {
			if _, err := os.Stat(news.Cover); err == nil {
				_ = os.Remove(news.Cover)
			}
		}
		news.Cover = coverPath
	}
	if title != "" {
		news.Title = title
	}
	if content != "" {
		news.Content = content
	}
	if err := setup.DB.Save(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update berita: " + err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berita berhasil diupdate", "data": news, "status": true})
}

// Delete news
func DeleteNews(c *gin.Context) {
	id := c.Param("id")
	var news models.News
	if err := setup.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Berita tidak ditemukan", "status": false})
		return
	}
	// Hapus file cover jika ada
	if news.Cover != "" {
		if _, err := os.Stat(news.Cover); err == nil {
			_ = os.Remove(news.Cover)
		}
	}
	if err := setup.DB.Delete(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus berita", "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berita berhasil dihapus", "status": true})
}
