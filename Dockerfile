FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY src src
COPY .config .config
COPY package.json ./
USER bun

FROM release AS api
EXPOSE 3000
CMD ["bun", "run", "start"]

FROM release AS worker
CMD ["bun", "run", "worker:outbox"]
