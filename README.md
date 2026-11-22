# Elmsworth Studio Backend

The HTTP API and staff cabinet for the [Elmsworth Studio storefront](https://github.com/sergeykovalev3/Elmsworth-Studio-Frontend). The storefront submits consultation requests. Staff can review them, update their status, and manage projects and journal entries. Viewers have read-only access.

| Directory | Stack | Local address |
| --- | --- | --- |
| api/ | Hono, TypeScript, Drizzle and PostgreSQL | http://localhost:3001 |
| admin/ | React, TypeScript, Vite and TanStack Query | http://localhost:5174 |

## Run locally

Use Node.js 22.12 or later and Docker Compose. Copy api/.env.example to api/.env, then fill in both local account email and password pairs. The sample database URL is for the local Compose instance.

~~~sh
docker compose up -d --wait db
npm ci --prefix api
npm ci --prefix admin
~~~

Start these commands in separate terminals:

~~~sh
npm run dev --prefix api
npm run dev --prefix admin
~~~

The API exposes GET /api/health. The cabinet proxies API requests to port 3001 during development. To make uploaded images available in the storefront, set UPLOAD_DIR in api/.env to the storefront checkout's public/projects directory.

## Verify changes

~~~sh
npm test --prefix api
npm run build --prefix admin
~~~

API tests use an in-memory store. The runtime uses PostgreSQL and keeps login sessions in the API process.
