FROM node:26.13.0-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39 AS build
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
RUN npm install --global "$(node -p "require('./package.json').packageManager")"
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter @tnt/web...
COPY apps/web apps/web
RUN pnpm --filter @tnt/web build

FROM nginx:1.30.6-trixie@sha256:51047bea59fed88fbd1f52565d2f5fabcb82d311cf6c9e507a10ce74bb3bc3f0
COPY apps/web/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 apps/web/nginx/40-self-signed-cert.sh /docker-entrypoint.d/
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
