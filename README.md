# Acquisitions API - Complete Architecture Analysis

## 1. **Identify the Big Picture**

**Project Type:** RESTful API Backend Service built with Node.js and Express.js  
**Purpose:** A secure user authentication and management system for an "acquisitions" platform  
**Problem it Solves:** Provides the foundational authentication infrastructure that could support a larger business acquisitions management system, handling user registration, login, logout, and role-based access control.

---

## 2. **Core Architecture**

**Architecture Pattern:** **Layered/Onion Architecture** with clear separation of concerns  
**Structure Type:** **Monolithic API** with modular organization

### **High-Level Structure:**
```
acquisitions/
├── src/                    # Source code
│   ├── config/            # Configuration (DB, logging)
│   ├── controllers/       # Request handlers & response logic
│   ├── routes/            # API endpoint definitions
│   ├── services/          # Business logic & data operations
│   ├── models/            # Database schema definitions
│   ├── utils/             # Helper utilities (JWT, cookies, formatting)
│   ├── validations/       # Input validation schemas
│   ├── app.js             # Express app configuration
│   ├── server.js          # HTTP server startup
│   └── index.js           # Application entry point
├── drizzle/               # Database migrations
├── logs/                  # Application logs
└── package.json           # Dependencies & scripts
```

**Key Architectural Patterns:**
- **ES Modules:** Modern JavaScript with import/export syntax
- **Path Mapping:** Clean imports using `#` aliases (`#config/*`, `#services/*`)
- **Environment-driven Configuration:** Uses `.env` for different deployment environments

---

## 3. **Key Components**

### **Entry Layer**
- **`src/index.js`**: Bootstrap file that loads environment variables and starts the server
- **`src/server.js`**: HTTP server configuration and port binding
- **`src/app.js`**: Express application setup with middleware stack

### **Route Layer (`src/routes/`)**
- **`index.js`**: Central route registry that mounts all route modules
- **`auth.routes.js`**: Authentication endpoints (`/api/auth/*`)
  - `POST /api/auth/sign-up` - User registration
  - `POST /api/auth/sign-in` - User login
  - `POST /api/auth/sign-out` - User logout

### **Controller Layer (`src/controllers/`)**
- **`auth.controller.js`**: Request handling and response orchestration
  - Input validation using Zod schemas
  - Business logic coordination through services
  - Error handling and HTTP response formatting
  - JWT token management and cookie setting

### **Service Layer (`src/services/`)**
- **`auth.service.js`**: Core business logic implementation
  - `hashPassword()` - Bcrypt password hashing
  - `comparePassword()` - Password verification
  - `createUser()` - User creation with duplicate email checks
  - `authenticateUser()` - Login credential validation

### **Model Layer (`src/models/`)**
- **`user.model.js`**: Database schema using Drizzle ORM
  - Users table: id, name, email, password, role, timestamps
  - Email uniqueness constraint
  - Role-based access (user/admin)

### **Configuration (`src/config/`)**
- **`database.js`**: Neon PostgreSQL connection via Drizzle ORM
- **`logger.js`**: Winston logging with file and console outputs

### **Utilities (`src/utils/`)**
- **`jwt.js`**: JWT token signing and verification
- **`cookies.js`**: Secure cookie management (httpOnly, sameSite, secure flags)
- **`format.js`**: Validation error message formatting

### **Validation (`src/validations/`)**
- **`auth.validations.js`**: Zod schemas for runtime input validation

---

## 4. **Data Flow & Communication**

```
Client Request Flow:
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   HTTP Client   │───▶│ Express App  │───▶│  Route Handler  │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │                      │
                              ▼                      ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Middleware    │    │   Logger     │    │   Controller    │
│ •Helmet•CORS    │    │  (Winston)   │    │ •Validation     │
│ •Morgan•JSON    │    │              │    │ •Service calls  │
│ •CookieParser   │    │              │    │ •JWT & Cookies  │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────┐
                                          │     Service     │
                                          │ •Business Logic │
                                          │ •DB Operations  │
                                          │ •Password Ops   │
                                          └─────────────────┘
                                                     │
                                                     ▼
                                          ┌─────────────────┐
                                          │   Database      │
                                          │ (Neon Postgres) │
                                          │ via Drizzle ORM │
                                          └─────────────────┘
```

**Component Communication:**
- **Routes → Controllers**: HTTP requests with parsed JSON bodies
- **Controllers → Services**: Clean, validated data objects
- **Services → Database**: Type-safe SQL queries via Drizzle ORM
- **Utils**: Cross-cutting concerns consumed by multiple layers

---

## 5. **Tech Stack & Dependencies**

### **Core Framework**
- **Node.js** with **ES Modules** - Modern JavaScript runtime
- **Express.js 5.1.0** - Web application framework

### **Database Stack**
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Drizzle ORM 0.44.6** - Type-safe SQL query builder
- **Drizzle Kit** - Database migrations and schema management

### **Security & Authentication**
- **bcrypt 6.0.0** - Password hashing (10 salt rounds)
- **jsonwebtoken 9.0.2** - JWT token generation/verification
- **helmet 8.1.0** - Security headers middleware
- **cookie-parser 1.4.7** - Secure cookie handling

### **Validation & Utilities**
- **Zod 4.1.11** - Runtime schema validation
- **cors 2.8.5** - Cross-Origin Resource Sharing
- **dotenv 17.2.3** - Environment variable management

### **Logging & Monitoring**
- **Winston 3.18.3** - Structured logging (JSON format)
- **Morgan 1.10.1** - HTTP request logging middleware

### **Development Tools**
- **ESLint + Prettier** - Code quality and formatting
- **Node --watch** - Development auto-restart

