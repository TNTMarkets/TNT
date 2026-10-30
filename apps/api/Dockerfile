FROM node:26.13.0-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39 AS deps
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install --global "$(node -p "require('./package.json').packageManager")"
COPY apps/api/package.json apps/api/
COPY packages/api-schemas/package.json packages/api-schemas/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter @tnt/api...
COPY apps/api apps/api
COPY packages/api-schemas packages/api-schemas

FROM node:26.13.0-trixie-slim@sha256:e4db4c914bf8ad241bd24804fc25d272d89bad97e68cdc8a1414862790a02c39
ENV NODE_ENV=production
COPY --from=deps /repo /repo
WORKDIR /repo/apps/api
USER node
EXPOSE 3000
CMD ["node", "src/main.ts"]
