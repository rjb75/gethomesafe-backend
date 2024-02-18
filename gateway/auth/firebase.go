package auth

import (
	"context"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

type Firebase struct {
	App *firebase.App
}

func New() {

}

func (f *Firebase) Init() {
	credentials := "firebase-config.json"
	opt := option.WithCredentialsFile(credentials)
	app, err := firebase.NewApp(context.Background(), nil, opt)

	if err != nil {
		panic(err)
	}

	f.App = app
}

func (f *Firebase) verifyIDToken(idToken string) (string, error) {
	client, err := f.App.Auth(context.Background())

	if err != nil {
		return "", err
	}

	token, err := client.VerifyIDToken(context.Background(), idToken)

	if err != nil {
		return "", err
	}

	return token.UID, nil
}

func (f *Firebase) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		idToken := c.GetHeader("Authorization")

		if idToken == "" {
			c.AbortWithStatus(401)
			return
		}

		uid, err := f.verifyIDToken(idToken)

		if err != nil {
			c.AbortWithStatus(401)
			return
		}

		c.Set("uid", uid)
		c.Next()
	}
}
