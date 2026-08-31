
# S2 Frontend - School Management


## Features

- ⚡️ Webpack dev server with Hot Module Replacement
- 📦 Asset bundling and optimization
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

```bash
cd ./frontend
```

```bash
   cp .env.example .env
```

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

## Building for Production

Create a production build:

```bash
npm run build
```

Built with ❤️ using React Router.




# S2 Backend - School Management

## Tech stack

- Express 4 + TypeScript
- Prisma ORM 6 (MySQL)
- JWT authentication (`jsonwebtoken`) with bcrypt password hashing (`bcryptjs`)
- Request validation with `zod`
- API docs via `swagger-jsdoc` + `swagger-ui-express`

## Prerequisites

- Node.js 18+
- A running MySQL server

## Get started

   ```bash
   cd ./backend
   ```

   ```bash
   cp .env.example .env
   ```

## Setup

1. Install dependencies (this also runs `prisma generate` via `postinstall`):

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

3. Create the database schema:

   ```bash
   npm run prisma:migrate
   ```

4. Seed the roles table and the first admin account:

   ```bash
   npm run seed
   ```

5. Run the app:

   ```bash
   npm run dev     # rebuilds and restarts on file changes
   # or
   npm start       # one-off build + run
   ```

The API is served at `http://localhost:<PORT>`, and interactive docs are at `http://localhost:<PORT>/api-docs`.

## Project structure

```
app.ts                   Express app setup, middleware, routing, error handling
bin/www.ts                Server entry point (loads env, starts HTTP server)
config/env.ts            Loads and validates environment variables — the only file that reads process.env
config/swagger.ts        Swagger/OpenAPI spec generation, mounted in app.ts
routes/                  Route definitions + Swagger JSDoc annotations
controllers/             Request handlers
middlewares/             Express middleware (JWT auth, role guard)
validations/             Zod request body schemas
lib/prisma.ts            Shared Prisma client instance
utils/                   JWT helpers, token blacklist, role lookup, async handler wrapper
types/express.d.ts       Express Request type augmentation (req.user, req.token)
types/roles.ts           App-level RoleName type/constants
prisma/schema.prisma     Database schema
prisma/seed.ts           Seeds the roles table and the first admin account
```

## Commands


### Prisma

| Command                             | Description                                                                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run prisma:generate`           | Regenerate the Prisma Client from `schema.prisma` (no database changes)                        |
| `npm run prisma:migrate`            | Create a migration from your `schema.prisma` changes (e.g. a new table/column) and apply it — safe, keeps existing data |
| `npm run prisma:deploy`             | Apply already-created migrations without generating new ones — for staging/production, keeps existing data |
| `npm run seed`                      | Run `prisma/seed.ts` — creates the `ADMIN`/`STAFF` role rows and the first admin account        |
| `npm run prisma:studio`             | Open Prisma Studio to browse/edit data in the browser                                          |
| `npx prisma migrate status`         | Show which migrations are applied and whether the schema is in sync                            |
| `npx prisma migrate reset`          | ⚠️ Drops the database and reapplies all migrations + seed — destructive, local dev only          |