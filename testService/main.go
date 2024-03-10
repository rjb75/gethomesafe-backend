package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello World",
		})
	})

	router.GET("/api/heartbeat", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	router.Run(":1234")
}
