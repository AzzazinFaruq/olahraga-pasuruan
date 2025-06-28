package utils
import (
	"fmt"
	"regexp"
	"strings"
)
// SQL injection patterns to detect and prevent
var sqlInjectionPatterns = []*regexp.Regexp{
	// SQL keywords that are commonly used in injection attacks
	regexp.MustCompile(`(?i)\b(union\s+select|insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s+table|create\s+table|alter\s+table|exec\s*\(|execute\s*\()\b`),
	// SQL comments and string delimiters in suspicious contexts
	regexp.MustCompile(`(?i)(--|/\*|\*/|;)\s*(\w|$)`),
	// SQL condition patterns that could be injections
	regexp.MustCompile(`(?i)\b(or|and)\s+\w+\s*=\s*\w+\s*(--|\s*;|\s*union)`),
	regexp.MustCompile(`(?i)\w+\s*=\s*\w+\s+(or|and)\s+\w+\s*=\s*\w+`),
	// Time-based injection patterns
	regexp.MustCompile(`(?i)\b(sleep|benchmark|waitfor|delay)\s*\(`),
	// Specific SQL injection patterns
	regexp.MustCompile(`(?i)\'\s*(or|and)\s+\'\w*\'\s*=\s*\'\w*`),
	regexp.MustCompile(`(?i)\'\s*;\s*(drop|delete|insert|update)`),
}
// XSS patterns to detect and prevent
var xssPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`),
	regexp.MustCompile(`(?i)<iframe[^>]*>.*?</iframe>`),
	regexp.MustCompile(`(?i)<object[^>]*>.*?</object>`),
	regexp.MustCompile(`(?i)<embed[^>]*>.*?</embed>`),
	regexp.MustCompile(`(?i)javascript:`),
	regexp.MustCompile(`(?i)vbscript:`),
	regexp.MustCompile(`(?i)on\w+\s*=`),
}
// CheckSQLInjection checks if input contains potential SQL injection patterns
func CheckSQLInjection(input string) bool {
	input = strings.ToLower(strings.TrimSpace(input))
	for _, pattern := range sqlInjectionPatterns {
		if pattern.MatchString(input) {
			return true
		}
	}
	return false
}
// CheckXSS checks if input contains potential XSS patterns
func CheckXSS(input string) bool {
	input = strings.ToLower(strings.TrimSpace(input))
	for _, pattern := range xssPatterns {
		if pattern.MatchString(input) {
			return true
		}
	}
	return false
}
// SanitizeInput performs comprehensive input sanitization
func SanitizeInput(input string) string {
	// Trim whitespace
	sanitized := strings.TrimSpace(input)
	// Remove potential XSS vectors
	sanitized = SanitizeXSS(sanitized)
	// Remove multiple spaces
	spaceRegex := regexp.MustCompile(`\s+`)
	sanitized = spaceRegex.ReplaceAllString(sanitized, " ")
	return sanitized
}
// SanitizeXSS removes XSS patterns from input
func SanitizeXSS(input string) string {
	// Remove script tags
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	input = scriptRegex.ReplaceAllString(input, "")
	// Remove iframe tags
	iframeRegex := regexp.MustCompile(`(?i)<iframe[^>]*>.*?</iframe>`)
	input = iframeRegex.ReplaceAllString(input, "")
	// Remove object tags
	objectRegex := regexp.MustCompile(`(?i)<object[^>]*>.*?</object>`)
	input = objectRegex.ReplaceAllString(input, "")
	// Remove embed tags
	embedRegex := regexp.MustCompile(`(?i)<embed[^>]*>.*?</embed>`)
	input = embedRegex.ReplaceAllString(input, "")
	// Remove javascript: and vbscript: protocols
	jsRegex := regexp.MustCompile(`(?i)(javascript|vbscript):`)
	input = jsRegex.ReplaceAllString(input, "")
	// Remove event handlers
	eventRegex := regexp.MustCompile(`(?i)on\w+\s*=\s*[^>]*`)
	input = eventRegex.ReplaceAllString(input, "")
	return input
}
// ValidateAndSanitizeText validates and sanitizes text input
func ValidateAndSanitizeText(input string, fieldName string, minLength, maxLength int) (string, []ValidError) {
	var errors []ValidError
	// Basic sanitization
	sanitized := SanitizeInput(input)
	// Check for SQL injection
	if CheckSQLInjection(sanitized) {
		errors = append(errors, ValidError{
			Field:   fieldName,
			Message: "Input contains potentially dangerous content",
			Value:   input,
		})
	}
	// Check for XSS
	if CheckXSS(sanitized) {
		errors = append(errors, ValidError{
			Field:   fieldName,
			Message: "Input contains potentially dangerous script content",
			Value:   input,
		})
	}
	// Length validation
	if len(sanitized) < minLength {
		errors = append(errors, ValidError{
			Field:   fieldName,
			Message: fmt.Sprintf("%s must be at least %d characters long", fieldName, minLength),
			Value:   sanitized,
		})
	}
	if len(sanitized) > maxLength {
		errors = append(errors, ValidError{
			Field:   fieldName,
			Message: fmt.Sprintf("%s must not exceed %d characters", fieldName, maxLength),
			Value:   sanitized,
		})
	}
	return sanitized, errors
}
// Password validation
func ValidatePassword(password string) []ValidError {
	var errors []ValidError
	if len(password) < 8 {
		errors = append(errors, ValidError{
			Field:   "password",
			Message: "Password must be at least 8 characters long",
		})
	}
	// Check for at least one uppercase letter
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		errors = append(errors, ValidError{
			Field:   "password",
			Message: "Password must contain at least one uppercase letter",
		})
	}
	// Check for at least one lowercase letter
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		errors = append(errors, ValidError{
			Field:   "password",
			Message: "Password must contain at least one lowercase letter",
		})
	}
	// Check for at least one digit
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		errors = append(errors, ValidError{
			Field:   "password",
			Message: "Password must contain at least one digit",
		})
	}
	// Check for at least one special character
	if !regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~` + "`" + `]`).MatchString(password) {
		errors = append(errors, ValidError{
			Field:   "password",
			Message: "Password must contain at least one special character",
		})
	}
	return errors
}
// Rate limiting helpers
type RateLimitInfo struct {
	MaxRequests int
	WindowSize  int // in seconds
}
var rateLimits = map[string]RateLimitInfo{
	"login":    {MaxRequests: 5, WindowSize: 300},   // 5 attempts per 5 minutes
	"register": {MaxRequests: 3, WindowSize: 3600},  // 3 attempts per hour
	"upload":   {MaxRequests: 10, WindowSize: 60},   // 10 uploads per minute
	"api":      {MaxRequests: 100, WindowSize: 60},  // 100 API calls per minute
}
// GetRateLimit returns rate limit configuration for an endpoint
func GetRateLimit(endpoint string) RateLimitInfo {
	if limit, exists := rateLimits[endpoint]; exists {
		return limit
	}
	// Default rate limit
	return RateLimitInfo{MaxRequests: 60, WindowSize: 60}
}
// File upload security
func ValidateFileUpload(filename string, fileSize int64, maxSize int64) []ValidError {
	var errors []ValidError
	// Check file size
	if fileSize > maxSize {
		errors = append(errors, ValidError{
			Field:   "file",
			Message: fmt.Sprintf("File size exceeds maximum allowed size of %d bytes", maxSize),
		})
	}
	// Check file extension
	if !IsValidImageFile(filename) {
		errors = append(errors, ValidError{
			Field:   "file",
			Message: "Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP files are allowed",
			Value:   filename,
		})
	}
	// Check for dangerous filename patterns
	dangerousPatterns := []string{
		".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js",
		".jar", ".app", ".deb", ".pkg", ".dmg", ".rpm",
		"../", "..\\", ".htaccess", "web.config",
	}
	lowerFilename := strings.ToLower(filename)
	for _, pattern := range dangerousPatterns {
		if strings.Contains(lowerFilename, pattern) {
			errors = append(errors, ValidError{
				Field:   "file",
				Message: "Filename contains potentially dangerous content",
				Value:   filename,
			})
			break
		}
	}
	return errors
}
// Headers validation for security
func ValidateRequestHeaders(headers map[string]string) []ValidError {
	var errors []ValidError
	// Check Content-Type if present
	if contentType, exists := headers["Content-Type"]; exists {
		if CheckXSS(contentType) || CheckSQLInjection(contentType) {
			errors = append(errors, ValidError{
				Field:   "Content-Type",
				Message: "Invalid content type header",
			})
		}
	}
	// Check User-Agent if present
	if userAgent, exists := headers["User-Agent"]; exists {
		if len(userAgent) > 512 {
			errors = append(errors, ValidError{
				Field:   "User-Agent",
				Message: "User-Agent header too long",
			})
		}
	}
	return errors
}
