FROM node:20-alpine AS base

### Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat git

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
RUN pnpm install

# Builder
FROM base AS builder

RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN apk add --no-cache openssl
RUN pnpm build


### Production image runner ###
FROM base AS runner

# Set NODE_ENV to production
ENV NODE_ENV production

# Disable Next.js telemetry
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Trust host for NextAuth.js in Docker
ENV AUTH_TRUST_HOST true
ENV HOSTNAME 0.0.0.0

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.15.0 --activate

# Install Traefik and required packages
RUN apk add --no-cache \
    openssl \
    curl \
    ca-certificates \
    tzdata \
    && curl -L https://github.com/traefik/traefik/releases/download/v3.0.4/traefik_v3.0.4_linux_amd64.tar.gz \
    | tar -xzf - -C /usr/local/bin \
    && chmod +x /usr/local/bin/traefik

# Workdir for the app
WORKDIR /app

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder  /app/node_modules ./node_modules
COPY --from=builder  /app/.next ./.next
COPY --from=builder  /app/package.json ./package.json
COPY --from=builder  /app/public ./public
COPY --from=builder  /app/traefik ./traefik
COPY --from=builder  /app/prisma ./prisma
COPY --from=builder  /app/pnpm-workspace.yaml ./
COPY --from=builder  /app/tsconfig.json ./tsconfig.json

# Create Traefik directories and ensure permissions
RUN mkdir -p /etc/traefik /app/.next/cache/images \
    && chmod -R 777 /app/.next/cache \
    && chmod 666 /var/run/docker.sock || true

# Copy Traefik configuration files
COPY traefik/traefik.yml /etc/traefik/traefik.yml
COPY traefik/config.yml /etc/traefik/config.yml

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Run the container as root
USER root

# Expose ports
# 80: Traefik HTTP
# 443: Traefik HTTPS  
# 3000: Next.js Dashboard
# Note: Port 8080 (Traefik API) is internal only
EXPOSE 80 443 3000
ENV PORT 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health && curl -f http://localhost:8080/ping || exit 1

# Start both services
CMD ["/start.sh"]