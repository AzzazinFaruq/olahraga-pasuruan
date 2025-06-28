package models
import (
	"time"
)
type AtletCabor struct {
	Id        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AtletId   uint      `json:"atlet_id" gorm:"not null;index;uniqueIndex:idx_atlet_cabor"`
	CaborId   uint      `json:"cabor_id" gorm:"not null;index;uniqueIndex:idx_atlet_cabor"`
	// Foreign Key relationships
	Atlet     Atlet     `gorm:"foreignKey:AtletId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"atlet,omitempty"`
	Cabor     Cabor     `gorm:"foreignKey:CaborId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"cabor,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
// Add unique constraint to prevent duplicate entries
func (AtletCabor) TableName() string {
	return "atlet_cabors"
}
