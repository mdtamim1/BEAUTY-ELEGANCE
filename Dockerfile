# Multi-stage Dockerfile for React + Node.js + Express Fullstack Web App
# Stage 1: Build Frontend and Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json tsconfig*.json vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code and backend code
COPY src ./src
COPY public ./public
COPY backend ./backend
COPY index.html ./

# Build backend and frontend dist
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package info and production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled build output from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/dist ./dist
COPY database ./database

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/cache-status || exit 1

# Start Node.js Production Server
CMD ["node", "backend/dist/server.js"]
