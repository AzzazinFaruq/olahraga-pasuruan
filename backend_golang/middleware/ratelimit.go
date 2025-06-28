package middleware
import (
	"net/http"
	"sync"
	"time"
	"github.com/gin-gonic/gin"
)
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
	rate     int
	capacity int
	cleanup  time.Duration
}
type Visitor struct {
	tokens   int
	lastSeen time.Time
}
func NewRateLimiter(rate, capacity int, cleanup time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		rate:     rate,
		capacity: capacity,
		cleanup:  cleanup,
	}
	go rl.cleanupVisitors()
	return rl
}
func (rl *RateLimiter) addTokens(v *Visitor) {
	now := time.Now()
	elapsed := now.Sub(v.lastSeen)
	tokens := int(elapsed.Seconds()) * rl.rate / 60
	v.tokens += tokens
	if v.tokens > rl.capacity {
		v.tokens = rl.capacity
	}
	v.lastSeen = now
}
func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	v, exists := rl.visitors[ip]
	if !exists {
		rl.visitors[ip] = &Visitor{
			tokens:   rl.capacity - 1,
			lastSeen: time.Now(),
		}
		return true
	}
	rl.addTokens(v)
	if v.tokens >= 1 {
		v.tokens--
		return true
	}
	return false
}
func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(rl.cleanup)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			if time.Since(v.lastSeen) > rl.cleanup {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}
var (
	apiLimiter   *RateLimiter
	loginLimiter *RateLimiter
)
func init() {
	apiLimiter = NewRateLimiter(100, 100, time.Hour)
	loginLimiter = NewRateLimiter(10, 10, time.Hour)
}
func APIRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !apiLimiter.Allow(ip) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many requests. Please try again later.",
				"status":  false,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
func LoginRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !loginLimiter.Allow(ip) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": "Too many login attempts. Please try again later.",
				"status":  false,
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
