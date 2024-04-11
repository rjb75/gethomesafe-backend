package main

import (
	"github.com/rjb75/gethomesafe-backend/gateway/gateway"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigName("config")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	viper.SetConfigFile("../.env")
	viper.ReadInConfig()

	gateway := gateway.New()
	err := gateway.InitFirebase()

	if err != nil {
		panic(err)
	}

	err = gateway.Init()
	if err != nil {
		panic(err)
	}

	err = gateway.LoadConfig("services.json")

	if err != nil {
		panic(err)
	}

	err = gateway.InitRedisInstances()
	if err != nil {
		panic(err)
	}

	gateway.RegisterRoutes()
	gateway.StartTimestampSync()
	gateway.Run(":8080")
}
