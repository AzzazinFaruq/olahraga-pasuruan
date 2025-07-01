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
func isValidNIK(nik string) bool {
	nikRegex := regexp.MustCompile(`^\d{16}$`)
	return nikRegex.MatchString(nik)
}
func isValidImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	allowedExts := []string{".jpg", ".jpeg", ".png"}
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			return true
		}
	}
	return false
}
func sanitizeFilename(filename string) string {
	reg := regexp.MustCompile(`[^a-zA-Z0-9\.\-_]`)
	return reg.ReplaceAllString(filename, "_")
}
func handleFileUpload(c *gin.Context, formFieldName string, uploadSubDir string) (string, error) {
	file, err := c.FormFile(formFieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}
		return "", err
	}
	if !isValidImageFile(file.Filename) {
		return "", fmt.Errorf("format file tidak didukung. Gunakan JPG, JPEG, atau PNG")
	}
	if file.Size > 5*1024*1024 {
		return "", fmt.Errorf("ukuran file maksimal 5MB")
	}
	timestamp := time.Now().Unix()
	sanitizedFilename := sanitizeFilename(file.Filename)
	newFilename := fmt.Sprintf("%d_%s", timestamp, sanitizedFilename)
	uploadPath := filepath.Join("public/uploads", uploadSubDir, newFilename)
	if err := os.MkdirAll(filepath.Dir(uploadPath), 0755); err != nil {
		return "", fmt.Errorf("gagal membuat direktori upload")
	}
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		return "", fmt.Errorf("gagal menyimpan file")
	}
	return uploadPath, nil
}
func removeFileIfExists(filePath string) error {
	if filePath != "" {
		if _, err := os.Stat(filePath); err == nil {
			return os.Remove(filePath)
		}
	}
	return nil
}
func GetAllAtlet(c *gin.Context) {
	var atlet []models.Atlet
	if err := setup.DB.Find(&atlet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   atlet,
		"status": true,
	})
}
func GetAtletById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.ParseUint(id, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID harus berupa angka",
			"status": false,
		})
		return
	}
	var atlet models.Atlet
	if err := setup.DB.First(&atlet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Atlet tidak ditemukan",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   atlet,
		"status": true,
	})
}
func AddAtlet(c *gin.Context) {
	var atlet models.Atlet
	foto3x4Path, err := handleFileUpload(c, "foto_3x4", "foto_3x4")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}
	if foto3x4Path != "" {
		atlet.Foto3x4 = foto3x4Path
	}
	fotoBebasPath, err := handleFileUpload(c, "foto_bebas", "foto_bebas")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": err.Error(),
		})
		return
	}
	if fotoBebasPath != "" {
		atlet.FotoBebas = fotoBebasPath
	}
	NIK := strings.TrimSpace(c.PostForm("nik"))
	if NIK == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "NIK tidak boleh kosong",
		})
		return
	}
	if !isValidNIK(NIK) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "NIK harus 16 digit angka",
		})
		return
	}
	var existingAtlet models.Atlet
	if err := setup.DB.Where("nik = ?", NIK).First(&existingAtlet).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  false,
			"message": "NIK sudah terdaftar",
		})
		return
	}
	atlet.NIK = NIK
	Nama := strings.TrimSpace(c.PostForm("nama"))
	if Nama == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Nama tidak boleh kosong",
		})
		return
	}
	if len(Nama) < 2 || len(Nama) > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Nama harus antara 2-100 karakter",
		})
		return
	}
	atlet.Nama = Nama
	TempatLahir := strings.TrimSpace(c.PostForm("tempat_lahir"))
	if TempatLahir == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Tempat lahir tidak boleh kosong",
		})
		return
	}
	atlet.TempatLahir = TempatLahir
	TanggalLahir := c.PostForm("tanggal_lahir")
	if TanggalLahir == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Tanggal lahir tidak boleh kosong",
		})
		return
	}
	fmt.Printf("Received tanggal_lahir: %s\n", TanggalLahir)
	tanggalLahir, err := time.Parse("2006-01-02", TanggalLahir)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Format tanggal lahir salah. Gunakan format: YYYY-MM-DD (contoh: 2005-11-29)",
			"error":   err.Error(),
		})
		return
	}
	atlet.TanggalLahir = tanggalLahir
	JenisKelamin := c.PostForm("jenis_kelamin")
	if JenisKelamin == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Jenis kelamin tidak boleh kosong",
		})
		return
	}
	if JenisKelamin != "Laki-laki" && JenisKelamin != "Perempuan" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Jenis kelamin harus 'Laki-laki' atau 'Perempuan'",
		})
		return
	}
	atlet.JenisKelamin = JenisKelamin
	Alamat := c.PostForm("alamat")
	if Alamat == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Alamat tidak boleh kosong",
		})
		return
	}
	atlet.Alamat = Alamat
	NamaOrtu := c.PostForm("nama_ortu")
	if NamaOrtu == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Nama Orang tua tidak boleh kosong",
		})
		return
	}
	atlet.NamaOrtu = NamaOrtu
	Sekolah := c.PostForm("sekolah")
	if Sekolah == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Sekolah tidak boleh kosong",
		})
		return
	}
	validSekolah := []string{"SD", "SMP", "SMA", "SMK", "Universitas", "Lainnya"}
	isValidSekolah := false
	for _, v := range validSekolah {
		if Sekolah == v {
			isValidSekolah = true
			break
		}
	}
	if !isValidSekolah {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Sekolah harus salah satu dari: SD, SMP, SMA, SMK, Universitas, Lainnya",
		})
		return
	}
	atlet.Sekolah = Sekolah
	NamaSekolah := c.PostForm("nama_sekolah")
	if NamaSekolah == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Nama sekolah tidak boleh kosong",
		})
		return
	}
	atlet.NamaSekolah = NamaSekolah
	
	tx := setup.DB.Begin()
	if err := tx.Create(&atlet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  false,
			"message": "Gagal menyimpan data atlet: " + err.Error(),
		})
		return
	}

	caborIdStr := strings.TrimSpace(c.PostForm("cabor_id"))
