package config

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type RedisInstance struct {
	Host   string `json:"host"`
	Client *redis.Client
}

// InitRedisInstance initializes the Redis instance for the server object
func (s *Server) InitRedisInstance() error {
	s.Redis = RedisInstance{
		Host: s.Host,
		Client: redis.NewClient(&redis.Options{
			Addr:     fmt.Sprintf("%s:%d", s.Host, s.Port),
			Password: "",
			DB:       0,
		}),
	}

	_, err := s.Redis.Client.Ping(context.Background()).Result()

	if err != nil {
		return err
	}

	return nil
}

// CheckRedisInstance checks the Redis instance for the server object
func (r *RedisInstance) CheckRedisInstance() error {
	_, err := r.Client.Ping(context.Background()).Result()

	if err != nil {
		return err
	}

	return nil
}
