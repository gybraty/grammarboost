FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

RUN find /app/node_modules -path "*/lightningcss-linux-x64-gnu/lightningcss.linux-x64-gnu.node" \
    -exec cp {} /app/client/node_modules/lightningcss/ \; 2>/dev/null || true

COPY . .

RUN npm run build --workspace=client

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci --omit=dev

COPY server ./server

COPY --from=builder /app/client/out ./server/public

EXPOSE 4000

CMD ["npm", "run", "start", "--workspace=server"]
