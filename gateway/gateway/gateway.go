package gateway

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/auth"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
	"github.com/rjb75/gethomesafe-backend/gateway/utils"
	"github.com/spf13/viper"
)

type Gateway struct {
	config *config.Config
	G      *gin.Engine
	F      *auth.Firebase
}

func New() *Gateway {
	return &Gateway{}
}

func (g *Gateway) LoadConfig(filename string) error {
	data, err := utils.OpenFile(filename)

	if err != nil {
		return err
	}

	g.config = config.New()
	err = g.config.Parse(data)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gateway) InitFirebase() error {
	key := viper.GetString("FIREBASE_API_KEY")

	if key == "" {
		return fmt.Errorf("FIREBASE_API_KEY is not set")
	}

	g.F = auth.New()
	err := g.F.Init(key)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gateway) Init() {
	g.G = gin.Default()
}

func (g *Gateway) Run(port string) {
	g.G.Run(port)
}
