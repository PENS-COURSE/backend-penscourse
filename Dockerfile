FROM oven/bun:debian

WORKDIR /usr/local/apps/online-classroom/dev

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY bun.lockb ./
COPY ./ ./
COPY .env ./

RUN bun install

RUN bun db:generate

EXPOSE 3000

CMD [ "bun", "dev" ]
