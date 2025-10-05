# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js/Express.js authentication API called "Acquisitions" that implements a secure user management system with JWT-based authentication, role-based access control, and comprehensive security middleware using Arcjet.

**Architecture**: Layered/Onion architecture with clean separation of concerns
**Database**: Neon PostgreSQL with Drizzle ORM
**Security**: bcrypt password hashing, JWT tokens, httpOnly cookies, Arcjet security middleware

## Common Development Commands

### Development

```bash
# Start development server with auto-reload
npm run dev

# Start with Docker (includes Neon Local database)
npm run dev:docker
# OR
sh scripts/dev.sh
```

### Database Operations

```bash
# Generate new migrations after schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check
```

### Production Deployment

```bash
# Start production server
npm start

# Deploy with Docker
npm run prod:docker
# OR
sh scripts/prod.sh
```

### Docker Development

```bash
# Start development environment (app + Neon Local database)
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Run commands inside container
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Stop environment
docker-compose -f docker-compose.dev.yml down
```

## Architecture & Code Structure

### Import Path Aliases

The project uses ES Module import path mapping for clean imports:

- `#config/*` → `./src/config/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#controllers/*` → `./src/controllers/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`
- `#middleware/*` → `./src/middleware/*`

### Layered Architecture Flow

```
Routes → Controllers → Services → Models/Database
  ↓         ↓            ↓           ↓
HTTP    Validation   Business    Data Access
Layer     & Error     Logic      via Drizzle
         Handling
```

**Key Patterns:**

- **Controllers** handle HTTP concerns (validation, responses, error handling)
- **Services** contain pure business logic and data operations
- **Models** define database schemas using Drizzle ORM
- **Utils** provide cross-cutting concerns (JWT, cookies, formatting)

### Database Schema

The application uses a single `users` table with:

- `id` (serial, primary key)
- `name` (varchar, required)
- `email` (varchar, unique, required)
- `password` (varchar, bcrypt hashed, required)
- `role` (varchar, 'user'|'admin', default 'user')
- `createdAt`, `updatedAt` (timestamps)

### Security Architecture

- **Password Security**: bcrypt with 10 salt rounds
- **Authentication**: JWT tokens stored in httpOnly cookies (15min expiry)
- **Rate Limiting**: Arcjet middleware with role-based limits (admin: 20/min, user: 10/min, guest: 5/min)
- **Bot Protection**: Arcjet bot detection with allowlist for dev tools
- **Headers**: Helmet middleware for security headers
- **Input Validation**: Zod schemas with custom error formatting

### Environment Configurations

- **Development**: Uses Neon Local proxy (`neonConfig.fetchEndpoint='http://neon-local:5432/sql'`)
- **Production**: Connects directly to Neon Cloud via `DATABASE_URL`

## API Endpoints

### Authentication Routes (`/api/auth/`)

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout

### Health Check Routes

- `GET /` - Root endpoint
- `GET /health` - Health status with uptime
- `GET /api` - API status

### Request/Response Patterns

All endpoints follow consistent patterns:

- **Validation**: Zod schemas for input validation
- **Error Handling**: Structured error responses with appropriate HTTP status codes
- **Logging**: Winston structured logging for all operations
- **Security**: Arcjet middleware applied to all routes

## Database Development

### Drizzle ORM Workflow

1. **Schema Changes**: Modify files in `src/models/`
2. **Generate Migration**: `npm run db:generate`
3. **Review Migration**: Check generated SQL in `drizzle/` directory
4. **Apply Migration**: `npm run db:migrate`
5. **Verify**: Use `npm run db:studio` to inspect database

### Local Development with Docker

The development setup uses Neon Local for database development:

- Provides ephemeral database branches
- Full PostgreSQL compatibility
- Easy reset by restarting containers
- No local PostgreSQL installation needed

## Testing & Debugging

### Manual API Testing

```bash
# User Registration
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123", "role": "user"}'

# User Login (save cookies)
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "test@example.com", "password": "password123"}'

# User Logout (use cookies)
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Logging & Debugging

- **Development**: Console + file logging with colors
- **Production**: File logging only (`logs/error.log`, `logs/combined.log`)
- **Log Levels**: Configurable via `LOG_LEVEL` environment variable
- **Structured Logging**: JSON format with timestamps and service metadata

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Authentication
JWT_SECRET=your-secret-key-here

# Security (Arcjet)
ARCJET_KEY=your-arcjet-key-here
```

### Optional Variables (have defaults)

```bash
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

### Development-Specific (.env.development)

```bash
# Neon Local development
NEON_API_KEY=your_neon_api_key
NEON_PROJECT_ID=your_neon_project_id
DATABASE_URL=postgresql://user:password@neon-local:5432/neondb
```

## Extending the Application

### Adding New Routes

1. Create route file in `src/routes/`
2. Create controller in `src/controllers/`
3. Add business logic to `src/services/`
4. Register route in `src/routes/index.js`

### Adding Database Tables

1. Create model in `src/models/`
2. Import and export in `src/models/user.model.js` or create index
3. Generate migration with `npm run db:generate`
4. Apply migration with `npm run db:migrate`

### Security Considerations

- All endpoints automatically get Arcjet security middleware
- JWT tokens expire in 15 minutes (configured in `src/utils/cookies.js`)
- Rate limits are role-based (configured in `src/middleware/security.middleware.js`)
- Always validate inputs with Zod schemas
- Never return password fields in API responses

## Docker Development

The project includes comprehensive Docker support:

### Development Stack

- **Application**: Node.js with hot reload
- **Database**: Neon Local proxy container
- **Network**: Bridge network for container communication

### Production Features

- **Multi-stage builds** for optimized images
- **Non-root user** execution (nodeuser:1001)
- **Security hardening** (read-only filesystem, no new privileges)
- **Resource limits** (512MB RAM, 0.5 CPU)
- **Health checks** for container monitoring

Use the shell scripts (`scripts/dev.sh`, `scripts/prod.sh`) for streamlined Docker workflows with automatic database migrations and container health checking.
