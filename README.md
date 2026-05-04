# blogger-api-ts

A RESTful API for a blogging platform built with Node.js, Express, and PostgreSQL. TypeScript rewrite of [blogger-api-with-jwt-auth](../project) with strict typing, request validation, and pagination.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** Express 5
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens), bcrypt
- **Validation:** Zod v4
- **Logging:** Pino
- **Containerization:** Docker

## Features

- JWT authentication with refresh token rotation
- Role-based access control (Admin / NormalUser)
- Refresh tokens stored in DB and revocable
- Request body validation with Zod — errors returned as structured field-level messages
- Cursor-free pagination on list endpoints (`?page=1&limit=10`)
- Structured JSON logging with Pino
- Global error handling with Prisma error mapping

## API Endpoints

### Auth

| Method | Endpoint                       | Access  |
| ------ | ------------------------------ | ------- |
| POST   | `/api/v1/auth/register`        | Public  |
| POST   | `/api/v1/auth/login`           | Public  |
| POST   | `/api/v1/auth/logout`          | Private |
| POST   | `/api/v1/auth/refresh`         | Public  |
| GET    | `/api/v1/auth/me`              | Private |
| POST   | `/api/v1/auth/change-password` | Private |

### Users

| Method | Endpoint            | Access          |
| ------ | ------------------- | --------------- |
| GET    | `/api/v1/users`     | Private (Admin) |
| GET    | `/api/v1/users/:id` | Public          |
| PUT    | `/api/v1/users/:id` | Private         |
| DELETE | `/api/v1/users/:id` | Private         |

### Blogs

| Method | Endpoint            | Access  |
| ------ | ------------------- | ------- |
| GET    | `/api/v1/blogs`     | Public  |
| GET    | `/api/v1/blogs/:id` | Public  |
| POST   | `/api/v1/blogs`     | Private |
| PUT    | `/api/v1/blogs/:id` | Private |
| DELETE | `/api/v1/blogs/:id` | Private |

List endpoints (`GET /blogs`, `GET /users`) support pagination:

```
GET /api/v1/blogs?page=2&limit=5
```

```json
{
  "data": [...],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 5,
    "totalPages": 9
  }
}
```

## Getting Started

```bash
# Start the database and Redis
docker-compose up -d

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

### Other scripts

```bash
npm run build   # compile TypeScript to dist/
npm start       # run compiled output (production)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydb

JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

REDIS_URL=redis://localhost:6379
```

## Health Check

```
GET /health
```

## Roadmap

- [ ] Redis cache-aside for blog list endpoint
- [ ] Rate limiting on auth routes
- [ ] Unit and integration testing (Jest + Supertest)
- [ ] Multi-stage Dockerfile for production builds
- [ ] CI/CD pipeline with GitHub Actions (lint, test, build)
