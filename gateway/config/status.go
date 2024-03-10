package config

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"
)

const (
	minHeartbeatTimeout = 10
	maxHeartbeatTimeout = 45
)

func (s *Server) HeartbeatCheck(url string) bool {
	queryUrl := fmt.Sprintf("http://%s:%d%s", s.Host, s.Port, url)
	fmt.Println("Checking", queryUrl)
	query, _ := http.NewRequest("GET", queryUrl, nil)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(query)

	if err != nil {
		fmt.Println("Error hitting server during heartbeat check", err.Error())
		return false
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error hitting server, bad status", resp.StatusCode)
		return false
	}

	fmt.Println("Server is up and running")
	return true
}

func (s *Server) StartHeartbeat(url string) {
	for {
		if s.HeartbeatCheck(url) {
			s.Mutex.Lock()
			s.IsRunning = true
			s.Mutex.Unlock()
		} else {
			fmt.Println("Server is down", s.Host, s.Port)
			s.Mutex.Lock()
			s.IsRunning = false
			s.Mutex.Unlock()
		}
		time.Sleep(time.Duration(time.Duration(rand.Intn(maxHeartbeatTimeout-minHeartbeatTimeout)+minHeartbeatTimeout) * time.Second))
	}
}

func (S *Server) SetStatus(status bool) {
	S.Mutex.Lock()
	S.IsRunning = status
	S.Mutex.Unlock()
}
