# Task Manager Application

A minimal Todo web app built with Next.js, NextAuth, Prisma, and PostgreSQL where authenticated users can manage their personal tasks.

## Features

- Google OAuth authentication via NextAuth
- PostgreSQL database with Prisma ORM
- Task manager (create, list, search, toggle done status)
- Per-user data isolation
- Search tasks by title
- Pagination support
- Material-UI components
- Comprehensive test coverage

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth with Google OAuth
- **Testing**: Jest, React Testing Library
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials

## Getting Started

### 1. Clone and Install Dependencies

```bash
cd task-management
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if not already done
6. Set application type to "Web application"
7. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Copy the Client ID and Client Secret to your `.env` file

### 4. Set Up Database

Run Prisma migrations to create the database schema:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
task-management/
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth routes
│   │   │   └── tasks/          # Task API routes
│   │   ├── auth/
│   │   │   └── signin/         # Sign in page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (task list)
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx      # App header
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── MuiProvider.tsx
│   │   └── tasks/
│   │       ├── CreateTaskDialog.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchBar.tsx
│   │       └── TaskList.tsx
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── prisma.ts           # Prisma client
│   │   └── validations/
│   │       └── task.ts         # Zod schemas
│   ├── types/
│   │   └── next-auth.d.ts      # NextAuth type definitions
│   └── __tests__/              # Test files
├── .env.example                # Environment variables template
├── jest.config.js              # Jest configuration
├── next.config.js              # Next.js configuration
├── package.json
└── tsconfig.json
```

## API Endpoints

### GET /api/tasks

Retrieve tasks for the authenticated user.

**Query Parameters:**
- `q` (optional): Search query for filtering tasks by title (case-insensitive)
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10, max: 100): Items per page

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "done": boolean,
      "createdAt": "ISO date string",
      "userId": "string"
    }
  ],
  "page": number,
  "pageSize": number,
  "total": number,
  "totalPages": number
}
```

### POST /api/tasks

Create a new task.

**Request Body:**
```json
{
  "title": "string (1-200 characters)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string",
  "title": "string",
  "done": false,
  "createdAt": "ISO date string",
  "userId": "string"
}
```

### PATCH /api/tasks/:id/toggle

Toggle the done status of a task.

**Response:** `200 OK`
```json
{
  "id": "string",
  "title": "string",
  "done": boolean,
  "createdAt": "ISO date string",
  "userId": "string"
}
```

## Error Responses

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User attempting to access another user's task
- `404 Not Found`: Task not found
- `500 Internal Server Error`: Server error

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security Features

- Google OAuth authentication required for all operations
- Per-user data isolation enforced at the database query level
- Session-based authentication with JWT tokens
- Input validation using Zod schemas
- CSRF protection via NextAuth
- Environment variables for sensitive credentials

## Database Schema

### User
- `id`: Unique identifier (CUID)
- `email`: User email (unique)
- `name`: User name (optional)
- `image`: Profile image URL (optional)
- `emailVerified`: Email verification timestamp
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Task
- `id`: Unique identifier (CUID)
- `title`: Task title (1-200 characters)
- `done`: Completion status (boolean)
- `createdAt`: Task creation timestamp
- `userId`: Foreign key to User
