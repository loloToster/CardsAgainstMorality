FROM node:16 AS builder

WORKDIR /tmp/app

COPY ./package.json .
COPY ./server/package*.json ./server/
COPY ./client/package*.json ./client/

# generate correct prisma client
COPY ./server/prisma/ ./server/prisma/

RUN cd ./server && npm i && cd ../client && npm i

COPY . .

RUN npm run build


FROM node:16-alpine3.16 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /tmp/app/package*.json ./
COPY --from=builder /tmp/app/server/package*.json ./server/

# installs only prod deps
RUN cd ./server && npm i

COPY --from=builder /tmp/app/client/dist ./client/dist
COPY --from=builder /tmp/app/server/prisma ./server/prisma
COPY --from=builder /tmp/app/server/dist ./server/dist

EXPOSE 3000

CMD ["npm", "start"]
