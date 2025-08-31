# nft-marketplace

## About

This project bases on create-t3-turbo template

It uses [Turborepo](https://turborepo.org) and contains:

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ admin-bot
  |   ├─ Telegraf
  |   ├─ Backend calls using @trpc/client
  |   └─ DI using tsyringe
  ├─ user-bot
  |   └─ Also Telegraf
  └─ next.js
      ├─ Next.js 15
      ├─ React 19
      ├─ Tailwind CSS
      └─ FSD inspired design
packages
  ├─ api
  |   ├─ tRPC v11 router definition
  |   └─ Separated onion architecture backend
  ├─ auth
  |   └─ Authentication for server and client side
  ├─ db
  |   └─ Typesafe db schema using drizzle
  └─ ui
      └─ Usiversal components from shadcn & custom
tooling
  ├─ eslint
  |   └─ shared, fine-grained, eslint presets
  ├─ prettier
  |   └─ shared prettier configuration
  ├─ tailwind
  |   └─ shared tailwind configuration
  └─ typescript
      └─ shared tsconfig you can extend from
```

> In this template, we use `@acme` as a placeholder for package names. As a user, you might want to replace it with your own organization or project name. You can use find-and-replace to change all the instances of `@acme` to something like `@my-company` or `@project-name`.

## Quick Start

> **Note**
> The [db](./packages/db) package is preconfigured to use Supabase and is **edge-bound** with the [Vercel Postgres](https://github.com/vercel/storage/tree/main/packages/postgres) driver. If you're using something else, make the necessary modifications to the [schema](./packages/db/src/schema) as well as the [client](./packages/db/src/index.ts) and the [drizzle config](./packages/db/drizzle.config.ts). If you want to switch to non-edge database driver, remove `export const runtime = "edge";` [from all pages and api routes](https://github.com/t3-oss/create-t3-turbo/issues/634#issuecomment-1730240214).

To get it running, follow the steps below:

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# Push the Drizzle schema to the database
pnpm db:push
```

## Deployment

### Next.js

#### Prerequisites

> **Note**
> Please note that the Next.js application with tRPC must be deployed in order for the Expo app to communicate with the server in a production environment.

#### Self-deploy using docker-compose

```bash
# this runs docker-compose
pnpm run infra:up
```
