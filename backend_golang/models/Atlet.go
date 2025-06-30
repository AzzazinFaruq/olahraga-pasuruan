package models
import (
	"time"
)
type Atlet struct {
	Id           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Foto3x4      string    `json:"foto_3x4" gorm:"type:varchar(255)"`
	FotoBebas    string    `json:"foto_bebas" gorm:"type:varchar(255)"`
	NIK          string    `json:"nik" gorm:"type:varchar(16);uniqueIndex;not null"`
	Nama         string    `json:"nama" gorm:"type:varchar(255);not null"`
	TempatLahir  string    `json:"tempat_lahir" gorm:"type:varchar(255);not null"`
	TanggalLahir time.Time `json:"tanggal_lahir" gorm:"type:date;not null"`
	JenisKelamin string    `json:"jenis_kelamin" gorm:"type:enum('Laki-laki','Perempuan');not null"`
	Alamat       string    `json:"alamat" gorm:"type:text;not null"`
	NamaOrtu     string    `json:"nama_ortu" gorm:"type:varchar(255);not null"`
	Sekolah      string    `json:"sekolah" gorm:"type:enum('SD','SMP','SMA','SMK','Universitas','Lainnya');not null"`
	NamaSekolah  string    `json:"nama_sekolah" gorm:"type:varchar(255);not null"`
	// One-to-Many relationships

	Hasil        []HasilPertandingan `gorm:"foreignKey:AtletId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"hasil,omitempty"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}
