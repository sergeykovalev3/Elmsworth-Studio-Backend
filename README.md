<div align="center">
  <img src="https://raw.githubusercontent.com/sergeykovalev3/Elmsworth-Studio-Frontend/main/public/logo.svg" width="220" alt="Elmsworth Studio">
  <h1>Elmsworth Studio Backend</h1>
  <p>The API and staff cabinet behind the landscape studio website.</p>
  <p>
    <img alt="Hono" src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&amp;logo=hono&amp;logoColor=white">
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white">
    <img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&amp;logo=drizzle&amp;logoColor=171717">
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&amp;logo=postgresql&amp;logoColor=white">
    <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&amp;logo=docker&amp;logoColor=white">
    <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&amp;logo=react&amp;logoColor=61DAFB">
  </p>
  <p><a href="https://github.com/sergeykovalev3/Elmsworth-Studio-Frontend">Explore the storefront →</a></p>
</div>

## From inquiry to follow-up

~~~mermaid
flowchart LR
  Site["🌿 Storefront"] -->|Sends consultation requests| API["Hono API"]
  Cabinet["🗂 Staff cabinet"] <-->|Reviews requests and manages content| API
  API <-->|Reads and writes| DB[("PostgreSQL")]
  classDef green fill:#dff3e9,stroke:#58b198,color:#173c32
  classDef blue fill:#e5edff,stroke:#4169e1,color:#253a72
  class Site,Cabinet green
  class API,DB blue
~~~

| | Access |
| --- | --- |
| ✉️ **Visitors** | Submit inquiries and browse published projects and journal entries. |
| 👀 **Viewers** | Sign in and review inquiries without editing them. |
| 🛠 **Administrators** | Update inquiry status, manage projects, and edit journal entries. |

## Run locally

Use Node.js **22.12+** and Docker Compose. Copy **api/.env.example** to **api/.env**, then set the email and password for both local accounts. The sample database URL points to the local Compose instance.

~~~sh
docker compose up -d --wait db
npm ci --prefix api
npm ci --prefix admin
~~~

Start the API and cabinet in separate terminals:

| App | Command | Open |
| --- | --- | --- |
| **API** | npm run dev --prefix api | [Health check](http://localhost:3001/api/health) |
| **Staff cabinet** | npm run dev --prefix admin | [localhost:5174](http://localhost:5174) |

To show uploaded images in the storefront during local development, set **UPLOAD_DIR** in **api/.env** to the storefront checkout’s **public/projects** directory.

## Checks

~~~sh
npm test --prefix api
npm run build --prefix admin
~~~

API tests use an in-memory store. The running API stores records in PostgreSQL and keeps login sessions in the API process.
