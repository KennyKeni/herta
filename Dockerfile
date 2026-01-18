FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY src src
COPY scripts scripts
COPY .config .config
COPY package.json tsconfig.json ./
USER bun

FROM release AS api
EXPOSE 3000
CMD ["sh", "-c", "bun run migrate:latest && bun run start"]

FROM release AS worker
CMD ["bun", "run", "worker:outbox"]
