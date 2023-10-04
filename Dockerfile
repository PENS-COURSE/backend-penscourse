FROM node:current-alpine3.17

WORKDIR /usr/src/app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm

COPY . .

RUN pnpm install

RUN pnpm db:generate

EXPOSE 3000

CMD [ "pnpm", "dev" ]
