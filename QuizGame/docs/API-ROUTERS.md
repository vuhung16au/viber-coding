# API Routes Documentation

This document provides an overview of the API routes used in the QuizGame application. It outlines the endpoints, their functions, request/response formats, and authentication requirements.

## API Structure

The QuizGame application uses Next.js API routes located in the `/app/api` directory. The routes follow a RESTful design pattern and are organized by resource type.

## Authentication Routes

Base path: `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/login` | Authenticate user and return JWT token | No |
| POST | `/register` | Register a new user | No |
| POST | `/logout` | Invalidate user session | Yes |
| POST | `/reset-password` | Request password reset email | No |
| POST | `/verify-reset-token` | Verify password reset token | No |
| POST | `/update-password` | Update user password | Depends on context |
| GET | `/user` | Get current user information | Yes |

### Request/Response Examples

#### Login

**Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-string",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "User Name",
    "role": "user"
  }
}
```

## Quiz Routes

Base path: `/api/quiz`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get list of public quizzes | No |
| GET | `/:id` | Get a specific quiz by ID | Depends on quiz visibility |
| POST | `/` | Create a new quiz | Yes |
| PUT | `/:id` | Update an existing quiz | Yes (owner or admin) |
| DELETE | `/:id` | Delete a quiz | Yes (owner or admin) |
| GET | `/user/:userId` | Get quizzes by specific user | No |
| GET | `/category/:categoryId` | Get quizzes by category | No |
| POST | `/:id/attempt` | Start a new quiz attempt | Yes |
| POST | `/:id/submit` | Submit quiz answers | Yes |
| GET | `/:id/results` | Get quiz results by attempt ID | Yes |

### Request/Response Examples

#### Get Quiz by ID

**Request:**
```
GET /api/quiz/quiz123
```

**Response:**
```json
{
  "id": "quiz123",
  "title": "General Knowledge Quiz",
  "description": "Test your general knowledge",
  "author": {
    "id": "user123",
    "displayName": "Quiz Creator"
  },
  "categoryId": "category123",
  "difficulty": "medium",
  "questions": [
    {
      "id": "q1",
      "text": "What is the capital of France?",
      "type": "multiple-choice",
      "options": [
        {"id": "opt1", "text": "London"},
        {"id": "opt2", "text": "Paris"},
        {"id": "opt3", "text": "Berlin"},
        {"id": "opt4", "text": "Rome"}
      ]
    }
  ]
}
```

## Category Routes

Base path: `/api/category`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/` | Get all categories | No |
| GET | `/:id` | Get category by ID | No |
| POST | `/` | Create a new category | Yes (admin only) |
| PUT | `/:id` | Update a category | Yes (admin only) |
| DELETE | `/:id` | Delete a category | Yes (admin only) |

## Statistics Routes

Base path: `/api/statistics`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/user/:userId` | Get user statistics | Yes (own user or admin) |
| GET | `/quiz/:quizId` | Get quiz statistics | Quiz owner or admin |
| GET | `/global` | Get global application statistics | No |
| GET | `/leaderboard/:quizId` | Get leaderboard for a specific quiz | No |

## User Routes

Base path: `/api/user`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/:id` | Get public user profile | No |
| PUT | `/:id` | Update user profile | Yes (own user or admin) |
| GET | `/:id/quizzes` | Get public quizzes by user | No |
| GET | `/:id/attempts` | Get quiz attempts by user | Yes (own user or admin) |
| GET | `/:id/statistics` | Get user statistics | Yes (own user or admin) |

## Feedback Routes

Base path: `/api/feedback`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/` | Submit feedback | Yes |
| GET | `/quiz/:quizId` | Get feedback for a quiz | Quiz owner or admin |

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes include:
- `UNAUTHORIZED`: User is not authenticated
- `FORBIDDEN`: User does not have permission
- `NOT_FOUND`: Requested resource does not exist
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API endpoints implement rate limiting to prevent abuse:
- Authentication routes: 10 requests per minute per IP
- General routes: 60 requests per minute per user
- Admin routes: 120 requests per minute per admin user

## Authentication Middleware

API routes use middleware to handle authentication and authorization:

1. `authMiddleware`: Verifies the JWT token in the Authorization header
2. `roleMiddleware`: Checks if user has required role (admin, teacher, user)
3. `ownerMiddleware`: Verifies if user owns the requested resource

## API Versioning

The API does not currently implement explicit versioning. Future versions will use path-based versioning (e.g., `/api/v2/quiz`).

## WebSockets

Real-time features (like live quiz participation) use WebSockets. The WebSocket server is accessible at `/api/ws`.

## GraphQL API

A GraphQL endpoint is available at `/api/graphql` (experimental, not for production use yet).