**Why These Choices:**
- **Drizzle ORM**: Type-safe, performant, excellent migration support
- **Neon**: Serverless PostgreSQL perfect for modern cloud deployments
- **Zod**: Runtime validation with TypeScript-like developer experience
- **JWT + httpOnly cookies**: Secure stateless authentication pattern

---

## 6. **Execution Flow**

### **User Registration Flow (POST /api/auth/sign-up):**

```
1. Request Reception
   ├── Client sends POST with {name, email, password, role}
   └── Express middleware stack processes request

2. Middleware Processing
   ├── Helmet: Sets security headers
   ├── CORS: Handles cross-origin requests
   ├── JSON Parser: Parses request body
   ├── Cookie Parser: Parses existing cookies
   └── Morgan: Logs HTTP request

3. Route Matching & Controller
   ├── /api/auth/sign-up → auth.routes.js → signUp controller
   └── Input validation with signupSchema (Zod)

4. Service Layer Processing
   ├── Check email uniqueness in database
   ├── Hash password with bcrypt (10 salt rounds)
   ├── Insert user record via Drizzle ORM
   └── Return sanitized user object (no password)

5. Authentication & Response
   ├── Generate JWT token with user payload
   ├── Set httpOnly cookie with 15-minute expiry
   ├── Log successful registration
   └── Return 201 with user data

6. Error Handling
   ├── Validation errors → 400 with formatted messages
   ├── Duplicate email → 409 conflict error
   └── Server errors → 500 with logging
```

### **User Login Flow (POST /api/auth/sign-in):**

```
1. Credential Validation
   ├── Validate email/password with signinSchema
   └── Find user by email in database

2. Authentication
   ├── Compare provided password with stored hash
   ├── Throw error if user not found or password invalid
   └── Return user object without password

3. Session Creation
   ├── Generate new JWT token
   ├── Set secure cookie
   └── Return success response with user data
```

### **User Logout Flow (POST /api/auth/sign-out):**

```
1. Cookie Clearing
   ├── Clear JWT token cookie
   ├── Log logout event
   └── Return success message
```

---

## 7. **Strengths & Tradeoffs**

### **Strengths**

**🔒 Security Excellence**
- Industry-standard password hashing with bcrypt
- Secure JWT implementation with httpOnly cookies
- Comprehensive security headers via Helmet
- Input sanitization and validation with Zod

**🏗️ Architecture Quality**
- Clean separation of concerns (layered architecture)
- Modern ES Modules with clean import paths
- Type-safe database operations with Drizzle ORM
- Comprehensive error handling and logging

**🚀 Developer Experience**
- Auto-restart development workflow
- Structured logging with Winston
- Code quality enforcement (ESLint/Prettier)
- Database migrations managed properly

**☁️ Production Ready**
- Serverless PostgreSQL with Neon
- Environment-driven configuration
- Health check endpoints
- Structured error responses

### **Tradeoffs & Limitations**

**⚠️ Incomplete Feature Set**
- No JWT token validation middleware for protected routes
- Missing password reset functionality
- No email verification system
- Limited user profile management

**⚠️ Scalability Considerations**
- Monolithic architecture may limit scaling for complex workflows
- No session store (Redis) for distributed deployments
- Single database instance (no read replicas)
- Short cookie expiry (15 minutes) may impact UX

**⚠️ Production Gaps**
- No rate limiting for brute force protection
- Missing API versioning strategy
- Limited monitoring and metrics collection
- No input sanitization beyond validation

---

## 8. **API Endpoints & Usage**

### **Base URL**: `http://localhost:3000`

### **Health & Status Endpoints**

#### **GET /** - Root Endpoint
```bash
GET /
```
**Response:**
```json
"Hello from Acquisitions API!"
```

#### **GET /health** - Health Check
```bash
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timeStamp": "2025-10-04T21:11:59.123Z",
  "uptime": 156.789
}
```

#### **GET /api** - API Status
```bash
GET /api
```
**Response:**
```json
{
  "message": "Acquisitions API is running!"
}
```

### **Authentication Endpoints**

#### **POST /api/auth/sign-up** - User Registration

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

#### **POST /api/auth/sign-in** - User Login

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "message": "User signed in successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
```

#### **POST /api/auth/sign-out** - User Logout

**Request Body:** No body required (uses cookie for authentication)
```json
{}
```

**Success Response (200):**
```json
{
  "message": "User signed out successfully"
}
```

### **cURL Examples**

#### **User Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

#### **User Login:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

#### **User Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{}'
```

---

## 9. **Development Setup**

### **Prerequisites**
- Node.js (ES Modules support)
- PostgreSQL database (Neon recommended)
- Environment variables configured

### **Installation & Running**
```bash
# Install dependencies
npm install

# Development mode (auto-restart)
npm run dev

# Production mode
npm start

# Database operations
npm run db:generate    # Generate migrations
npm run db:migrate     # Run migrations
npm run db:studio      # Open Drizzle Studio

# Code quality
npm run lint          # Run ESLint
npm run format        # Format with Prettier
```

### **Environment Variables**
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
```

---

## 10. **Final Summary**

The Acquisitions API is a well-architected Node.js/Express authentication service that demonstrates modern backend development best practices with clean layered architecture, type-safe database operations via Drizzle ORM, and comprehensive security measures including bcrypt password hashing and JWT-based authentication. While currently focused on user management fundamentals (registration, login, logout), the codebase provides a solid, scalable foundation that could easily be extended with additional business logic for acquisition workflows, deal management, or document processing features. The emphasis on code quality, security, and developer experience makes this an exemplary starting point for a larger enterprise application.

---

**Generated by:** Warp AI Assistant  
**Date:** October 4, 2025  
**Project:** Acquisitions API v1.0.0