package gateway

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
)

func (g *Gateway) Proxy(r *config.Route, s config.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.URL.Host = s.Host[0]
		c.Request.URL.Scheme = "http"
		c.Request.Header.Del("Authorization")
		c.Request.Header.Del("X-User-Id")
		c.Request.Header.Del("X-User-Email")
		c.Request.Header.Del("X-User-Role")
		c.Request.Header.Del("X-User-Permissions")

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

		fmt.Println(body, resp.StatusCode, resp.Header.Get("Content-Type"))

		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
}
