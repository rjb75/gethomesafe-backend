package gateway

import (
	"fmt"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/rjb75/gethomesafe-backend/gateway/auth"
	"github.com/rjb75/gethomesafe-backend/gateway/config"
	"github.com/rjb75/gethomesafe-backend/gateway/utils"
	"github.com/spf13/viper"
)

type Gateway struct {
	config    *config.Config
	G         *gin.Engine
	F         *auth.Firebase
	Timestamp *int64
	TimeLock  sync.Mutex
	Name      string
	S         *Synchronization
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

	if g.S == nil {
		g.S = g.NewSynchronization()
	}

	g.S.Gateways = len(g.config.Gateways)

	return nil
}

func (g *Gateway) InitFirebase() error {
	key := viper.GetString("FIREBASE_API_KEY")

	if key == "" {
		return fmt.Errorf("FIREBASE_API_KEY is not set")
	}

	project := viper.GetString("FIREBASE_PROJECT_ID")

	if project == "" {
		return fmt.Errorf("FIREBASE_PROJECT_ID is not set")
	}

	g.F = auth.New()
	err := g.F.Init(key, project)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gateway) Init() error {
	g.G = gin.Default()
	g.SetupTimestamp()
	g.S = g.NewSynchronization()
	name, err := os.Hostname()

	if err != nil {
		return err
	}
	g.Name = name
	fmt.Println("Gateway name: ", g.Name)
	return nil
}

func (g *Gateway) Run(port string) {
	g.G.Run(port)
}
