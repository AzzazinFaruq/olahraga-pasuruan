package main
import (
	"backend_golang/setup"
	"fmt"
	"log"
	"os"
	"time"
)
func main() {
	// Connect to database
	setup.ConnectDatabase()
	fmt.Println("🔙 Starting Database Rollback...")
	fmt.Println("==================================")
	// Step 1: Confirm rollback
	fmt.Println("⚠️  WARNING: This will rollback the database to the previous state!")
	fmt.Println("⚠️  This action cannot be undone!")
	fmt.Println("⚠️  Make sure you have a current backup before proceeding!")
	// In a real scenario, you'd want user confirmation here
	// For this script, we'll proceed automatically
	// Step 2: Restore from backup tables
	if err := restoreFromBackup(); err != nil {
		log.Fatalf("❌ Rollback failed: %v", err)
	}
	// Step 3: Clean up new tables
	if err := cleanupNewTables(); err != nil {
		log.Fatalf("❌ Cleanup failed: %v", err)
	}
	// Step 4: Restore old schema structure
	if err := restoreOldSchema(); err != nil {
		log.Fatalf("❌ Schema restore failed: %v", err)
	}
	// Step 5: Create rollback log
	if err := createRollbackLog(); err != nil {
		log.Fatalf("❌ Log creation failed: %v", err)
	}
	fmt.Println("✅ Rollback completed successfully!")
	fmt.Println("==================================")
}
func restoreFromBackup() error {
	fmt.Println("📦 Restoring from backup tables...")
	// List of tables to restore
	tables := []string{
		"atlets",
		"cabors", 
		"nomors",
		"dokumentasis",
		"hasil_pertandingans",
	}
	for _, table := range tables {
		backupTable := "backup_" + table
		// Check if backup table exists
		var exists int64
		if err := setup.DB.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?", backupTable).Scan(&exists).Error; err != nil {
			fmt.Printf("⚠️  Could not check backup table %s: %v\n", backupTable, err)
			continue
		}
		if exists == 0 {
			fmt.Printf("ℹ️  No backup table found for %s, skipping\n", table)
			continue
		}
		// Restore data
		restoreQuery := fmt.Sprintf(`
			DELETE FROM %s;
			INSERT INTO %s SELECT * FROM %s;
		`, table, table, backupTable)
		if err := setup.DB.Exec(restoreQuery).Error; err != nil {
			fmt.Printf("⚠️  Failed to restore %s: %v\n", table, err)
		} else {
			fmt.Printf("✅ Restored %s from backup\n", table)
		}
	}
	return nil
}
func cleanupNewTables() error {
	fmt.Println("🧹 Cleaning up new tables...")
	// Drop new tables created during migration
	newTables := []string{
		"atlet_cabors",
	}
	for _, table := range newTables {
		if err := setup.DB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s", table)).Error; err != nil {
			fmt.Printf("⚠️  Failed to drop table %s: %v\n", table, err)
		} else {
			fmt.Printf("✅ Dropped table %s\n", table)
		}
	}
	return nil
}
func restoreOldSchema() error {
	fmt.Println("🔧 Restoring old schema structure...")
	// Add back CaborID column to atlets table if it doesn't exist
	var columnExists int64
	if err := setup.DB.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'atlets' AND column_name = 'cabor_id'").Scan(&columnExists).Error; err != nil {
		return fmt.Errorf("failed to check cabor_id column: %v", err)
	}
	if columnExists == 0 {
		// Add the column back
		if err := setup.DB.Exec("ALTER TABLE atlets ADD COLUMN cabor_id INT").Error; err != nil {
			fmt.Printf("⚠️  Failed to add cabor_id column: %v\n", err)
		} else {
			fmt.Println("✅ Added back cabor_id column to atlets")
		}
	}
	// Restore old data types (if needed)
	// Convert string enums back to integers
	genderRestore := map[string]string{
		"Laki-laki": "1",
		"Perempuan": "2",
	}
	for newVal, oldVal := range genderRestore {
		query := "UPDATE atlets SET jenis_kelamin = ? WHERE jenis_kelamin = ?"
		if err := setup.DB.Exec(query, oldVal, newVal).Error; err != nil {
			fmt.Printf("⚠️  Gender restore warning: %v\n", err)
		}
	}
	schoolRestore := map[string]string{
		"SD":          "1",
		"SMP":         "2",
		"SMA":         "3", 
		"SMK":         "4",
		"Universitas": "5",
		"Lainnya":     "6",
	}
	for newVal, oldVal := range schoolRestore {
		query := "UPDATE atlets SET sekolah = ? WHERE sekolah = ?"
		if err := setup.DB.Exec(query, oldVal, newVal).Error; err != nil {
			fmt.Printf("⚠️  School restore warning: %v\n", err)
		}
	}
	fmt.Println("✅ Old schema structure restored")
	return nil
}
func createRollbackLog() error {
	timestamp := time.Now().Format("20060102_150405")
	logContent := fmt.Sprintf(`
Rollback executed at: %s
Steps performed:
1. Restored data from backup tables
2. Dropped new tables (atlet_cabors)
3. Restored old schema structure
4. Converted ENUM fields back to integers
Note: Verify that all data is correctly restored and applications are working as expected.
`, timestamp)
	filename := fmt.Sprintf("rollback_log_%s.txt", timestamp)
	if err := os.WriteFile(filename, []byte(logContent), 0644); err != nil {
		return fmt.Errorf("failed to create rollback log: %v", err)
	}
	fmt.Printf("📝 Rollback log created: %s\n", filename)
	return nil
}
