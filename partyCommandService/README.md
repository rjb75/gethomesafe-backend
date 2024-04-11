# Party Command Service

## Local Development

### Prerequisites

- Docker installed on your system. You can download and install Docker from the official website: [Docker](https://www.docker.com/get-started).

1. Run Docker Compose command to start the application.

```bash
docker-compose up --build -d
```

2. Once the services are up and running, you can access the API with the host `http://localhost:5000`.

## API Endpoints

### Authentication

For authenticated routes, you need to provide a valid cookie in the Authorization header.

```bash
X-User-Id <userId>
```

### Party Command Routes

1. **Create Party**

   - Path: /api/create-party
   - Method: POST
   - Authenticated: Yes
   - Body: { "endTime": "2022-09-09T00:00:00.100Z", "partyName": "partyName", "hostDisplayName": "hostDisplayName" }

2. **Join Party**
   - Path: /api/join-party
   - Method: POST
   - Authenticated: Yes
   - Body: { "partyId": "partyId" }

### Location Updates

1. **Location Update**
   - Path: /api/locationUpdate
   - Method: POST
   - Authenticated: Yes
   - Body: { "currentLat": 0.0, "currentLong": 0.0 }
     OR publish to the redis topic `location` with a valid payload: `{ "currentLat": 0.0, "currentLong": 0.0 }`
