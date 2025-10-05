# Multi-stage Dockerfile for Node.js Acquisitions App

# Stage 1: Base image with Node.js
FROM node:20-alpine AS base
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeuser

# Stage 2: Dependencies installation
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 3: Development dependencies
FROM base AS dev-deps
COPY package*.json ./
RUN npm ci

# Stage 4: Development environment
FROM base AS development
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
USER nodeuser
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 5: Build stage (if needed for production optimizations)
FROM dev-deps AS build
COPY . .
RUN npm run lint
# Add any build steps here if needed (e.g., transpilation, minification)

# Stage 6: Production environment
FROM base AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER nodeuser
EXPOSE 3000
CMD ["npm", "start"]

# Default target is production
FROM production