package config

import "fmt"

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
