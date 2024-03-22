package config

import (
	"fmt"
	"time"
)

type PrimaryResult struct {
	PrimaryHost *Server
	Err         error
}

func (s *Service) WaitForPrimary() PrimaryResult {
	for {
		if s.PrimaryHost != nil {
			return PrimaryResult{PrimaryHost: s.PrimaryHost, Err: nil}
		}
	}
}

func (s *Service) GetPrimaryServer(*Server) (*Server, error) {
	if s.PrimaryHost == nil || !s.PrimaryHost.IsRunning {
		result := make(chan PrimaryResult, 1)
		go func() {
			result <- s.WaitForPrimary()
		}()
		select {
		case <-time.After(15 * time.Second):
			return nil, fmt.Errorf("timeout waiting for primary server")
		case r := <-result:
			if s.PrimaryHost.IsRunning {
				return r.PrimaryHost, r.Err
			}
		}
	}
	return s.PrimaryHost, nil
}

func (s *Service) GetNextServer() (*Server, error) {
	s.Mutex.Lock()
	s.LastId++
	if s.LastId >= len(s.Host) {
		s.LastId = 0
	}
	s.Mutex.Unlock()
	if !s.Host[s.LastId].IsRunning {
		if s.allServersDown() {
			return nil, fmt.Errorf("all servers are down")
		}
		return s.GetNextServer()
	}
	return &s.Host[s.LastId], nil
}

func (s *Service) allServersDown() bool {
	for i := range s.Host {
		if s.Host[i].IsRunning {
			return false
		}
	}
	return true
}

func (s *Service) SetLastServer(id int) {
	s.Mutex.Lock()
	s.LastId = id
	s.Mutex.Unlock()
}
