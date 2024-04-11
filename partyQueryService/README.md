# Party Query Service

## Local Development

### Prerequisites

- Docker installed on your system. You can download and install Docker from the official website: [Docker](https://www.docker.com/get-started).

1. Run Docker Compose command to start the application.

```bash
docker-compose up --build -d
```

2. Once the services are up and running, you can access the API with the host `http://localhost:4000`.

## API Endpoints

### Authentication

For authenticated routes, you need to provide a valid cookie in the Authorization header.

```bash
X-User-Id <userId>
```

### Party Query Routes

1. **Party Invitation**

   - Path: /api/partyInvite
   - Method: GET
   - Authenticated: Yes
   - Query: { "inviteCode": "123456" }

2. **List Parties**

   - Path: /api/parties
   - Method: GET
   - Authenticated: Yes

3. **Party Status**
   - Path: /api/partyStatus
   - Method: GET
   - Authenticated: Yes
   - Query: { "partyId": "partyId" }
