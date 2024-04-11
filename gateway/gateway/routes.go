package gateway

import (
	"fmt"
	"sync"

	"github.com/gin-gonic/gin"

	"github.com/rjb75/gethomesafe-backend/gateway/config"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

type Services struct {
	Services map[string]config.Service `json:"services"`
}

func (g *Gateway) registerSynchronizationRoutes() {
	g.G.GET("/sync", func(ctx *gin.Context) {
		context := ctx.Request.Context()
		c, err := websocket.Accept(ctx.Writer, ctx.Request, nil)

		if err != nil {
			fmt.Println("Failed to accept websocket:", err)
			return
		}

		defer c.Close(websocket.StatusInternalError, "connection error")

		for {
			var action Action
			err := wsjson.Read(context, c, &action)

			if err != nil {
				fmt.Println("Failed to read message:", err)
				return
			}

			switch action.Action {
			case "propose":
				g.proposalReceiveHandler(action)
			case "accept":
				g.acceptReceiveHandler(action)
			case "commit":
				g.commitReceiveHandler(action)
			case "close":
				return
			}
		}
	})
}

func (g *Gateway) RegisterRoutes() error {
	if g.config == nil {
		return fmt.Errorf("config is nil")
	}

	g.registerSynchronizationRoutes()

	for j := range g.config.Services {
		service := &g.config.Services[j]
		for i := range service.Host {
			service.Host[i].Mutex = sync.Mutex{}
			service.Host[i].IsRunning = false
			service.Host[i].Id = i
			if service.Protocol == "redis" {
				go service.Host[i].StartRedisCheck()
			} else if service.ReplicationMode == "primary-leader" {
				go service.Host[i].StartLeaderCheck(service)
			} else {
				go service.Host[i].StartHeartbeat(service.Heartbeat)
			}
		}

		for _, route := range service.Routes {
			if route.Authenticated {
				if route.Publish != "" {
					switch route.Method {
					case "GET":
						g.G.GET(route.GatewayPath, g.F.AuthMiddleware(), g.PublishProxy(route, service))
					case "POST":
						g.G.POST(route.GatewayPath, g.F.AuthMiddleware(), g.PublishProxy(route, service))
					case "PUT":
						g.G.PUT(route.GatewayPath, g.F.AuthMiddleware(), g.PublishProxy(route, service))
					case "DELETE":
						g.G.DELETE(route.GatewayPath, g.F.AuthMiddleware(), g.PublishProxy(route, service))
					}

				} else if route.Synchronized {
					switch route.Method {
					case "GET":
						g.G.GET(route.GatewayPath, g.F.AuthMiddleware(), g.SynchronizedProxy(route, service))
					case "POST":
						g.G.POST(route.GatewayPath, g.F.AuthMiddleware(), g.SynchronizedProxy(route, service))
					case "PUT":
						g.G.PUT(route.GatewayPath, g.F.AuthMiddleware(), g.SynchronizedProxy(route, service))
					case "DELETE":
						g.G.DELETE(route.GatewayPath, g.F.AuthMiddleware(), g.SynchronizedProxy(route, service))
					}
				} else {
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
				}
			} else if route.Synchronized {
				switch route.Method {
				case "GET":
					g.G.GET(route.GatewayPath, g.SynchronizedProxy(route, service))
				case "POST":
					g.G.POST(route.GatewayPath, g.SynchronizedProxy(route, service))
				case "PUT":
					g.G.PUT(route.GatewayPath, g.SynchronizedProxy(route, service))
				case "DELETE":
					g.G.DELETE(route.GatewayPath, g.SynchronizedProxy(route, service))
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
