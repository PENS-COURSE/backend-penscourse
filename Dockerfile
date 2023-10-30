FROM node:lts-bullseye

WORKDIR /usr/src/app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
COPY bun.lockb ./
COPY ./ ./
COPY .env ./

RUN npm install -g bun
RUN bun add -g @nestjs/cli
RUN bun install

EXPOSE 3000

CMD [ "bun", "dev:migrate" ]
