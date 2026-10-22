# ---------- Stage 1: install dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
# Package files first: while they're unchanged, Docker reuses the cached install layer.
# --ignore-scripts: postinstall runs `prisma generate`, which needs the schema copied in stage 2.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

# ---------- Stage 2: build the app ----------
FROM node:22-alpine AS builder
WORKDIR /app
# Prisma checks the OpenSSL version to pick its query engine
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Compile only: no pages are prerendered, so the build needs no database.
# Public pages then render on each request, always showing the current data.
RUN yarn prisma generate && yarn next build --experimental-build-mode=compile

# ---------- Stage 3: the small image that actually runs ----------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a normal user, not root, so a compromised app has fewer powers
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Next.js writes its image-optimization cache here, so the user needs write access
RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
