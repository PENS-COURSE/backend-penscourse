###################
# DEPENDENCIES
###################
FROM imbios/bun-node:20-slim AS dependencies
WORKDIR /app


# Install OpenSSL
RUN apt-get -y update && apt-get install -yq openssl git ca-certificates

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install
RUN npm rebuild bcrypt

###################
# BUILDER
###################
FROM dependencies AS builder
WORKDIR /app

# Install OpenSSL
RUN apt-get -y update && apt-get install -yq openssl git ca-certificates

COPY . .
COPY --from=dependencies /app/node_modules/ ./node_modules/
COPY prisma ./prisma/

RUN export NODE_OPTIONS="--max-old-space-size=4097"

# Build the app
RUN bun prisma generate
RUN bun run build

###################
# PRODUCTION
###################
FROM dependencies AS production
ENV NODE_ENV production
WORKDIR /app

# Install OpenSSL
RUN apt-get -y update && apt-get install -yq openssl git ca-certificates

COPY .env.staging /app/.env

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/public/ ./public/
COPY --from=builder /app/prisma/ ./prisma/

RUN bun install --production

EXPOSE 3000

RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN bun prisma generate

ENTRYPOINT ["bun", "run", "start:migrate:prod"]
