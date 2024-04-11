package gateway

type LocationMessage struct {
	CurrentLat  float64 `json:"currentLat" required:"true"`
	CurrentLong float64 `json:"currentLong" required:"true"`
	UserID      string  `json:"userId" required:"false"`
	Timestamp   string  `json:"timestamp" required:"false"`
	UserToken   string  `json:"userToken" required:"false"`
}
