package config

import "sync"

type Config struct {
	Services map[string]Service `json:"services"`
	Port     int                `json:"port"`
}

type Route struct {
	Method        string `json:"method"`
	Path          string `json:"path"`
	GatewayPath   string `json:"gatewayPath"`
	Authenticated bool   `json:"authenticated"`
}

type Service struct {
	Name      string   `json:"name"`
	Host      []Server `json:"hosts"`
	Routes    []Route  `json:"routes"`
	Protocol  string   `json:"protocol"`
	LastId    int      `json:"-"`
	Heartbeat string   `json:"heartbeat"`
}

type Server struct {
	Port      int        `json:"port"`
	Host      string     `json:"host"`
	Mutex     sync.Mutex `json:"-"`
	IsRunning bool       `json:"-"`
	Id        int        `json:"-"`
}
