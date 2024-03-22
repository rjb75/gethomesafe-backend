package gateway

import (
	"fmt"
	"sync"

	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

type Services struct {
	Services map[string]config.Service `json:"services"`
}

func (g *Gateway) RegisterRoutes() error {
	if g.config == nil {
		return fmt.Errorf("config is nil")
	}

	for j := range g.config.Services {
		service := &g.config.Services[j]
		for i := range service.Host {
			service.Host[i].Mutex = sync.Mutex{}
			service.Host[i].IsRunning = false
			service.Host[i].Id = i
			if service.ReplicationMode == "primary-leader" {
				go service.Host[i].StartLeaderCheck(service)
			} else {
				go service.Host[i].StartHeartbeat(service.Heartbeat)
			}
		}

		for _, route := range service.Routes {
			if route.Authenticated {
				switch route.Method {
				case "GET":
					g.G.GET(route.GatewayPath, g.F.AuthMiddleware(), g.Proxy(route, service))
				case "POST":
					g.G.POST(route.GatewayPath, g.F.AuthMiddleware(), g.Proxy(route, service))
				case "PUT":
					g.G.PUT(route.GatewayPath, g.F.AuthMiddleware(), g.Proxy(route, service))
				case "DELETE":
					g.G.DELETE(route.GatewayPath, g.F.AuthMiddleware(), g.Proxy(route, service))
				}
			} else {
				switch route.Method {
				case "GET":
					g.G.GET(route.GatewayPath, g.Proxy(route, service))
				case "POST":
					g.G.POST(route.GatewayPath, g.Proxy(route, service))
				case "PUT":
					g.G.PUT(route.GatewayPath, g.Proxy(route, service))
				case "DELETE":
					g.G.DELETE(route.GatewayPath, g.Proxy(route, service))
				}
			}
		}
	}

	return nil
}
