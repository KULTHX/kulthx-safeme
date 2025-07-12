# Multi-stage build for production
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN cd client && npx vite build --outDir ../dist/public && cd .. && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Production stage
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 safeme

# Copy built application
COPY --from=builder --chown=safeme:nodejs /app/dist ./dist
COPY --from=deps --chown=safeme:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=safeme:nodejs /app/package*.json ./
COPY --from=builder --chown=safeme:nodejs /app/public ./public

# Create scripts.json file
RUN echo \'{}\'' > scripts.json && chown safeme:nodejs scripts.json

USER safeme

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]


