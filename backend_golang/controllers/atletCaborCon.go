package controllers
import (
	"backend_golang/models"
	"backend_golang/setup"
	"net/http"
	"strconv"
	"strings"
	"github.com/gin-gonic/gin"
)
// GetAllAtletCabor - Get all athlete-sport relationships
func GetAllAtletCabor(c *gin.Context) {
	var atletCabors []models.AtletCabor
	if err := setup.DB.Preload("Atlet").Preload("Cabor").Find(&atletCabors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "status": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   atletCabors,
		"status": true,
	})
}
// AssignAtletToCabor - Assign athlete to sport
func AssignAtletToCabor(c *gin.Context) {
	var atletCabor models.AtletCabor
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
	atletCabor.AtletId = uint(AtletId)
	// Validate CaborId
	CaborIdStr := strings.TrimSpace(c.PostForm("cabor_id"))
	if CaborIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Cabor tidak boleh kosong",
		})
		return
	}
	CaborId, err := strconv.ParseUint(CaborIdStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "ID Cabor harus berupa angka",
		})
		return
	}
	// Check if cabor exists
	var cabor models.Cabor
	if err := setup.DB.First(&cabor, CaborId).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  false,
			"message": "Cabor tidak ditemukan",
		})
		return
	}
	atletCabor.CaborId = uint(CaborId)
	// Check for duplicate assignment
	var existingAtletCabor models.AtletCabor
	if err := setup.DB.Where("atlet_id = ? AND cabor_id = ?", atletCabor.AtletId, atletCabor.CaborId).
		First(&existingAtletCabor).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"status":  false,
			"message": "Atlet sudah terdaftar di cabor ini",
		})
		return
	}
	// Save to database
	if err := setup.DB.Create(&atletCabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  false,
			"message": "Gagal menghubungkan atlet dengan cabor: " + err.Error(),
		})
		return
	}
	// Preload relationships for response
	setup.DB.Preload("Atlet").Preload("Cabor").First(&atletCabor, atletCabor.Id)
	c.JSON(http.StatusCreated, gin.H{
		"status":  true,
		"message": "Atlet berhasil dihubungkan dengan cabor",
		"data":    atletCabor,
	})
}
// RemoveAtletFromCabor - Remove athlete from sport
func RemoveAtletFromCabor(c *gin.Context) {
	atletId := c.Param("atlet_id")
	caborId := c.Param("cabor_id")
	// Validate IDs
	if _, err := strconv.ParseUint(atletId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Atlet harus berupa angka",
			"status": false,
		})
		return
	}
	if _, err := strconv.ParseUint(caborId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Cabor harus berupa angka",
			"status": false,
		})
		return
	}
	var atletCabor models.AtletCabor
	if err := setup.DB.Where("atlet_id = ? AND cabor_id = ?", atletId, caborId).
		First(&atletCabor).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hubungan atlet-cabor tidak ditemukan",
			"status": false,
		})
		return
	}
	if err := setup.DB.Delete(&atletCabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Gagal menghapus hubungan atlet-cabor",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Atlet berhasil dihapus dari cabor",
		"status":  true,
	})
}
// GetAtletByCabor - Get all athletes in a specific sport
func GetAtletByCabor(c *gin.Context) {
	caborId := c.Param("cabor_id")
	if _, err := strconv.ParseUint(caborId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Cabor harus berupa angka",
			"status": false,
		})
		return
	}
	// Check if cabor exists
	var cabor models.Cabor
	if err := setup.DB.First(&cabor, caborId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Cabor tidak ditemukan",
			"status": false,
		})
		return
	}
	var atlets []models.Atlet
	if err := setup.DB.Joins("JOIN atlet_cabors ON atlets.id = atlet_cabors.atlet_id").
		Where("atlet_cabors.cabor_id = ?", caborId).
		Find(&atlets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   atlets,
		"cabor":  cabor,
		"status": true,
	})
}
// GetCaborByAtlet - Get all sports for a specific athlete
func GetCaborByAtlet(c *gin.Context) {
	atletId := c.Param("atlet_id")
	if _, err := strconv.ParseUint(atletId, 10, 32); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":  "ID Atlet harus berupa angka",
			"status": false,
		})
		return
	}
	// Check if atlet exists
	var atlet models.Atlet
	if err := setup.DB.First(&atlet, atletId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Atlet tidak ditemukan",
			"status": false,
		})
		return
	}
	var cabors []models.Cabor
	if err := setup.DB.Joins("JOIN atlet_cabors ON cabors.id = atlet_cabors.cabor_id").
		Where("atlet_cabors.atlet_id = ?", atletId).
		Find(&cabors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   cabors,
		"atlet":  atlet,
		"status": true,
	})
}
// UpdateAtletCabor - Update athlete-sport relationship (mainly for future extensions)
func UpdateAtletCabor(c *gin.Context) {
	id := c.Param("id")
	var atletCabor models.AtletCabor
	if err := setup.DB.First(&atletCabor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hubungan atlet-cabor tidak ditemukan",
			"status": false,
		})
		return
	}
	// For now, this mainly serves as a placeholder for future extensions
	// such as adding status, priority, or other metadata to the relationship
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
		atletCabor.AtletId = uint(AtletId)
	}
	// Update CaborId if provided
	CaborIdStr := c.PostForm("cabor_id")
	if CaborIdStr != "" {
		CaborId, err := strconv.ParseUint(CaborIdStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "ID Cabor harus berupa angka",
				"status": false,
			})
			return
		}
		// Check if cabor exists
		var cabor models.Cabor
		if err := setup.DB.First(&cabor, CaborId).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":  "Cabor tidak ditemukan",
				"status": false,
			})
			return
		}
		atletCabor.CaborId = uint(CaborId)
	}
	// Check for duplicate if IDs changed
	if AtletIdStr != "" || CaborIdStr != "" {
		var existingAtletCabor models.AtletCabor
		if err := setup.DB.Where("atlet_id = ? AND cabor_id = ? AND id != ?", 
			atletCabor.AtletId, atletCabor.CaborId, atletCabor.Id).First(&existingAtletCabor).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error":  "Hubungan atlet-cabor ini sudah ada",
				"status": false,
			})
			return
		}
	}
	// Save to database
	if err := setup.DB.Save(&atletCabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Gagal mengupdate hubungan atlet-cabor: " + err.Error(),
			"status": false,
		})
		return
	}
	// Preload relationships for response
	setup.DB.Preload("Atlet").Preload("Cabor").First(&atletCabor, atletCabor.Id)
	c.JSON(http.StatusOK, gin.H{
		"message": "Hubungan atlet-cabor berhasil diupdate",
		"data":    atletCabor,
		"status":  true,
	})
}
// DeleteAtletCabor - Delete athlete-sport relationship by ID
func DeleteAtletCabor(c *gin.Context) {
	id := c.Param("id")
	var atletCabor models.AtletCabor
	if err := setup.DB.First(&atletCabor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":  "Hubungan atlet-cabor tidak ditemukan",
			"status": false,
		})
		return
	}
	if err := setup.DB.Delete(&atletCabor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "Gagal menghapus hubungan atlet-cabor",
			"status": false,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Hubungan atlet-cabor berhasil dihapus",
		"status":  true,
	})
}
// GetAtletCaborStats - Get statistics about athlete-sport relationships
func GetAtletCaborStats(c *gin.Context) {
	type CaborStats struct {
		CaborID    uint   `json:"cabor_id"`
		NamaCabor  string `json:"nama_cabor"`
		JumlahAtlet int64  `json:"jumlah_atlet"`
	}
	var caborStats []CaborStats
	if err := setup.DB.Table("atlet_cabors").
		Select("cabors.id as cabor_id, cabors.nama_cabor, COUNT(atlet_cabors.atlet_id) as jumlah_atlet").
		Joins("JOIN cabors ON cabors.id = atlet_cabors.cabor_id").
		Group("cabors.id, cabors.nama_cabor").
		Order("jumlah_atlet DESC").
		Find(&caborStats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"status": false,
		})
		return
	}
	// Get total unique relationships
	var totalRelationships int64
	setup.DB.Model(&models.AtletCabor{}).Count(&totalRelationships)
	// Get total unique athletes in any sport
	var totalAtletsInSport int64
	setup.DB.Model(&models.AtletCabor{}).Distinct("atlet_id").Count(&totalAtletsInSport)
	c.JSON(http.StatusOK, gin.H{
		"cabor_stats":           caborStats,
		"total_relationships":   totalRelationships,
		"total_athletes_in_sport": totalAtletsInSport,
		"status":                true,
	})
}
