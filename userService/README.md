# User Service

## Local Development

### Prerequisites

- Docker installed on your system. You can download and install Docker from the official website: [Docker](https://www.docker.com/get-started).

1. Run Docker Compose command to start the application.

```bash
docker-compose up --build -d
```

2. Once the services are up and running, you can access the API with the host `http://localhost:3000`.

## API Endpoints

### Authentication

For authenticated routes, you need to provide a valid cookie in the Authorization header.

```bash
X-User-Id <userId>
```

### User Routes

1. **Signup**

   - Path: /api/signup
   - Method: POST
   - Authenticated: No
   - Body: { "email": "email", "password": "password", "displayName": "displayName", "address": { "street": "street", "city": "city", "province": "province", "postalCode": "postalCode", "coordinates": { "lat": "lat", "long": "long" } } }

2. **Update Account**

   - Path: /api/updateAccount
   - Method: PUT
   - Authenticated: Yes
   - Body: { "displayName": "displayName", "address": { "street": "street", "city": "city", "province": "province", "postalCode": "postalCode", "coordinates": { "lat": "lat", "long": "long" } } }

3. **Check User Home**

   - Path: /api/isUserHome
   - Method: GET
   - Authenticated: Yes
   - Query: { "currentLat": "lat", "currentLong": "long" }

4. **Get User Information**
   - Path: /api/getUserInfo
   - Method: GET
   - Authenticated: Yes
