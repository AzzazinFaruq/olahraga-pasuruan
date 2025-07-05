package models

import (
	"time"
)
type News struct {
	Id        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Cover     string    `json:"cover" gorm:"type:varchar(255);not null"`
	Title     string    `json:"title" gorm:"type:varchar(255);not null"`
	Source    string    `json:"source" gorm:"type:varchar(255);null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}