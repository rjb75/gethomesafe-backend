# API Gateway

The API gateway is developed in Go using Gin. To develop and/or run install Go.

## Configuration

### Service Configuration


```json
{
  "port": 8080,
  "services": {
    "testService": {
      "name": "testService",
      "hosts": ["localhost"],
      "port": 1234,
      "protocol": "http",
      "routes": [
        {
          "path": "/test",
          "method": "GET",
          "gatewayPath": "/test",
          "authenticated": false
        },
        {
          "path": "/test",
          "method": "GET",
          "gatewayPath": "/testauth",
          "authenticated": true
        },
      ]
    },
  },
},
```

Above is an example configuration for the API gateway. The port can be configured for requests and services added under the services property.

Each service is given a `name` for logging purposes and can have multiple `hosts`, each host must run on the same port.

Routes can be added for each service and require a `path` on the service server, HTTP `method`, a `gatewayPath`, and if the route is required to be `authenticated` or not.

## Running

To run the gateway use the following command from the `gateway/` directory

```bash
go run main.go
```
