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

func isValidImageFileDoc(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	for _, allowedExt := range []string{".jpg", ".jpeg", ".png"} {
		if ext == allowedExt { return true }
	}
	return false
}

func sanitizeFilenameDoc(filename string) string {
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)
	cleanName := regexp.MustCompile(`[^a-zA-Z0-9\-_]`).ReplaceAllString(name, "_")
	if len(cleanName) > 50 { cleanName = cleanName[:50] }
	if cleanName == "" { cleanName = "dokumentasi" }
	return cleanName + ext
}

func verifyImageIntegrityDoc(filePath string) error {
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

func handleDokumentasiUpload(c *gin.Context, formFieldName string) (string, error) {
	file, err := c.FormFile(formFieldName)
	if err != nil {
		if err == http.ErrMissingFile { return "", nil }
		return "", err
	}
	if !isValidImageFileDoc(file.Filename) { return "", fmt.Errorf("format file tidak didukung. Gunakan JPG, JPEG, atau PNG") }
	if file.Size > 5*1024*1024 { return "", fmt.Errorf("ukuran file maksimal 5MB") }
	src, err := file.Open()
	if err != nil { return "", fmt.Errorf("gagal membuka file upload") }
	defer src.Close()
	buffer := make([]byte, 512)
	n, err := src.Read(buffer)
	if err != nil && n == 0 { return "", fmt.Errorf("gagal membaca file upload") }
	src.Seek(0, 0)
	mimeType := http.DetectContentType(buffer[:n])
	isValidMime := false
	for _, validType := range []string{"image/jpeg", "image/png"} {
		if strings.HasPrefix(mimeType, validType) { isValidMime = true; break }
	}
	if !isValidMime { return "", fmt.Errorf("tipe file tidak valid. File harus berupa gambar JPEG atau PNG. Terdeteksi: %s", mimeType) }
	timestamp := time.Now().Unix()
	sanitizedFilename := sanitizeFilenameDoc(file.Filename)
	newFilename := fmt.Sprintf("%d_%s", timestamp, sanitizedFilename)
	uploadDir := filepath.Join("public", "uploads", "dokumentasi")
	uploadPath := filepath.Join(uploadDir, newFilename)
	if err := os.MkdirAll(uploadDir, 0755); err != nil { return "", fmt.Errorf("gagal membuat direktori upload: %v", err) }
	if err := c.SaveUploadedFile(file, uploadPath); err != nil { return "", fmt.Errorf("gagal menyimpan file: %v", err) }
	fileInfo, err := os.Stat(uploadPath)
	if os.IsNotExist(err) { return "", fmt.Errorf("file gagal tersimpan") }
	if fileInfo.Size() != file.Size { os.Remove(uploadPath); return "", fmt.Errorf("file corrupt: ukuran tidak sesuai") }
	if err := verifyImageIntegrityDoc(uploadPath); err != nil { os.Remove(uploadPath); return "", fmt.Errorf("file corrupt setelah upload: %v", err) }
	return uploadPath, nil
}
func AddDokumentasi(c *gin.Context) {
	var dokumentasi models.Dokumentasi
	uploadPath, err := handleDokumentasiUpload(c, "dokumentasi")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Error upload dokumentasi: " + err.Error()})
		return
	}
	if uploadPath != "" { dokumentasi.Dokumentasi = uploadPath }
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
	
	uploadPath, err := handleDokumentasiUpload(c, "dokumentasi")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": false, "message": "Error upload dokumentasi: " + err.Error()})
		return
	}
	if uploadPath != "" {
		if dokumentasi.Dokumentasi != "" {
			if _, err := os.Stat(dokumentasi.Dokumentasi); err == nil { os.Remove(dokumentasi.Dokumentasi) }
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