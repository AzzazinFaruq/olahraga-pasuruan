package models
import (
	"time"
)
type User struct {
	Id        uint      `gorm:"primary_key"`
	Username  string    `json:"username" gorm:"not null;unique"`
	Password  string    `json:"password" gorm:"not null"`
	Email     string    `json:"email" gorm:"not null;unique"`
	Role      int8      `json:"role" gorm:"default:2"`
	//1 = admin
	//2 = user
	CreatedAt time.Time `gorm:"type:timestamp;default:current_timestamp"`
	UpdatedAt time.Time `gorm:"type:timestamp;default:current_timestamp on update current_timestamp"`
}
