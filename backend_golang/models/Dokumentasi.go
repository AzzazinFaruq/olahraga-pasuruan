package models
import (
	"time"
)
type Dokumentasi struct {
	Id          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Dokumentasi string    `json:"dokumentasi" gorm:"type:varchar(255);not null"`
	HasilPertandinganId uint `json:"hasil_pertandingan_id" gorm:"not null;index"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	HasilPertandingan HasilPertandingan   `gorm:"foreignKey:HasilPertandinganId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"hasil_pertandingan,omitempty"`
}
