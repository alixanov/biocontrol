# Multi-stage Docker build for BioControl Next.js Web App on Render
FROM node:20-alpine AS builder

WORKDIR /app

# Copy client package definitions
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci

# Copy client source code and build
COPY client/ ./
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app/client

ENV NODE_ENV=production

COPY --from=builder /app/client/public ./public
COPY --from=builder /app/client/.next ./.next
COPY --from=builder /app/client/node_modules ./node_modules
COPY --from=builder /app/client/package.json ./package.json

EXPOSE 3000 10000

# Next.js automatically respects process.env.PORT passed by Render
CMD ["npx", "next", "start"]
