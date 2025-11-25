# Frontend Dockerfile - Multi-stage build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG BETTER_AUTH_SECRET
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_BASE
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET

# Set environment variables for build (but NOT NODE_ENV yet - we need devDependencies)
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --include=dev

# Now set NODE_ENV=production for the build
ENV NODE_ENV=production

# Copy source code (this should include public directory)
COPY . .

# Verify public directory exists, create if missing
RUN if [ ! -d public ] || [ ! "$(ls -A public 2>/dev/null)" ]; then \
      echo "Warning: public directory is missing or empty, creating empty directory"; \
      mkdir -p public; \
    fi

# Generate Prisma client
RUN npx prisma generate

# Use production config for build (if it exists, otherwise use default)
# This ensures production optimizations are used
RUN if [ -f next.config.production.ts ]; then \
      cp next.config.production.ts next.config.ts; \
      echo "Using production config"; \
    else \
      echo "Using default config"; \
    fi

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client (needed at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy public directory - use a workaround to handle missing directory
# First create the directory, then try to copy contents
RUN mkdir -p ./public && chown nextjs:nodejs ./public
# Use a shell script approach to conditionally copy
RUN --mount=from=builder,source=/app,target=/tmp/builder \
    if [ -d /tmp/builder/public ] && [ "$(ls -A /tmp/builder/public 2>/dev/null)" ]; then \
      cp -r /tmp/builder/public/* ./public/ 2>/dev/null || true; \
      chown -R nextjs:nodejs ./public; \
    fi

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER nextjs

EXPOSE 3000

# Health check (using root endpoint since /api/health may not exist)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]

