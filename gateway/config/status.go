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

func (h *Server) PrimaryCheck(s *Service) bool {
	queryUrl := fmt.Sprintf("http://%s:%d%s", h.Host, h.Port, s.Heartbeat)
	fmt.Println("Checking", queryUrl)
	query, _ := http.NewRequest("GET", queryUrl, nil)

	if s.PrimaryHost != nil {
		query.Header.Set("X-Gateway-Leader", s.PrimaryHost.Name)
	} else {
		query.Header.Set("X-Gateway-Leader", "")
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(query)

	if err != nil {
		fmt.Println("Error hitting server during heartbeat check", err.Error())
		if s.PrimaryHost == h {
			s.Mutex.Lock()
			s.PrimaryHost = nil
			s.Mutex.Unlock()
		}
		return false
	}

	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error hitting server, bad status", resp.StatusCode)
		if s.PrimaryHost == h {
			s.Mutex.Lock()
			s.PrimaryHost = nil
			s.Mutex.Unlock()
		}
		return false
	}

	primary := resp.Header.Get("X-Primary-Host")

	if primary == "" {
		fmt.Println("Primary header not found")
		return true
	}

	for i := range s.Host {
		if s.Host[i].Name == primary {
			fmt.Println("Primary server found", s.Host[i].Name)
			s.Mutex.Lock()
			s.PrimaryHost = &s.Host[i]
			s.Mutex.Unlock()
			return true
		}
	}

	fmt.Println("Primary server not found")
	return true
}

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

	fmt.Println("Server is up and running", query.URL.String())
	return true
}

func (s *Server) StartHeartbeat(url string) {
	for {
		if s.HeartbeatCheck(url) {
			s.SetStatus(true)
		} else {
			fmt.Println("Server is down", s.Host, s.Port)
			s.SetStatus(false)
		}
		time.Sleep(time.Duration(time.Duration(rand.Intn(maxHeartbeatTimeout-minHeartbeatTimeout)+minHeartbeatTimeout) * time.Second))
	}
}

func (h *Server) StartLeaderCheck(s *Service) {
	for {
		if h.PrimaryCheck(s) {
			h.SetStatus(true)
		} else {
			fmt.Println("Server is down", h.Host, h.Port)
			h.SetStatus(false)
		}
		time.Sleep(time.Duration(time.Duration(rand.Intn(maxHeartbeatTimeout-minHeartbeatTimeout)+minHeartbeatTimeout) * time.Second))
	}
}

func (s *Server) StartRedisCheck() {
	for {
		if s.Redis.CheckRedisInstance() == nil {
			s.SetStatus(true)
		} else {
			fmt.Println("Server is down", s.Host, s.Port)
			s.SetStatus(false)
		}
		time.Sleep(time.Duration(time.Duration(rand.Intn(maxHeartbeatTimeout-minHeartbeatTimeout)+minHeartbeatTimeout) * time.Second))
	}
}

func (S *Server) SetStatus(status bool) {
	S.Mutex.Lock()
	S.IsRunning = status
	S.Mutex.Unlock()
}
