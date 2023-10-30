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
RUN bun add -g bcrypt
RUN bun add -g node-gyp
RUN bun add bcrypt
RUN bun prisma generate

RUN npm rebuild bcrypt

EXPOSE 3000

CMD [ "bun", "dev:migrate" ]
