package config

func (s *Service) GetNextServer() *Server {
	s.LastId++
	if s.LastId >= len(s.Host) {
		s.LastId = 0
	}
	if !s.Host[s.LastId].IsRunning {
		return s.GetNextServer()
	}
	return &s.Host[s.LastId]
}
