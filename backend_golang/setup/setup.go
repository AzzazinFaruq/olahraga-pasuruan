package setup
import (
	"backend_golang/models"
	"log"
	"os"
	"strconv"
	"time"
	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)
var DB *gorm.DB
func ConnectDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found. Using environment variables.")
	}
	dbUser := os.Getenv("DB_USERNAME")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbName := os.Getenv("DB_NAME")
	if dbUser == "" || dbHost == "" || dbName == "" {
		log.Fatal("Database configuration variables are not set properly.")
	}
	dsn := dbUser + ":" + dbPass + "@tcp(" + dbHost + ":" + dbPort + ")/" + dbName +
		"?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	sqlDB, err := database.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}
	maxIdleConns := getEnvAsInt("DB_MAX_IDLE_CONNS", 25)
	maxOpenConns := getEnvAsInt("DB_MAX_OPEN_CONNS", 200)
	connMaxLifetime := getEnvAsInt("DB_CONN_MAX_LIFETIME", 3600)
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Duration(connMaxLifetime) * time.Second)
	err = database.AutoMigrate(
		&models.User{},
		&models.Atlet{},
		&models.Cabor{},
		&models.Nomor{},
		&models.AtletCabor{},
		&models.HasilPertandingan{},
		&models.Dokumentasi{},
	)
	if err != nil {
		log.Fatalf("Auto migration failed: %v", err)
	}
	DB = database
}
func getEnvAsInt(name string, defaultValue int) int {
	valueStr := os.Getenv(name)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		log.Printf("Invalid value for %s: %s, using default: %d", name, valueStr, defaultValue)
		return defaultValue
	}
	return value
}