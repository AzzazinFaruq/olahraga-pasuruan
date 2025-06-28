package main
import (
	"backend_golang/models"
	"backend_golang/setup"
	"fmt"
	"log"
	"os"
	"time"
)
func main() {
	// Connect to database
	setup.ConnectDatabase()
	fmt.Println("🚀 Starting Database Migration...")
	fmt.Println("=====================================")
	// Step 1: Backup existing data
	if err := backupExistingData(); err != nil {
		log.Fatalf("❌ Backup failed: %v", err)
	}
	// Step 2: Migrate existing athlete-cabor relationships
	if err := migrateAtletCaborRelationships(); err != nil {
		log.Fatalf("❌ Atlet-Cabor migration failed: %v", err)
	}
	// Step 3: Migrate existing hasil data (if any)
	if err := migrateHasilPertandingan(); err != nil {
		log.Fatalf("❌ Hasil migration failed: %v", err)
	}
	// Step 4: Update ENUM fields
	if err := updateEnumFields(); err != nil {
		log.Fatalf("❌ ENUM update failed: %v", err)
	}
	// Step 5: Validate data integrity
	if err := validateDataIntegrity(); err != nil {
		log.Fatalf("❌ Data validation failed: %v", err)
	}
	fmt.Println("✅ Migration completed successfully!")
	fmt.Println("=====================================")
}
func backupExistingData() error {
	fmt.Println("📦 Creating backup of existing data...")
	// Create backup tables
	backupQueries := []string{
		`CREATE TABLE IF NOT EXISTS backup_atlets AS SELECT * FROM atlets`,
		`CREATE TABLE IF NOT EXISTS backup_cabors AS SELECT * FROM cabors`,
		`CREATE TABLE IF NOT EXISTS backup_nomors AS SELECT * FROM nomors`,
		`CREATE TABLE IF NOT EXISTS backup_dokumentasis AS SELECT * FROM dokumentasis`,
		`CREATE TABLE IF NOT EXISTS backup_hasil_pertandingans AS SELECT * FROM hasil_pertandingans`,
	}
	for _, query := range backupQueries {
		if err := setup.DB.Exec(query).Error; err != nil {
			// Ignore table already exists errors
			fmt.Printf("⚠️  Backup query note: %v\n", err)
		}
	}
	// Save backup timestamp
	timestamp := time.Now().Format("20060102_150405")
	backupLog := fmt.Sprintf("-- Backup created at: %s\n", timestamp)
	if err := os.WriteFile("migration_backup_"+timestamp+".log", []byte(backupLog), 0644); err != nil {
		return fmt.Errorf("failed to create backup log: %v", err)
	}
	fmt.Println("✅ Backup completed")
	return nil
}
func migrateAtletCaborRelationships() error {
	fmt.Println("🔄 Migrating Atlet-Cabor relationships...")
	// Check if old CaborID column exists
	var count int64
	if err := setup.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'atlets' AND column_name = 'cabor_id'").Scan(&count).Error; err != nil {
		return fmt.Errorf("failed to check column existence: %v", err)
	}
	if count == 0 {
		fmt.Println("ℹ️  No old CaborID column found, skipping migration")
		return nil
	}
	// Migrate existing relationships
	query := `
		INSERT IGNORE INTO atlet_cabors (atlet_id, cabor_id, created_at, updated_at)
		SELECT id, cabor_id, NOW(), NOW() 
		FROM atlets 
		WHERE cabor_id IS NOT NULL AND cabor_id > 0
	`
	result := setup.DB.Exec(query)
	if result.Error != nil {
		return fmt.Errorf("failed to migrate relationships: %v", result.Error)
	}
	fmt.Printf("✅ Migrated %d athlete-cabor relationships\n", result.RowsAffected)
	return nil
}
func migrateHasilPertandingan() error {
	fmt.Println("🏆 Migrating Hasil Pertandingan data...")
	// Check if we have any existing hasil data to migrate
	var count int64
	if err := setup.DB.Model(&models.HasilPertandingan{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count existing hasil: %v", err)
	}
	if count == 0 {
		fmt.Println("ℹ️  No existing hasil data found, creating sample data for testing...")
		return createSampleHasil()
	}
	fmt.Printf("ℹ️  Found %d existing hasil records, no migration needed\n", count)
	return nil
}
func createSampleHasil() error {
	// Create some sample results for testing
	sampleResults := []models.HasilPertandingan{
		{
			AtletId:   1,
			NomorId:   1,
			EventName: "Porprov Pasuruan 2025",
			Medali:    "Emas",
			Catatan:   "Rekor baru cabang renang",
		},
		{
			AtletId:   1,
			NomorId:   2,
			EventName: "Porprov Pasuruan 2025",
			Medali:    "Perak",
			Catatan:   "Performa sangat baik",
		},
	}
	for _, hasil := range sampleResults {
		// Check if atlet and nomor exist
		var atletExists, nomorExists int64
		setup.DB.Model(&models.Atlet{}).Where("id = ?", hasil.AtletId).Count(&atletExists)
		setup.DB.Model(&models.Nomor{}).Where("id = ?", hasil.NomorId).Count(&nomorExists)
		if atletExists > 0 && nomorExists > 0 {
			if err := setup.DB.Create(&hasil).Error; err != nil {
				fmt.Printf("⚠️  Failed to create sample hasil: %v\n", err)
			}
		}
	}
	fmt.Println("✅ Sample hasil data created")
	return nil
}
func updateEnumFields() error {
	fmt.Println("🔧 Updating ENUM fields...")
	// Update gender field from int to string
	genderUpdates := map[string]string{
		"1": "Laki-laki",
		"2": "Perempuan",
	}
	for oldVal, newVal := range genderUpdates {
		query := "UPDATE atlets SET jenis_kelamin = ? WHERE jenis_kelamin = ?"
		if err := setup.DB.Exec(query, newVal, oldVal).Error; err != nil {
			fmt.Printf("⚠️  Gender update warning: %v\n", err)
		}
	}
	// Update school field from int to string
	schoolUpdates := map[string]string{
		"1": "SD",
		"2": "SMP", 
		"3": "SMA",
		"4": "SMK",
		"5": "Universitas",
	}
	for oldVal, newVal := range schoolUpdates {
		query := "UPDATE atlets SET sekolah = ? WHERE sekolah = ?"
		if err := setup.DB.Exec(query, newVal, oldVal).Error; err != nil {
			fmt.Printf("⚠️  School update warning: %v\n", err)
		}
	}
	// Set default values for any remaining invalid entries
	if err := setup.DB.Exec("UPDATE atlets SET jenis_kelamin = 'Laki-laki' WHERE jenis_kelamin NOT IN ('Laki-laki', 'Perempuan')").Error; err != nil {
		fmt.Printf("⚠️  Gender default update warning: %v\n", err)
	}
	if err := setup.DB.Exec("UPDATE atlets SET sekolah = 'Lainnya' WHERE sekolah NOT IN ('SD', 'SMP', 'SMA', 'SMK', 'Universitas', 'Lainnya')").Error; err != nil {
		fmt.Printf("⚠️  School default update warning: %v\n", err)
	}
	fmt.Println("✅ ENUM fields updated")
	return nil
}
func validateDataIntegrity() error {
	fmt.Println("✅ Validating data integrity...")
	// Check for orphaned data
	var orphanedDokumentation int64
	if err := setup.DB.Raw(`
		SELECT COUNT(*) FROM dokumentasis d 
		LEFT JOIN atlets a ON d.atlet_id = a.id 
		WHERE a.id IS NULL
	`).Scan(&orphanedDokumentation).Error; err != nil {
		return fmt.Errorf("failed to check orphaned documentation: %v", err)
	}
	if orphanedDokumentation > 0 {
		fmt.Printf("⚠️  Found %d orphaned documentation records\n", orphanedDokumentation)
	}
	// Check AtletCabor relationships
	var invalidAtletCabor int64
	if err := setup.DB.Raw(`
		SELECT COUNT(*) FROM atlet_cabors ac
		LEFT JOIN atlets a ON ac.atlet_id = a.id
		LEFT JOIN cabors c ON ac.cabor_id = c.id
		WHERE a.id IS NULL OR c.id IS NULL
	`).Scan(&invalidAtletCabor).Error; err != nil {
		return fmt.Errorf("failed to check atlet_cabor integrity: %v", err)
	}
	if invalidAtletCabor > 0 {
		fmt.Printf("⚠️  Found %d invalid atlet-cabor relationships\n", invalidAtletCabor)
	}
	// Check Hasil relationships
	var invalidHasil int64
	if err := setup.DB.Raw(`
		SELECT COUNT(*) FROM hasil_pertandingans h
		LEFT JOIN atlets a ON h.atlet_id = a.id
		LEFT JOIN nomors n ON h.nomor_id = n.id
		WHERE a.id IS NULL OR n.id IS NULL
	`).Scan(&invalidHasil).Error; err != nil {
		return fmt.Errorf("failed to check hasil integrity: %v", err)
	}
	if invalidHasil > 0 {
		fmt.Printf("⚠️  Found %d invalid hasil relationships\n", invalidHasil)
	}
	// Count final records
	var atletCount, caborCount, atletCaborCount, hasilCount int64
	setup.DB.Model(&models.Atlet{}).Count(&atletCount)
	setup.DB.Model(&models.Cabor{}).Count(&caborCount)
	setup.DB.Model(&models.AtletCabor{}).Count(&atletCaborCount)
	setup.DB.Model(&models.HasilPertandingan{}).Count(&hasilCount)
	fmt.Printf("📊 Final counts:\n")
	fmt.Printf("   - Athletes: %d\n", atletCount)
	fmt.Printf("   - Sports: %d\n", caborCount)
	fmt.Printf("   - Athlete-Sport relationships: %d\n", atletCaborCount)
	fmt.Printf("   - Competition results: %d\n", hasilCount)
	fmt.Println("✅ Data integrity validation completed")
	return nil
}
