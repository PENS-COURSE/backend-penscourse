FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package*.json ./
COPY bun.lockb ./
COPY ./ ./
COPY .env ./

RUN bun add -g @nestjs/cli
RUN bun install

RUN bun db:generate

EXPOSE 3000

CMD [ "bun", "dev" ]
