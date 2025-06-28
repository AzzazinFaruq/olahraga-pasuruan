package models
import (
	"time"
)
type Cabor struct {
	Id        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	NamaCabor string    `json:"nama_cabor" gorm:"type:varchar(255);uniqueIndex;not null"`
	// One-to-Many relationships
	Nomors    []Nomor    `gorm:"foreignKey:CaborID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"nomors,omitempty"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}
type Nomor struct {
	Id        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	NamaNomor string    `json:"nama_nomor" gorm:"type:varchar(255);not null"`
	CaborID   uint      `json:"cabor_id" gorm:"not null;index"`
	Cabor     Cabor     `gorm:"foreignKey:CaborID;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"cabor,omitempty"`
	// One-to-Many relationship
	Hasil     []HasilPertandingan `gorm:"foreignKey:NomorId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"hasil,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
