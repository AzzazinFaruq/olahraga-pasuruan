package controllers

import (
	"backend_golang/models"
	"backend_golang/setup"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func isValidImageFileNews(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	for _, allowedExt := range []string{".jpg", ".jpeg", ".png"} {
		if ext == allowedExt { return true }
	}
	return false
}

func sanitizeFilenameNews(filename string) string {
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)
	cleanName := regexp.MustCompile(`[^a-zA-Z0-9\-_]`).ReplaceAllString(name, "_")
	if len(cleanName) > 50 { cleanName = cleanName[:50] }
	if cleanName == "" { cleanName = "news" }
	return cleanName + ext
}

func verifyImageIntegrityNews(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil { return fmt.Errorf("gagal membuka file: %v", err) }
	defer file.Close()
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && n == 0 { return fmt.Errorf("gagal membaca file: %v", err) }
	mimeType := http.DetectContentType(buffer[:n])
	for _, validType := range []string{"image/jpeg", "image/png"} {
		if strings.HasPrefix(mimeType, validType) { return nil }
	}
	if mimeType == "application/octet-stream" {
		ext := strings.ToLower(filepath.Ext(filePath))
		if ext == ".jpg" || ext == ".jpeg" || ext == ".png" {
			if n >= 4 && ((buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF) || (n >= 8 && buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47)) { return nil }
		}
	}
	return fmt.Errorf("tipe file tidak valid. File harus berupa gambar JPEG atau PNG. Terdeteksi: %s", mimeType)
}

func handleCoverUpload(c *gin.Context, formFieldName string) (string, error) {
	file, err := c.FormFile(formFieldName)
	if err != nil {
		if err == http.ErrMissingFile { return "", nil }
		return "", err
	}
	if !isValidImageFileNews(file.Filename) { return "", fmt.Errorf("format file tidak didukung. Gunakan JPG, JPEG, atau PNG") }
	if file.Size > 5*1024*1024 { return "", fmt.Errorf("ukuran file maksimal 5MB") }
	sanitizedFilename := sanitizeFilenameNews(file.Filename)
	timestamp := time.Now().Unix()
	newFilename := fmt.Sprintf("%d_%s", timestamp, sanitizedFilename)
	uploadDir := "public/uploads/news"
	if err := os.MkdirAll(uploadDir, 0755); err != nil { return "", fmt.Errorf("gagal membuat direktori upload: %v", err) }
	uploadPath := filepath.Join(uploadDir, newFilename)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil { return "", fmt.Errorf("gagal menyimpan file: %v", err) }
	if err := verifyImageIntegrityNews(uploadPath); err != nil { os.Remove(uploadPath); return "", fmt.Errorf("file upload gagal validasi: %v", err) }
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
	source := strings.TrimSpace(c.PostForm("source"))
	if coverPath == "" || title == "" || content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Semua field harus diisi dan cover harus berupa file gambar"})
		return
	}
	news.Cover = coverPath
	news.Title = title
	news.Source = source
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
	source := strings.TrimSpace(c.PostForm("source"))
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
	if source != "" {
		news.Source = source
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
