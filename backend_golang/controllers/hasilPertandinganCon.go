package controllers
import (
	"backend_golang/models"
	"backend_golang/setup"
	"net/http"
	"strconv"
	"strings"
	"github.com/gin-gonic/gin"
)
// Validation function for medals
func isValidMedali(medali string) bool {
	validMedali := []string{"Emas", "Perak", "Perunggu", "Partisipasi"}
	for _, valid := range validMedali {
		if medali == valid {
			return true
		}
	}
	return false
}
// GetAllHasil - Get all results
func GetAllHasil(c *gin.Context) {
	var hasil []models.HasilPertandingan
	if err := setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").Find(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   hasil,
		"status": true,
	})
}
func GetHasilById(c *gin.Context) {
	id := c.Param("id")
	if _, err := strconv.ParseUint(id, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID harus berupa angka",
			"status": false,
		})
		return
	}
	var hasil models.HasilPertandingan
	if err := setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").
		First(&hasil, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hasil pertandingan tidak ditemukan",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   hasil,
		"status": true,
	})
}
// GetHasilByAtlet - Get results by athlete ID
func GetHasilByAtlet(c *gin.Context) {
	atletId := c.Param("atlet_id")
	if _, err := strconv.ParseUint(atletId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Atlet harus berupa angka",
			"status": false,
		})
		return
	}
	var hasil []models.HasilPertandingan
	if err := setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").
		Where("atlet_id = ?", atletId).Find(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   hasil,
		"status": true,
	})
}
// GetHasilByNomor - Get results by nomor ID
func GetHasilByNomor(c *gin.Context) {
	nomorId := c.Param("nomor_id")
	if _, err := strconv.ParseUint(nomorId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Nomor harus berupa angka",
			"status": false,
		})
		return
	}
	var hasil []models.HasilPertandingan
	if err := setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").
		Where("nomor_id = ?", nomorId).Find(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   hasil,
		"status": true,
	})
}
// GetHasilByCabor - Get results by cabor ID
func GetHasilByCabor(c *gin.Context) {
	caborId := c.Param("cabor_id")
	if _, err := strconv.ParseUint(caborId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Cabor harus berupa angka",
			"status": false,
		})
		return
	}
	var hasil []models.HasilPertandingan
	if err := setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").
		Joins("JOIN nomors ON hasil_pertandingans.nomor_id = nomors.id").
		Where("nomors.cabor_id = ?", caborId).Find(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   hasil,
		"status": true,
	})
}
// CreateHasil - Create new result
func CreateHasil(c *gin.Context) {
	var hasil models.HasilPertandingan
	// Validate AtletId
	AtletIdStr := strings.TrimSpace(c.PostForm("atlet_id"))
	if AtletIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Atlet tidak boleh kosong",
		})
		return
	}
	AtletId, err := strconv.ParseUint(AtletIdStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Atlet harus berupa angka",
		})
		return
	}
	// Check if atlet exists
	var atlet models.Atlet
	if err := setup.DB.First(&atlet, AtletId).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Atlet tidak ditemukan",
		})
		return
	}
	hasil.AtletId = uint(AtletId)
	// Validate NomorId
	NomorIdStr := strings.TrimSpace(c.PostForm("nomor_id"))
	if NomorIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Nomor tidak boleh kosong",
		})
		return
	}
	NomorId, err := strconv.ParseUint(NomorIdStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Nomor harus berupa angka",
		})
		return
	}
	// Check if nomor exists
	var nomor models.Nomor
	if err := setup.DB.First(&nomor, NomorId).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Nomor pertandingan tidak ditemukan",
		})
		return
	}
	hasil.NomorId = uint(NomorId)
	// Check for duplicate result
	var existingHasil models.HasilPertandingan
	if err := setup.DB.Where("atlet_id = ? AND nomor_id = ?", hasil.AtletId, hasil.NomorId).
		First(&existingHasil).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  false,
			"message": "Hasil pertandingan untuk atlet dan nomor ini sudah ada",
		})
		return
	}
	// Validate EventName (optional, default value)
	EventName := strings.TrimSpace(c.PostForm("event_name"))
	if EventName == "" {
		EventName = "Porprov Pasuruan 2025"
	}
	hasil.EventName = EventName
	// Validate Medali
	Medali := strings.TrimSpace(c.PostForm("medali"))
	if Medali == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Medali tidak boleh kosong",
		})
		return
	}
	if !isValidMedali(Medali) {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Medali harus salah satu dari: Emas, Perak, Perunggu, Partisipasi",
		})
		return
	}
	hasil.Medali = Medali
	// Catatan (optional)
	Catatan := strings.TrimSpace(c.PostForm("catatan"))
	hasil.Catatan = Catatan
	// Save to database
	if err := setup.DB.Create(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  false,
			"message": "Gagal menyimpan hasil pertandingan: " + err.Error(),
		})
		return
	}
	// Preload relationships for response
	setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").First(&hasil, hasil.Id)
	c.JSON(http.StatusCreated, gin.H{
		"status":  true,
		"message": "Hasil pertandingan berhasil ditambahkan",
		"data":    hasil,
	})
}
// UpdateHasil - Update result
func UpdateHasil(c *gin.Context) {
	id := c.Param("id")
	var hasil models.HasilPertandingan
	if err := setup.DB.First(&hasil, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hasil pertandingan tidak ditemukan",
			"status": false,
		})
		return
	}
	// Update AtletId if provided
	AtletIdStr := c.PostForm("atlet_id")
	if AtletIdStr != "" {
		AtletId, err := strconv.ParseUint(AtletIdStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "ID Atlet harus berupa angka",
				"status": false,
			})
			return
		}
		// Check if atlet exists
		var atlet models.Atlet
		if err := setup.DB.First(&atlet, AtletId).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Atlet tidak ditemukan",
				"status": false,
			})
			return
		}
		hasil.AtletId = uint(AtletId)
	}
	// Update NomorId if provided
	NomorIdStr := c.PostForm("nomor_id")
	if NomorIdStr != "" {
		NomorId, err := strconv.ParseUint(NomorIdStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "ID Nomor harus berupa angka",
				"status": false,
			})
			return
		}
		// Check if nomor exists
		var nomor models.Nomor
		if err := setup.DB.First(&nomor, NomorId).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Nomor pertandingan tidak ditemukan",
				"status": false,
			})
			return
		}
		hasil.NomorId = uint(NomorId)
	}
	// Update EventName if provided
	EventName := c.PostForm("event_name")
	if EventName != "" {
		hasil.EventName = strings.TrimSpace(EventName)
	}
	// Update Medali if provided
	Medali := c.PostForm("medali")
	if Medali != "" {
		if !isValidMedali(Medali) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Medali harus salah satu dari: Emas, Perak, Perunggu, Partisipasi",
				"status": false,
			})
			return
		}
		hasil.Medali = Medali
	}
	// Update Catatan if provided
	Catatan := c.PostForm("catatan")
	if Catatan != "" {
		hasil.Catatan = strings.TrimSpace(Catatan)
	}
	// Check for duplicate if AtletId or NomorId changed
	if AtletIdStr != "" || NomorIdStr != "" {
		var existingHasil models.HasilPertandingan
		if err := setup.DB.Where("atlet_id = ? AND nomor_id = ? AND id != ?", 
			hasil.AtletId, hasil.NomorId, hasil.Id).First(&existingHasil).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error":  "Hasil pertandingan untuk atlet dan nomor ini sudah ada",
				"status": false,
			})
			return
		}
	}
	// Save to database
	if err := setup.DB.Save(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Gagal mengupdate hasil pertandingan: " + err.Error(),
			"status": false,
		})
		return
	}
	// Preload relationships for response
	setup.DB.Preload("Atlet").Preload("Nomor").Preload("Nomor.Cabor").First(&hasil, hasil.Id)
	c.JSON(http.StatusOK, gin.H{
		"message": "Hasil pertandingan berhasil diupdate",
		"data":    hasil,
		"status":  true,
	})
}
// DeleteHasil - Delete result
func DeleteHasil(c *gin.Context) {
	id := c.Param("id")
	var hasil models.HasilPertandingan
	if err := setup.DB.First(&hasil, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hasil pertandingan tidak ditemukan",
			"status": false,
		})
		return
	}
	if err := setup.DB.Delete(&hasil).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Gagal menghapus hasil pertandingan",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Hasil pertandingan berhasil dihapus",
		"status":  true,
	})
}
// GetMedalTally - Get medal tally summary
func GetMedalTally(c *gin.Context) {
	type MedalCount struct {
		Medali string `json:"medali"`
		Count  int64  `json:"count"`
	}
	var medalCounts []MedalCount
	if err := setup.DB.Model(&models.HasilPertandingan{}).
		Select("medali, COUNT(*) as count").
		Group("medali").
		Order("FIELD(medali, 'Emas', 'Perak', 'Perunggu', 'Partisipasi')").
		Find(&medalCounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	// Get total athletes and total results
	var totalAtlets int64
	var totalResults int64
	setup.DB.Model(&models.Atlet{}).Count(&totalAtlets)
	setup.DB.Model(&models.HasilPertandingan{}).Count(&totalResults)
	c.JSON(http.StatusOK, gin.H{
		"medal_tally":    medalCounts,
		"total_athletes": totalAtlets,
		"total_results":  totalResults,
		"status":         true,
	})
}
