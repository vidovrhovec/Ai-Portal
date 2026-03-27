FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --production --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS runner
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files and set permissions
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs .next ./.next
COPY --chown=nextjs:nodejs src ./src
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs server.js ./
COPY --chown=nextjs:nodejs middleware.ts ./

# Create logs directory with correct permissions
RUN mkdir -p logs && chown nextjs:nodejs logs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Generate Prisma Client, copy for Turbopack hash, and start with custom server
CMD npx prisma generate && \
    HASH=$(grep -Eoh 'client-[a-f0-9]{16}' .next/server/chunks/*.js 2>/dev/null | head -1 | sed 's/client-//') && \
    if [ ! -z "$HASH" ]; then \
        echo "Copying Prisma client for Turbopack hash: $HASH"; \
        cp -r node_modules/@prisma/client "node_modules/@prisma/client-$HASH" 2>/dev/null || true; \
    fi && \
    node server.js
