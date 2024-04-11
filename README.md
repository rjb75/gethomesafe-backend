# gethomesafe-backend

## Local Development

### Prerequisites

- Docker installed on your system. You can download and install Docker from the official website: [Docker](https://www.docker.com/get-started).

```bash
git clone https://github.com/rjb75/gethomesafe-backend.git
```

1. Navigate to the root directory of the application.

```bash
cd gethomesafe-backend
```

2. Run the Docker Compose command to start the application services.

```bash
docker-compose up --build -d
```

3. Once the services are up and running, you can access the API with the host `http://localhost:8080`.

## Additional Notes

- Application requires environment variables make sure to make a .env file with the appropriate variables.
- For advanced usage or troubleshooting, refer to the Docker Compose documentation: [Docker Compose Documentation](https://docs.docker.com/compose/).

## Authentication

For authenticated routes, you need to provide a valid cookie in the Authorization header.

```bash
Authorization <cookie>
```

## User Service

### Hosts

- user-service-0:3000
- user-service-1:3000
- user-service-2:3000

### Replication Mode

- Primary Leader (Leader Election)

### Routes

1. **Signup**

   - Path: http://localhost:8080/api/signup
   - Method: POST
   - Authenticated: No
   - Body: { "email": "email", "password": "password", "displayName": "displayName", "address": { "street": "street", "city": "city", "province": "province", "postalCode": "postalCode", "coordinates": { "lat": "lat", "long": "long" } } }

2. **Update Account**

   - Path: http://localhost:8080/api/updateAccount
   - Method: PUT
   - Authenticated: Yes
   - Body: { "displayName": "displayName", "address": { "street": "street", "city": "city", "province": "province", "postalCode": "postalCode", "coordinates": { "lat": "lat", "long": "long" } } }

3. **Check User Home**

   - Path: http://localhost:8080/api/isUserHome
   - Method: GET
   - Authenticated: Yes
   - Query: { "currentLat": "lat", "currentLong": "long" }

4. **Get User Information**
   - Path: /api/getUserInfo
   - Method: GET
   - Authenticated: Yes

## Party Query Service

### Internal Hosts

- party-query-service-0:4000
- party-query-service-1:4000
- party-query-service-2:4000

### Replication Mode

- Round-Robin

### Endpoints

1. **Party Invitation**

   - Path: http://localhost:8080/api/partyInvite
   - Method: GET
   - Authenticated: Yes
   - Query: { "inviteCode": "123456" }

2. **List Parties**

   - Path: http://localhost:8080/api/parties
   - Method: GET
   - Authenticated: Yes

3. **Party Status**
   - Path: http://localhost:8080/api/partyStatus
   - Method: GET
   - Authenticated: Yes
   - Query: { "partyId": "partyId" }

## Party Command Routes

### Hosts

- party-command-service-0:5000
- party-command-service-1:5000
- party-command-service-2:5000

### Replication Mode

- Round-Robin

### Endpoints

1. **Create Party**

   - Path: http://localhost:8080/api/create-party
   - Method: POST
   - Authenticated: Yes
   - Body: { "endTime": "2022-09-09T00:00:00.100Z", "partyName": "partyName", "hostDisplayName": "hostDisplayName" }

2. **Join Party**
   - Path: http://localhost:8080/api/join-party
   - Method: POST
   - Authenticated: Yes
   - Body: { "partyId": "partyId" }

### Location Updates

1. **Location Update**
   - Path: http://localhost:8080/api/locationUpdate
   - Method: POST
   - Authenticated: Yes
   - Body: { "currentLat": 0.0, "currentLong": 0.0 }
     OR publish to the redis topic `location` with a valid payload: `{ "currentLat": 0.0, "currentLong": 0.0 }`

## Deployable Link

The API is also accessible through a deployable link. You can access it at `https://gethomesafe.live`.
