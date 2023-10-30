FROM node:lts-bullseye

WORKDIR /usr/local/apps/online-classroom/dev

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

COPY package*.json bun.lockb ./

RUN bun install

COPY ./ ./
COPY .env ./

RUN bun db:generate

EXPOSE 3000

CMD [ "bun", "dev" ]
