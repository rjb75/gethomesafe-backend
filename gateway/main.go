package main

import (
	"github.com/rjb75/gethomesafe-backend/gateway/gateway"
)

func main() {
	gateway := gateway.New()
	gateway.Init()
	err := gateway.LoadConfig("services.json")

	if err != nil {
		panic(err)
	}

	gateway.RegisterRoutes()
	gateway.Run(":8080")
}
