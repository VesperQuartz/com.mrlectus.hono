## dev stage
FROM oven/bun:canary-alpine AS dev
WORKDIR /app
COPY package.json ./
COPY bun.lock* ./
COPY --from=dev /app/.env .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "dev"]

## dev stage
FROM dev AS build

RUN bun install
ENV NODE_ENV=production
RUN bun build ./src/index.ts --outdir ./out --minify --splitting

## prod stage
FROM oven/bun:canary-alpine AS prod
WORKDIR /app

COPY --from=build /app/.env .
COPY --from=build /app/out/ .

EXPOSE 3000
CMD ["bun", "run", "index.js"]




