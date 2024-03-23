package gateway

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	minTimestampTimeout = 10
	maxTimestampTimeout = 45
)

func SendTimestampRequest(url string, timestamp int64) {
	fmt.Println("Sending timestamp", timestamp, "to", url)
	client := &http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("X-Timestamp", strconv.FormatInt(timestamp, 10))
	client.Do(req)
}

func SendTimestamp(gateway string, config *Gateway) {
	url := "http://" + gateway + ":8080/timestamp"
	for {
		time.Sleep(time.Duration(time.Duration(rand.Intn(maxTimestampTimeout-minTimestampTimeout))+minTimestampTimeout)*time.Second + 1)
		config.TimeLock.Lock()
		timestamp := config.Timestamp
		config.TimeLock.Unlock()
		SendTimestampRequest(url, *timestamp)
	}
}

func (gw *Gateway) StartTimestampSync() {
	for _, h := range gw.config.Gateways {
		if h != gw.Name {
			go SendTimestamp(h, gw)
		}
	}
}

func (gw *Gateway) TimestampTicker() {
	for {
		time.Sleep(time.Second)
		gw.TimeLock.Lock()
		*gw.Timestamp++
		gw.TimeLock.Unlock()
	}
}

func (g *Gateway) SetupTimestamp() {
	g.Timestamp = new(int64)
	*g.Timestamp = int64(rand.Intn(100))
	fmt.Println("Starting timestamp at", *g.Timestamp)
	g.TimeLock = sync.Mutex{}
	go g.TimestampTicker()
	g.G.GET("/timestamp", func(c *gin.Context) {
		ts := c.Request.Header.Get("X-Timestamp")
		time, err := strconv.ParseInt(ts, 10, 64)

		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid timestamp"})
			return
		}

		fmt.Println("Received timestamp", time, "current timestamp", *g.Timestamp)

		g.TimeLock.Lock()
		defer g.TimeLock.Unlock()
		if time > *g.Timestamp {
			fmt.Println("Updating timestamp to", time, "from", *g.Timestamp)
			*g.Timestamp = time
		}
	})
}
