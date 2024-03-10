package gateway

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

func BackupProxy(r config.Route, s config.Service, c *gin.Context) {
	fmt.Println("Backup proxy")
	c.Request.URL.Scheme = "http"
	c.Request.Header.Del("Authorization")
	c.Request.Header.Del("X-User-Id")

	// set the id header
	if r.Authenticated {
		if _, ok := c.Get("uid"); ok {
			fmt.Println("Setting user id", c.GetString("uid"))
			c.Request.Header.Set("X-User-Id", c.GetString("uid"))
		}
	}

	for i := range s.Host {
		if s.Host[i].IsRunning {
			host := &s.Host[i]
			fmt.Println("Proxying request to", host.Host, host.Id, r.Path)
			c.Request.URL.Host = host.Host

			url := fmt.Sprintf("%s://%s:%d%s", s.Protocol, host.Host, host.Port, r.Path)
			fmt.Println("Proxying request to", url)

			query, _ := http.NewRequest(c.Request.Method, url, c.Request.Body)
			query.Header = c.Request.Header
			params := c.Request.URL.Query()
			for k, v := range c.Request.URL.Query() {
				for _, value := range v {
					params.Add(k, value)
				}
			}
			query.URL.RawQuery = params.Encode()
			resp, err := http.DefaultClient.Do(query)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}

			defer resp.Body.Close()

			body, err := io.ReadAll(resp.Body)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}

			if resp.Header.Get("x-auth-token") != "" {
				fmt.Println("Setting token", resp.Header.Get("x-auth-token"))
				c.SetCookie("token", resp.Header.Get("x-auth-token"), 60*60*24, "/", "localhost", false, true)
				c.Header("Authorization", resp.Header.Get("x-auth-token"))
			}

			fmt.Println(body, resp.StatusCode, resp.Header.Get("Content-Type"))

			c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
			return
		}
	}

	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Service Unavailable"})
	return
}

func (g *Gateway) Proxy(r config.Route, s config.Service) gin.HandlerFunc {
	fmt.Println(r, s.Host)
	var host *config.Server
	return func(c *gin.Context) {
		host = s.GetNextServer()
		fmt.Println("Proxying request to", host.Host, host.Id, r.Path)
		c.Request.URL.Host = host.Host
		c.Request.URL.Scheme = "http"
		c.Request.Header.Del("Authorization")
		c.Request.Header.Del("X-User-Id")
		// set the id header
		if r.Authenticated {
			if _, ok := c.Get("uid"); ok {
				fmt.Println("Setting user id", c.GetString("uid"))
				c.Request.Header.Set("X-User-Id", c.GetString("uid"))
			}
		}

		url := fmt.Sprintf("%s://%s:%d%s", s.Protocol, host.Host, host.Port, r.Path)
		fmt.Println("Proxying request to", url)

		query, _ := http.NewRequest(c.Request.Method, url, c.Request.Body)
		query.Header = c.Request.Header
		params := c.Request.URL.Query()
		for k, v := range c.Request.URL.Query() {
			for _, value := range v {
				params.Add(k, value)
			}
		}
		query.URL.RawQuery = params.Encode()
		resp, err := http.DefaultClient.Do(query)

		if err != nil {
			if !host.HeartbeatCheck(s.Heartbeat) {
				fmt.Println("Service is down")
				BackupProxy(r, s, c)
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if resp.Header.Get("x-auth-token") != "" {
			fmt.Println("Setting token", resp.Header.Get("x-auth-token"))
			c.SetCookie("token", resp.Header.Get("x-auth-token"), 60*60*24, "/", "localhost", false, true)
			c.Header("Authorization", resp.Header.Get("x-auth-token"))
		}

		fmt.Println(body, resp.StatusCode, resp.Header.Get("Content-Type"))

		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
}
