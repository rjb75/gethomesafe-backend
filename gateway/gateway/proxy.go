package gateway

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

func (g *Gateway) Proxy(r config.Route, s config.Service) gin.HandlerFunc {
	fmt.Println(r, s.Host)
	return func(c *gin.Context) {
		fmt.Println("Proxying request to", s.Host[0], r.Path)
		c.Request.URL.Host = s.Host[0]
		c.Request.URL.Scheme = "http"
		c.Request.Header.Del("Authorization")
		c.Request.Header.Del("X-User-Id")

		// set the id header
		if r.Authenticated {
			if _, ok := c.Get("uid"); ok {
				c.Request.Header.Set("X-User-Id", c.GetString("uid"))
			}
		}

		fmt.Println(s)

		url := fmt.Sprintf("%s://%s:%d%s", s.Protocol, s.Host[0], s.Port, r.Path)
		fmt.Println("Proxying request to", url)

		query, _ := http.NewRequest(c.Request.Method, url, c.Request.Body)
		query.Header = c.Request.Header
		resp, err := http.DefaultClient.Do(query)

		if err != nil {
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
