package config

import "encoding/json"

func New() *Config {
	return &Config{}
}

func (c *Config) Parse(data []byte) error {

	err := json.Unmarshal(data, c)

	if err != nil {
		return err
	}

	return nil
}
