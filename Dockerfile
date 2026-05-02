FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

RUN LCSS_VER=$(node -p "require('./client/node_modules/lightningcss/package.json').version") && \
    npm pack "lightningcss-linux-x64-gnu@${LCSS_VER}" --pack-destination /tmp && \
    mkdir -p /app/client/node_modules/lightningcss-linux-x64-gnu && \
    tar xzf "/tmp/lightningcss-linux-x64-gnu-${LCSS_VER}.tgz" --strip-components=1 \
        -C /app/client/node_modules/lightningcss-linux-x64-gnu

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
