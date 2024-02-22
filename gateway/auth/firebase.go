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

func New() *Firebase {
	return &Firebase{}
}

func (f *Firebase) Init(key string) error {
	opt := option.WithAPIKey(key)
	app, err := firebase.NewApp(context.Background(), nil, opt)

	if err != nil {
		return err
	}

	f.App = app
	return nil
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
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is required"})
			return
		}

		uid, err := f.verifyIDToken(idToken)

		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token"})
			return
		}

		c.Set("uid", uid)
		c.Next()
	}
}
