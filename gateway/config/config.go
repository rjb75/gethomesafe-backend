package config

import (
	"sync"
)

type Config struct {
	Services []Service `json:"services"`
	Port     int       `json:"port"`
	Gateways []string  `json:"gateways"`
}

type Route struct {
	Method        string `json:"method"`
	Path          string `json:"path"`
	GatewayPath   string `json:"gatewayPath"`
	Authenticated bool   `json:"authenticated"`
	Synchronized  bool   `json:"synchronized" default:"false"`
	Publish       string `json:"publish" default:""`
}

type Service struct {
	Name            string     `json:"name"`
	Host            []Server   `json:"hosts"`
	Routes          []Route    `json:"routes"`
	Protocol        string     `json:"protocol"`
	LastId          int        `json:"-"`
	Heartbeat       string     `json:"heartbeat"`
	ReplicationMode string     `json:"replicationMode"`
	Mutex           sync.Mutex `json:"-"`
	PrimaryHost     *Server    `json:"-"` // Only used in primary-leader mode
}

type Server struct {
	Port      int           `json:"port"`
	Host      string        `json:"host"`
	Mutex     sync.Mutex    `json:"-"`
	IsRunning bool          `json:"-"`
	Id        int           `json:"-"`
	Redis     RedisInstance `json:"-"` // Only used in redis mode
}
