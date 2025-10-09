# FinTrack Dockerfile
# Multi-stage Dockerfile for building and running FinTrack application efficiently in production.
# Optimized for smaller image size and security by using a non-root user.
# ---------------------------------------------------------------------
# Instructions to build and run the Docker container:
# 1. Build the Docker image:
#    docker build -t financial-tracking:latest .
# 2. Run the Docker container:
#    docker run -d -p 3000:3000 --name fintrack financial-tracking:latest
# 3. (Optional) Use an environment file for configuration:
#    docker run -d -p 3000:3000 --name fintrack --env-file .env financial-tracking:latest
# 4. (Optional) Use Docker Scout to analyze the image:
#    docker scout quickview
# Reference: https://scout.docker.com/nguyenquy0710/Financial-Tracking
# ---------------------------------------------------------------------

# Use Node.js Alpine image for smaller size
# You can change the Node.js version as needed (e.g., 18, 20, 22)
# Check available tags at https://hub.docker.com/_/node
ARG NODE_VERSION=22-alpine3.21

# ---------------------
# Stage 1: BUILD STAGE
# ---------------------
FROM node:${NODE_VERSION} AS build

WORKDIR /app

# Copy only necessary files for build
COPY package*.json ./
COPY tsconfig*.json ./
COPY src/ ./src/
COPY public/ ./public/
COPY views/ ./views/
COPY gulpfile.js ./
COPY .env.example .env.example
# COPY .env .env

# Install full dependencies (including dev)
RUN npm ci

# Build the app
RUN npm run build

# -----------------------
# Stage 2: RUNTIME STAGE
# -----------------------
FROM node:${NODE_VERSION} AS runtime

LABEL maintainer="Nguyen Quy <quy.nh@nhquydev.net>"
LABEL org.opencontainers.image.source="https://github.com/nguyenquy0710/Financial-Tracking"
LABEL org.opencontainers.image.description="FinTrack - Personal Finance Management Application"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.url="https://fintrackapp.com"
LABEL org.opencontainers.image.documentation="https://fintrackapp.com/docs"
LABEL org.opencontainers.image.authors="Nguyen Quy <quy.nh@nhquydev.net>"
LABEL org.opencontainers.image.title="FinTrack"

WORKDIR /app

# Copy only production dependencies
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

# Copy compiled dist folder from build stage
COPY --from=build /app/dist ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# CMD ["node", "src/index.js"]
ENTRYPOINT ["node", "src/index.js"]
