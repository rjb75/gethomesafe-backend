package gateway

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

func BackupProxy(r config.Route, s *config.Service, c *gin.Context) {
	fmt.Println("Backup proxy")
	formatRequest(c, &r)

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
			client := &http.Client{Timeout: 5 * time.Second}
			resp, err := client.Do(query)

			if err != nil {
				break
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
			s.SetLastServer(host.Id)
			c.Header("X-Server-Id", fmt.Sprintf("%d", host.Id))
			c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
			return
		}
	}

	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Service Unavailable"})
}

func formatRequest(c *gin.Context, r *config.Route) {
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
}

func (g *Gateway) Proxy(r config.Route, s *config.Service) gin.HandlerFunc {
	fmt.Println(r, s.Host)
	return func(c *gin.Context) {
		var host *config.Server
		var err error

		if s.ReplicationMode == "primary-leader" {
			host, err = s.GetPrimaryServer()

			if err != nil {
				fmt.Println("Error getting primary server", err.Error())
				c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Service Unavailable, No Primary Available"})
				return
			}

			fmt.Println("Primary host", host.Host, host.Id, err)
		} else {
			host, err = s.GetNextServer()
		}

		if err != nil {
			fmt.Println("Error getting server", err.Error())
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Service Unavailable"})
			return
		}

		fmt.Println("Proxying request to", host.Host, host.Id, r.Path)
		c.Request.URL.Host = host.Host
		formatRequest(c, &r)

		url := fmt.Sprintf("%s://%s:%d%s", s.Protocol, host.Host, host.Port, r.Path)
		fmt.Println("Proxying request to", url)

		query, _ := http.NewRequest(c.Request.Method, url, c.Request.Body)
		query.Header = c.Request.Header
		params := c.Request.URL.Query()
		for k, v := range c.Request.URL.Query() {
			params.Set(k, v[len(v)-1])
		}
		if s.ReplicationMode == "primary-leader" {
			query.Header.Set("X-Gateway-Leader", host.Host)
		}

		query.URL.RawQuery = params.Encode()

		client := &http.Client{Timeout: 5 * time.Second}
		resp, err := client.Do(query)

		if err != nil {
			fmt.Println("Error hitting server", err.Error())
			if !host.HeartbeatCheck(s.Heartbeat) {
				fmt.Println("While proxying, server is down")
				host.SetStatus(false)
				BackupProxy(r, s, c)
				return
			}
			fmt.Println("Server is up, other error")

			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		s.SetLastServer(host.Id)

		if resp.Header.Get("x-auth-token") != "" {
			fmt.Println("Setting token", resp.Header.Get("x-auth-token"))
			c.SetCookie("token", resp.Header.Get("x-auth-token"), 60*60*24, "/", "localhost", false, true)
			c.Header("Authorization", resp.Header.Get("x-auth-token"))
		}

		fmt.Println(body, resp.StatusCode, resp.Header.Get("Content-Type"))
		c.Header("X-Server-Id", fmt.Sprintf("%d", host.Id))
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
}

func (g *Gateway) SynchronizedProxy(r config.Route, s *config.Service) gin.HandlerFunc {
	fmt.Println(r, s.Host)

	return func(c *gin.Context) {

		uuid, err := g.proposeHandler(c)

		fmt.Println("Proposed", uuid, err)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "uuid": uuid})
		}

		for {
			if g.S.CanCommit[uuid] {
				break
			}
			time.Sleep(50 * time.Millisecond)
		}

		g.commitHandler(c, uuid)

		c.Header("X-Action-Id", uuid.String())
		c.Header("X-Proposer", g.Name)
		c.Header("X-Timestamp", fmt.Sprintf("%d", g.GetTimestamp()))

		g.Proxy(r, s)(c)
	}
}
