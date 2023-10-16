FROM node:lts-bullseye

WORKDIR /usr/src/app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

COPY . .

RUN pnpm install

RUN pnpm db:generate

EXPOSE 3000

CMD [ "pnpm", "dev" ]
