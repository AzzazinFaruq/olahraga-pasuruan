package models
import (
	"time"
)
type HasilPertandingan struct {
	Id        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AtletId   uint      `json:"atlet_id" gorm:"not null;index"`
	NomorId   uint      `json:"nomor_id" gorm:"not null;index"`
	EventName string    `json:"event_name" gorm:"type:varchar(255);default:'Porprov Pasuruan 2025'"`
	Medali    string    `json:"medali" gorm:"type:enum('Emas','Perak','Perunggu','Partisipasi');not null"`
	Catatan   string    `json:"catatan" gorm:"type:text"`
	UserId    uint      `json:"user_id" gorm:"not null;index"`
	
	// Foreign Key relationships
	User      User      `gorm:"foreignKey:UserId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"user,omitempty"`
	Atlet     Atlet     `gorm:"foreignKey:AtletId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"atlet,omitempty"`
	Nomor     Nomor     `gorm:"foreignKey:NomorId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"nomor,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
