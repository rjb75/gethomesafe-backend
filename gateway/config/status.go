package config

import (
	"fmt"
	"net/http"
	"time"
)

func (s *Server) HeartbeatCheck(url string) bool {
	queryUrl := fmt.Sprintf("http://%s:%d%s", s.Host, s.Port, url)
	fmt.Println("Checking", queryUrl)
	query, _ := http.NewRequest("GET", queryUrl, nil)

	resp, err := http.DefaultClient.Do(query)

	if err != nil {
		return false
	}

	if resp.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func (s *Server) StartHeartbeat(url string) {
	for {
		if !s.HeartbeatCheck(url) {
			fmt.Println("Server is down")
			s.Mutex.Lock()
			s.IsRunning = false
			s.Mutex.Unlock()
		} else {
			s.Mutex.Lock()
			s.IsRunning = true
			s.Mutex.Unlock()
		}
		time.Sleep(30 * time.Second)
	}
}
