# API Gateway

The API gateway is developed in Go using Gin. To develop and/or run install Go.

## Configuration

### Service Configuration


```json
{
  "port": 8080,
   "gateways": [
    "gateway-1",
    "gateway-2",
    "gateway-3"
  ],
  "services": {
    "testService": {
      "name": "testService",
      "hosts": ["localhost"],
      "port": 1234,
      "protocol": "http",
      "heartbeat": "/api/heartbeat",
      "replicationMode": "round-robin",
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

## Deploying

The API gateway is intended to be ran in a deployed environment, in this case docker. Some of the features require the other components of the system with the configuration currently used. The Docker file for this container is found at `./Dockerfile`. The environment is meant to be run with docker compose in the parent folder.