if caborIdStr != "" {
    caborId, err := strconv.ParseUint(caborIdStr, 10, 32)
    if err != nil {
        tx.Rollback()
        c.JSON(http.StatusBadRequest, gin.H{
            "status":  false,
            "message": "ID Cabang Olahraga harus berupa angka",
        })
        return
    }

    // ALUULLL WAS HERE
    atletCabor := models.AtletCabor{
        AtletId: atlet.Id,
        CaborId: uint(caborId),
    }
    if err := tx.Create(&atletCabor).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "status":  false,
            "message": "Gagal menghubungkan atlet dengan cabor: " + err.Error(),
        })
        return
    }
}

	tx.Commit()
	setup.DB.Preload("Cabor").First(&atlet, atlet.Id)
	c.JSON(http.StatusCreated, gin.H{
		"status":  true,
		"message": "Data atlet berhasil ditambahkan",
		"data":    atlet,
	})
}
func UpdateAtlet(c *gin.Context) {
	id := c.Param("id")
	var atlet models.Atlet
	if err := setup.DB.First(&atlet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Atlet tidak ditemukan"})
		return
	}
	NIK := c.PostForm("nik")
	if NIK != "" {
		atlet.NIK = NIK
	}
	Nama := c.PostForm("nama")
	if Nama != "" {
		atlet.Nama = Nama
	}
	TempatLahir := c.PostForm("tempat_lahir")
	if TempatLahir != "" {
		atlet.TempatLahir = TempatLahir
	}
	TanggalLahir := c.PostForm("tanggal_lahir")
	if TanggalLahir != "" {
		tanggalLahir, err := time.Parse("2006-01-02", TanggalLahir)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal lahir salah. Gunakan format: YYYY-MM-DD"})
			return
		}
		atlet.TanggalLahir = tanggalLahir
	}
	JenisKelamin := c.PostForm("jenis_kelamin")
	if JenisKelamin != "" {
		if JenisKelamin != "Laki-laki" && JenisKelamin != "Perempuan" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Jenis kelamin harus 'Laki-laki' atau 'Perempuan'"})
			return
		}
		atlet.JenisKelamin = JenisKelamin
	}
	Alamat := c.PostForm("alamat")
	if Alamat != "" {
		atlet.Alamat = Alamat
	}
	NamaOrtu := c.PostForm("nama_ortu")
	if NamaOrtu != "" {
		atlet.NamaOrtu = NamaOrtu
	}
	Sekolah := c.PostForm("sekolah")
	if Sekolah != "" {
		validSekolah := []string{"SD", "SMP", "SMA", "SMK", "Universitas", "Lainnya"}
		isValidSekolah := false
		for _, v := range validSekolah {
			if Sekolah == v {
				isValidSekolah = true
				break
			}
		}
		if !isValidSekolah {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Sekolah harus salah satu dari: SD, SMP, SMA, SMK, Universitas, Lainnya"})
			return
		}
		atlet.Sekolah = Sekolah
	}
	NamaSekolah := c.PostForm("nama_sekolah")
	if NamaSekolah != "" {
		atlet.NamaSekolah = NamaSekolah
	}

	foto3x4Path, err := handleFileUpload(c, "foto_3x4", "foto_3x4")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if foto3x4Path != "" {
		removeFileIfExists(atlet.Foto3x4)
		atlet.Foto3x4 = foto3x4Path
	}
	fotoBebasPath, err := handleFileUpload(c, "foto_bebas", "foto_bebas")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if fotoBebasPath != "" {
		removeFileIfExists(atlet.FotoBebas)
		atlet.FotoBebas = fotoBebasPath
	}
	if err := setup.DB.Save(&atlet).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update data atlet"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Data atlet berhasil diupdate", "data": atlet})
}
func DeleteAtlet(c *gin.Context) {
	id := c.Param("id")
	var atlet models.Atlet
	if err := setup.DB.First(&atlet, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Atlet tidak ditemukan"})
		return
	}
	tx := setup.DB.Begin()
	if err := removeFileIfExists(atlet.Foto3x4); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus file foto 3x4"})
		return
	}
	if err := removeFileIfExists(atlet.FotoBebas); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus file foto bebas"})
		return
	}
	if err := tx.Delete(&atlet).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data atlet dari database"})
		return
	}
	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Atlet berhasil dihapus beserta file-filenya"})
}
func CountAtlet(c *gin.Context) {
	var count int64
	if err := setup.DB.Model(&models.Atlet{}).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"jumlah_atlet": count,
		"status": true,
	})
}
