package models
import (
	"time"
)
type Dokumentasi struct {
	Id          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Dokumentasi string    `json:"dokumentasi" gorm:"type:varchar(255);not null"`
	AtletId     uint      `json:"atlet_id" gorm:"not null;index"`
	Atlet       Atlet     `gorm:"foreignKey:AtletId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"atlet,omitempty"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
