package utils
import (
	"regexp"
	"strconv"
	"strings"
	"time"
)
// NIK validation for Indonesian ID numbers
func IsValidNIK(nik string) bool {
	// Indonesian NIK should be 16 digits
	if len(nik) != 16 {
		return false
	}
	// Should contain only digits
	nikRegex := regexp.MustCompile(`^\d{16}$`)
	if !nikRegex.MatchString(nik) {
		return false
	}
	// Additional validation: check birth date part (positions 7-12: DDMMYY)
	day, _ := strconv.Atoi(nik[6:8])
	month, _ := strconv.Atoi(nik[8:10])
	year, _ := strconv.Atoi(nik[10:12])
	// Adjust for female (day + 40)
	if day > 40 {
		day -= 40
	}
	// Basic date validation
	if day < 1 || day > 31 || month < 1 || month > 12 {
		return false
	}
	// Year validation (assuming current century for 2-digit year)
	if year > 50 {
		year += 1900
	} else {
		year += 2000
	}
	// Check if the person is not from the future
	currentYear := time.Now().Year()
	if year > currentYear {
		return false
	}
	return true
}
// Gender validation
func IsValidGender(gender string) bool {
	validGenders := []string{"Laki-laki", "Perempuan"}
	for _, valid := range validGenders {
		if gender == valid {
			return true
		}
	}
	return false
}
// School type validation
func IsValidSchoolType(school string) bool {
	validSchools := []string{"SD", "SMP", "SMA", "SMK", "Universitas", "Lainnya"}
	for _, valid := range validSchools {
		if school == valid {
			return true
		}
	}
	return false
}
// Medal validation
func IsValidMedal(medal string) bool {
	validMedals := []string{"Emas", "Perak", "Perunggu", "Partisipasi"}
	for _, valid := range validMedals {
		if medal == valid {
			return true
		}
	}
	return false
}
// Image file validation
func IsValidImageFile(filename string) bool {
	if filename == "" {
		return false
	}
	ext := strings.ToLower(strings.TrimSpace(filename))
	// Get file extension
	parts := strings.Split(ext, ".")
	if len(parts) < 2 {
		return false
	}
	extension := parts[len(parts)-1]
	allowedExts := []string{"jpg", "jpeg", "png", "gif", "webp"}
	for _, allowedExt := range allowedExts {
		if extension == allowedExt {
			return true
		}
	}
	return false
}
// Name validation (Indonesian names)
func IsValidName(name string) bool {
	name = strings.TrimSpace(name)
	// Length check
	if len(name) < 2 || len(name) > 100 {
		return false
	}
	// Should contain at least one letter
	hasLetter := regexp.MustCompile(`[a-zA-Z]`).MatchString(name)
	if !hasLetter {
		return false
	}
	// Should not contain numbers or special characters except spaces, apostrophes, and hyphens
	validNameRegex := regexp.MustCompile(`^[a-zA-Z\s'\-\.]+$`)
	return validNameRegex.MatchString(name)
}
// Date validation helper
func IsValidDate(dateStr string) (time.Time, bool) {
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, false
	}
	// Check if date is not in the future
	if date.After(time.Now()) {
		return time.Time{}, false
	}
	// Check if date is not too far in the past (e.g., not before 1900)
	if date.Year() < 1900 {
		return time.Time{}, false
	}
	return date, true
}
// ParseDate is an alias for IsValidDate for consistency
func ParseDate(dateStr string) (time.Time, bool) {
	return IsValidDate(dateStr)
}
// Age calculation from birth date
func CalculateAge(birthDate time.Time) int {
	now := time.Now()
	age := now.Year() - birthDate.Year()
	// Adjust age if birthday hasn't occurred this year
	if now.Month() < birthDate.Month() || (now.Month() == birthDate.Month() && now.Day() < birthDate.Day()) {
		age--
	}
	return age
}
// Age validation for athletes
func IsValidAthleteAge(birthDate time.Time) bool {
	age := CalculateAge(birthDate)
	// Athletes should be between 5 and 50 years old
	return age >= 5 && age <= 50
}
// Sanitize string input
func SanitizeString(input string) string {
	// Trim whitespace
	sanitized := strings.TrimSpace(input)
	// Remove multiple consecutive spaces
	spaceRegex := regexp.MustCompile(`\s+`)
	sanitized = spaceRegex.ReplaceAllString(sanitized, " ")
	return sanitized
}
// Filename sanitization
func SanitizeFilename(filename string) string {
	// Remove potentially dangerous characters
	reg := regexp.MustCompile(`[^a-zA-Z0-9\.\-_]`)
	sanitized := reg.ReplaceAllString(filename, "_")
	// Ensure it doesn't start with a dot or hyphen
	if strings.HasPrefix(sanitized, ".") || strings.HasPrefix(sanitized, "-") {
		sanitized = "file_" + sanitized
	}
	return sanitized
}
// Phone number validation (Indonesian format)
func IsValidPhoneNumber(phone string) bool {
	// Remove all non-digit characters
	phone = regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
	// Indonesian phone numbers
	if len(phone) < 10 || len(phone) > 15 {
		return false
	}
	// Should start with 08, 62, or country code
	return regexp.MustCompile(`^(08|62|\\+62)`).MatchString(phone)
}
// Validation error details
type ValidError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
}
type ValidationErrors []ValidError
func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}
func (ve ValidationErrors) Error() string {
	if len(ve) == 0 {
		return ""
	}
	return ve[0].Message
}
