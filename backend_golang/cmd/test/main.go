package main
import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)
type TestResult struct {
	Endpoint string
	Method   string
	Status   int
	Success  bool
	Error    string
}
func main() {
	baseURL := os.Getenv("API_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	fmt.Println("🧪 Starting API Endpoint Testing...")
	fmt.Println("=====================================")
	fmt.Printf("Testing against: %s\n\n", baseURL)
	// Test all endpoints
	results := []TestResult{}
	// Health check
	results = append(results, testEndpoint("GET", baseURL+"/health", nil))
	// Auth endpoints (no auth required)
	loginData := map[string]string{
		"username": "test",
		"password": "test123",
	}
	loginResult := testEndpoint("POST", baseURL+"/login", loginData)
	results = append(results, loginResult)
	// Get token for authenticated requests
	token := ""
	if loginResult.Success {
		// In a real test, you'd extract the token from the response
		token = "your-jwt-token-here"
	}
	// Test authenticated endpoints
	authenticatedTests := []struct {
		method   string
		endpoint string
		data     interface{}
	}{
		// Atlet endpoints
		{"GET", "/api/atlet", nil},
		{"GET", "/api/atlet/1", nil},
		// Cabor endpoints
		{"GET", "/api/cabor", nil},
		{"GET", "/api/cabor/list", nil},
		{"GET", "/api/cabor/1", nil},
		// Nomor endpoints
		{"GET", "/api/nomor", nil},
		{"GET", "/api/nomor/1", nil},
		// Hasil endpoints
		{"GET", "/api/hasil", nil},
		{"GET", "/api/hasil/medal-tally", nil},
		// AtletCabor endpoints
		{"GET", "/api/atlet-cabor", nil},
		{"GET", "/api/atlet-cabor/stats", nil},
	}
	for _, test := range authenticatedTests {
		result := testAuthenticatedEndpoint(test.method, baseURL+test.endpoint, test.data, token)
		results = append(results, result)
	}
	// Print results
	printTestResults(results)
}
func testEndpoint(method, url string, data interface{}) TestResult {
	result := TestResult{
		Endpoint: url,
		Method:   method,
	}
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			result.Error = fmt.Sprintf("Failed to marshal data: %v", err)
			return result
		}
		body = bytes.NewBuffer(jsonData)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		result.Error = fmt.Sprintf("Failed to create request: %v", err)
		return result
	}
	if data != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("Request failed: %v", err)
		return result
	}
	defer resp.Body.Close()
	result.Status = resp.StatusCode
	result.Success = resp.StatusCode < 400
	if !result.Success {
		bodyBytes, _ := io.ReadAll(resp.Body)
		result.Error = string(bodyBytes)
	}
	return result
}
func testAuthenticatedEndpoint(method, url string, data interface{}, token string) TestResult {
	result := TestResult{
		Endpoint: url,
		Method:   method,
	}
	var body io.Reader
	if data != nil {
		jsonData, err := json.Marshal(data)
		if err != nil {
			result.Error = fmt.Sprintf("Failed to marshal data: %v", err)
			return result
		}
		body = bytes.NewBuffer(jsonData)
	}
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		result.Error = fmt.Sprintf("Failed to create request: %v", err)
		return result
	}
	if data != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("Request failed: %v", err)
		return result
	}
	defer resp.Body.Close()
	result.Status = resp.StatusCode
	result.Success = resp.StatusCode < 400
	if !result.Success {
		bodyBytes, _ := io.ReadAll(resp.Body)
		result.Error = string(bodyBytes)
	}
	return result
}
func printTestResults(results []TestResult) {
	fmt.Println("\n📊 Test Results Summary")
	fmt.Println("=======================")
	passed := 0
	failed := 0
	for _, result := range results {
		status := "❌ FAIL"
		if result.Success {
			status = "✅ PASS"
			passed++
		} else {
			failed++
		}
		fmt.Printf("%s [%d] %s %s\n", status, result.Status, result.Method, result.Endpoint)
		if !result.Success && result.Error != "" {
			fmt.Printf("   Error: %s\n", result.Error)
		}
	}
	fmt.Printf("\n📈 Summary: %d passed, %d failed\n", passed, failed)
	if failed == 0 {
		fmt.Println("🎉 All tests passed! API is working correctly.")
	} else {
		fmt.Printf("⚠️  %d tests failed. Please check the endpoints.\n", failed)
	}
}
