package config

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
	Name     string   `json:"name"`
	Host     []string `json:"hosts"`
	Routes   []Route  `json:"routes"`
	Port     int      `json:"port"`
	Protocol string   `json:"protocol"`
}
