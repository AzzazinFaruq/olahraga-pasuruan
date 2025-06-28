package utils
import (
	"log"
	"net/http"
	"github.com/gin-gonic/gin"
)
// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Error   string      `json:"error"`
	Message string      `json:"message,omitempty"`
	Details interface{} `json:"details,omitempty"`
	Status  bool        `json:"status"`
	Code    string      `json:"code,omitempty"`
}
// SuccessResponse represents a standardized success response
type SuccessResponse struct {
	Data       interface{} `json:"data,omitempty"`
	Message    string      `json:"message,omitempty"`
	Status     bool        `json:"status"`
	Pagination interface{} `json:"pagination,omitempty"`
}
// Error codes for different types of errors
const (
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeDuplicate      = "DUPLICATE_ERROR"
	ErrCodeUnauthorized   = "UNAUTHORIZED"
	ErrCodeForbidden      = "FORBIDDEN"
	ErrCodeInternal       = "INTERNAL_ERROR"
	ErrCodeBadRequest     = "BAD_REQUEST"
	ErrCodeConflict       = "CONFLICT"
)
// SendErrorResponse sends a standardized error response
func SendErrorResponse(c *gin.Context, statusCode int, errorCode string, message string, details interface{}) {
	// Log the error
	log.Printf("[ERROR] %s: %s - %v", errorCode, message, details)
	response := ErrorResponse{
		Error:   message,
		Status:  false,
		Code:    errorCode,
		Details: details,
	}
	c.JSON(statusCode, response)
}
// SendSuccessResponse sends a standardized success response
func SendSuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	response := SuccessResponse{
		Data:    data,
		Message: message,
		Status:  true,
	}
	c.JSON(statusCode, response)
}
// SendPaginatedResponse sends a success response with pagination
func SendPaginatedResponse(c *gin.Context, message string, data interface{}, pagination interface{}) {
	response := SuccessResponse{
		Data:       data,
		Message:    message,
		Status:     true,
		Pagination: pagination,
	}
	c.JSON(http.StatusOK, response)
}
// ValidationError sends a validation error response
func ValidationError(c *gin.Context, message string, details interface{}) {
	SendErrorResponse(c, http.StatusBadRequest, ErrCodeValidation, message, details)
}
// NotFoundError sends a not found error response
func NotFoundError(c *gin.Context, message string) {
	SendErrorResponse(c, http.StatusNotFound, ErrCodeNotFound, message, nil)
}
// DuplicateError sends a duplicate/conflict error response
func DuplicateError(c *gin.Context, message string) {
	SendErrorResponse(c, http.StatusConflict, ErrCodeDuplicate, message, nil)
}
// InternalError sends an internal server error response
func InternalError(c *gin.Context, message string, err error) {
	details := map[string]interface{}{}
	if err != nil {
		details["error"] = err.Error()
	}
	SendErrorResponse(c, http.StatusInternalServerError, ErrCodeInternal, message, details)
}
// UnauthorizedError sends an unauthorized error response
func UnauthorizedError(c *gin.Context, message string) {
	SendErrorResponse(c, http.StatusUnauthorized, ErrCodeUnauthorized, message, nil)
}
// ForbiddenError sends a forbidden error response
func ForbiddenError(c *gin.Context, message string) {
	SendErrorResponse(c, http.StatusForbidden, ErrCodeForbidden, message, nil)
}
// BadRequestError sends a bad request error response
func BadRequestError(c *gin.Context, message string, details interface{}) {
	SendErrorResponse(c, http.StatusBadRequest, ErrCodeBadRequest, message, details)
}
// Created sends a created success response
func Created(c *gin.Context, message string, data interface{}) {
	SendSuccessResponse(c, http.StatusCreated, message, data)
}
// Success sends a success response
func Success(c *gin.Context, message string, data interface{}) {
	SendSuccessResponse(c, http.StatusOK, message, data)
}
// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page        int   `json:"page"`
	Limit       int   `json:"limit"`
	Total       int64 `json:"total"`
	TotalPages  int64 `json:"total_pages"`
	HasNext     bool  `json:"has_next"`
	HasPrevious bool  `json:"has_previous"`
}
// NewPaginationInfo creates pagination info
func NewPaginationInfo(page, limit int, total int64) PaginationInfo {
	totalPages := (total + int64(limit) - 1) / int64(limit)
	return PaginationInfo{
		Page:        page,
		Limit:       limit,
		Total:       total,
		TotalPages:  totalPages,
		HasNext:     int64(page) < totalPages,
		HasPrevious: page > 1,
	}
}
