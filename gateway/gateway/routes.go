package gateway

import (
	"fmt"

	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

type Services struct {
	Services map[string]config.Service `json:"services"`
}

func (g *Gateway) RegisterRoutes() error {
	if g.config == nil {
		return fmt.Errorf("config is nil")
	}

	for _, service := range g.config.Services {
		for _, route := range service.Routes {
			if route.Authenticated {
				// TODO: implement auth middleware
			}
			switch route.Method {
			case "GET":
				g.G.GET(route.Path, g.Proxy(&route, service))
			case "POST":
				g.G.POST(route.Path, g.Proxy(&route, service))
			case "PUT":
				g.G.PUT(route.Path, g.Proxy(&route, service))
			case "DELETE":
				g.G.DELETE(route.Path, g.Proxy(&route, service))
			}
		}
	}

	return nil
}
