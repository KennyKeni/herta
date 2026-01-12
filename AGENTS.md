# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev                   # Start dev server with watch mode
bun run start                 # Start production server (no watch)
bun run migrate:make <name>   # Create a new migration
bun run migrate:up            # Run next pending migration
bun run migrate:down          # Rollback last migration
bun run migrate:rollback      # Rollback ALL migrations
bun run migrate:latest        # Run all pending migrations
bun run migrate:list          # List migration status
bun run seed                  # Seed database with reference data
bun run seed:clear            # Clear all seeded data
bun run worker:outbox         # Start outbox poller worker
bun run codegen               # Regenerate DB types from schema
bun run check                 # Run biome check
bun run check:fix             # Run biome check with auto-fix
bun run lint                  # Run biome lint
bun run lint:fix              # Run biome lint with auto-fix
bun run format                # Format code with biome
bun run format:check          # Check formatting without writing
```

## Code Style

- Minimal comments — only when logic is non-obvious
- No redundant comments that restate the code
- Prefer self-documenting code over comments
- No AI-style comments (e.g., "This function does X", "Here we...")

## Architecture

This project uses a **feature-based structure** with clear separation between layers:

```
┌─────────────────────────────────────────────────────────────┐
│                         Request                             │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Router                                                     │
│  - TypeBox DTO validates input                              │
│  - Mapper: DTO → Domain type                                │
│  - Calls service with domain type                           │
│  - Mapper: Domain → Response DTO                            │
│  - TypeBox DTO validates/strips output                      │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Service                                                    │
│  - Pure business logic                                      │
│  - Only knows domain types                                  │
│  - No HTTP, no validation, no DTOs                          │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Repository / DB                                            │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
.config/
└── kysely.config.ts      # Kysely CLI configuration
src/
├── index.ts              # App entry point, mounts feature modules
├── config/
│   └── index.ts          # Loads, validates, exports typed config (fail-fast on missing env vars)
├── infrastructure/
│   ├── db/
│   │   ├── index.ts      # Kysely instance and DB connection
│   │   ├── types.ts      # Generated types from kysely-codegen
│   │   └── migrations/   # Kysely migration files
│   └── <client>/         # Other infra clients (redis, etc.)
│       └── index.ts
├── utils/
│   └── <util>/
│       └── index.ts
└── modules/
    └── <module>/
        ├── index.ts              # Elysia controller (routes)
        ├── service.ts            # Business logic
        ├── model.ts              # TypeBox schemas (validation)
        ├── mapper.ts             # domain ↔ model transforms
        ├── repository.ts         # Database queries (Kysely)
        └── domain.ts             # Plain TS interfaces (optional)
```

Each module is an Elysia plugin that groups related routes, mounted via `.use()` in the main app.

### Data Flow

```
Request body
    │
    ▼ (validated by TypeBox schema)
Model type (typeof schema.static)
    │
    ▼ (mapper: model → domain)
Domain type
    │
    ▼ (service)
Domain entity
    │
    ▼ (mapper: domain → response)
Response type
    │
    ▼ (validated/stripped by response schema)
JSON response
```

### Layer Ownership

| File | Owns | Depends on |
|------|------|------------|
| `domain.ts` | Plain TS types | Nothing |
| `model.ts` | TypeBox schemas | Nothing |
| `mapper.ts` | Transforms | Domain + Model types |
| `service.ts` | Business logic | Domain types, Repository |
| `repository.ts` | DB queries | Domain types |
| `index.ts` | HTTP wiring (controller) | Everything |

### Design Rules

1. **Elysia instance = controller** — define routes directly on the instance
2. **Models use TypeBox** — use `.static` for type inference, never separate type declarations
3. **Mappers are explicit** — no magic, testable transforms
4. **Services are pure** — domain in, domain out, no HTTP knowledge
5. **Never pass entire Context** — destructure and pass only what's needed

---

## Auth

- Better Auth sessions must stay in Redis only (`session.storeSessionInDatabase = false`).
- Do not create or use a `session` table in Postgres for auth.

---

## Elysia Best Practices

### Controller (index.ts)

**Elysia instance = controller.** Define routes directly on the Elysia instance. Never pass entire Context to external functions.

```ts
// src/modules/auth/index.ts
import { Elysia } from 'elysia'
import { AuthService } from './service'
import { AuthModel } from './model'

export const auth = new Elysia({ prefix: '/auth' })
    .post('/sign-in', async ({ body, cookie: { session } }) => {
        const response = await AuthService.signIn(body)
        session.value = response.token
        return response
    }, {
        body: AuthModel.signInBody,
        response: {
            200: AuthModel.signInResponse,
            400: AuthModel.signInInvalid
        }
    })
```

**Do:**
- Treat 1 Elysia instance = 1 controller
- Destructure context and pass only what's needed to services

**Don't:**
- Create controller classes that accept `Context` as parameter
- Pass entire Context object to external functions

### Service (service.ts)

Two types of services:

**1. Non-request dependent (abstract class with static methods):**
```ts
abstract class AuthService {
    static async signIn(credentials: SignInCredentials) {
        // Business logic here
    }
}
```

**2. Request-dependent (Elysia instance with macros):**
```ts
const AuthService = new Elysia({ name: 'Auth.Service' })
    .macro({
        isSignIn: {
            resolve({ cookie, status }) {
                if (!cookie.session.value) return status(401)
                return { session: cookie.session.value }
            }
        }
    })
```

### Model (model.ts)

Use TypeBox schemas. Get types via `.static` property — never declare types separately.

```ts
import { t } from 'elysia'

const signInBody = t.Object({
    username: t.String(),
    password: t.String()
})

type SignInBody = typeof signInBody.static

export const AuthModel = {
    signInBody,
    signInResponse: t.Object({ token: t.String() }),
    signInInvalid: t.Object({ error: t.String() })
}
```

**Do:**
- Use `typeof schema.static` for type inference
- Group related schemas in an exported object
- Name schemas to indicate direction: `*Query` for query params, `*Body` for request bodies, `*Response` for outputs

**Don't:**
- Declare types separate from schemas
- Use class instances as models

### Testing

Test controllers using Elysia's `handle` method:

```ts
import { describe, it, expect } from 'bun:test'

const app = new Elysia().get('/', () => 'ok')

describe('Controller', () => {
    it('should work', async () => {
        const response = await app
            .handle(new Request('http://localhost/'))
            .then((x) => x.text())
        expect(response).toBe('ok')
    })
})
```

---

## Dependency Injection

Elysia uses `.decorate()` for DI. Create module-specific setup plugins that wire dependencies:

```
src/infrastructure/
├── setup.ts              # DI container - exports per-module setup plugins
```

### Setup Plugin Pattern

Create separate setup plugins per module. Each plugin is named with the `setup:<module>` convention for deduplication.

```ts
// src/infrastructure/setup.ts
import { Elysia } from 'elysia'
import { db } from './db'

// Import repositories
import { PokemonRepository } from '../modules/pokemon/repository'
import { MovesRepository } from '../modules/moves/repository'

// Import services
import { PokemonService } from '../modules/pokemon/service'
import { AgentService } from '../modules/agent/service'

// Instantiate repositories (inject db)
const pokemonRepository = new PokemonRepository(db)
const movesRepository = new MovesRepository(db)

// Instantiate services (inject repositories)
const pokemonService = new PokemonService(pokemonRepository)
const agentService = new AgentService(pokemonRepository, movesRepository)

// Export separate setup plugins per module
export const pokemonSetup = new Elysia({ name: 'setup:pokemon' })
  .decorate('pokemonService', pokemonService)

export const agentSetup = new Elysia({ name: 'setup:agent' })
  .decorate('agentService', agentService)
```

### Using in Controllers

Controllers import only the setup plugin they need:

```ts
// src/modules/pokemon/index.ts
import { Elysia } from 'elysia'
import { pokemonSetup } from '../../infrastructure/setup'

export const pokemon = new Elysia({ prefix: '/pokemon' })
  .use(pokemonSetup)
  .get('/:slug', ({ pokemonService, params }) =>
    pokemonService.getBySlug(params.slug)
  )
```

### Adding a New Module

1. Create repository class in `modules/<name>/repository.ts`
2. Create service class in `modules/<name>/service.ts`
3. In `setup.ts`:
   - Import repository and service
   - Instantiate repository with `db`
   - Instantiate service with required repositories
   - Export a new setup plugin: `export const <name>Setup = new Elysia({ name: 'setup:<name>' }).decorate('<name>Service', <name>Service)`
4. In controller, `.use(<name>Setup)` to access the service

### Elysia Context Methods

| Method | Use Case | Lifecycle |
|--------|----------|-----------|
| `.decorate()` | Singletons (services, repos, db) | Once at startup |
| `.state()` | Mutable shared state | Shared across requests |
| `.derive()` | Per-request values (headers) | Before validation |
| `.resolve()` | Per-request after validation | After validation |

**Note:** `{ name: 'setup' }` deduplicates the plugin if `.use(setup)` is called multiple times.

---

## Feature Roadmap

### Priority 1 — Core Wiki (MVP)

| Feature | Endpoints | Notes | Status |
|---------|-----------|-------|--------|
| **Pokemon** | `GET /pokemon`, `GET /pokemon/:identifier` | Forms, types, abilities, stats, evolutions | Done |
| **Moves** | `GET /moves`, `GET /moves/:identifier` | Power, accuracy, type, effects, learners | Done |
| **Abilities** | `GET /abilities`, `GET /abilities/:identifier` | Description, Pokemon with ability | Done |
| **Items** | `GET /items`, `GET /items/:identifier` | Effects, crafting recipes | Done |
| **Types** | `GET /types`, `GET /types/:identifier` | Matchup chart, hidden power IVs | Done |
| **Articles** | `GET /articles`, `GET /articles/:identifier` | Wiki guides, categories, search | Done |

### Priority 2 — Enhanced Discovery

| Feature | Endpoints | Notes | Status |
|---------|-----------|-------|--------|
| **Search** | `GET /search?q=` | Global fuzzy search (pg_trgm) | |
| **Filters** | Query params on list endpoints | By type, generation, egg group, etc. | |
| **Recipes** | `GET /recipes`, `GET /recipes/:identifier` | Crafting inputs/outputs | |

### Priority 3 — Cobblemon-Specific

| Feature | Endpoints | Notes | Status |
|---------|-----------|-------|--------|
| **Spawns** | `GET /spawns` | Biomes, conditions, rarity (filter by formIds) | Done |
| **Drops** | `GET /pokemon/:identifier/drops` | Item drops with percentages | |
| **Riding** | `GET /pokemon/:identifier/riding` | Mount data | |
| **Aspects** | `GET /aspects`, aspect filtering | Shiny, regional variants | |

### Priority 4 — Reference Data

| Feature | Endpoints | Notes | Status |
|---------|-----------|-------|--------|
| **Natures** | `GET /natures` | Stat modifiers | |
| **Egg Groups** | `GET /egg-groups/:identifier` | Pokemon in group | |
| **Experience** | `GET /experience-groups` | Leveling curves | |

---

## Outbox Pattern (Event-Driven Sync)

The outbox pattern ensures reliable event delivery for syncing entities to external systems (e.g., search index like Meilisearch).

### Table Structure

```
outbox_events
├── id (serial PK)
├── entity_type ──── CHECK: species, form, move, ability, item, article
├── entity_id
├── operation ────── CHECK: CREATE, UPDATE, DELETE
├── created_at
└── processed_at ─── NULL until processed (partial index)
```

### How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Service   │────▶│   Outbox    │────▶│   Poller    │────▶│   Search    │
│  (writes)   │     │   Table     │     │  (cron/bg)  │     │   Index     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. **Service writes** — On entity CREATE/UPDATE/DELETE, insert row into `outbox_events`
2. **Poller reads** — Background job polls for `processed_at IS NULL` (uses partial index)
3. **Sync to search** — Send batch to Meilisearch/Kafka, mark as processed
4. **Idempotent** — Same entity can have multiple events; search index handles upserts

### Integration Plan

```ts
// src/infrastructure/outbox/outbox.service.ts
export class OutboxService {
  constructor(private db: Kysely<DB>) {}

  async record(entityType: EntityType, entityId: string, operation: Operation) {
    await this.db.insertInto('outbox_events')
      .values({ entity_type: entityType, entity_id: entityId, operation })
      .execute()
  }
}

// Usage in feature service
async updatePokemon(slug: string, data: UpdatePokemon) {
  await this.pokemonRepository.update(slug, data)
  await this.outboxService.record('form', slug, 'UPDATE')
}
```

### Poller Worker

The outbox poller runs as a standalone worker process, separate from the API server. Uses `FOR UPDATE SKIP LOCKED` for safe horizontal scaling.

**Run locally:**
```bash
bun run worker:outbox
```

**Config (env vars):**
- `OUTBOX_POLL_INTERVAL_MS` - Poll frequency (default: 60000ms)
- `OUTBOX_BATCH_SIZE` - Events per batch (default: 100)
- `OUTBOX_KAFKA_TOPIC` - Kafka topic (default: entity-events)

**Production deployment (docker-compose):**
```yaml
services:
  api:
    build: .
    command: bun run dev
    ports:
      - "3000:3000"

  outbox-worker:
    build: .
    command: bun run worker:outbox
    deploy:
      replicas: 2  # Scale independently
```

Benefits of standalone worker:
- Isolated from API server (crashes don't affect each other)
- `FOR UPDATE SKIP LOCKED` allows multiple workers without duplicate processing
- Can scale independently based on event volume

---

## Tech Stack

- **Runtime**: Bun
- **HTTP Framework**: Elysia
- **Database**: PostgreSQL
- **Query Builder**: Kysely
- **Migrations**: kysely-ctl
- **Type Generation**: kysely-codegen

## Kysely Reference

### kysely-ctl Configuration

The CLI is configured via `.config/kysely.config.ts`:

```ts
import { defineConfig } from "kysely-ctl";
import { config } from "../src/config";

export default defineConfig({
  dialect: "postgres",
  dialectConfig: {
    postgres: {
      host: "localhost",
      port: config.postgres.POSTGRES_PORT,
      user: config.postgres.POSTGRES_USER,
      password: config.postgres.POSTGRES_PASSWORD,
      database: config.postgres.POSTGRES_DB,
    },
  },
  migrations: {
    migrationFolder: "../src/infrastructure/db/migrations",
  },
});
```

### Migrations

**Commands:**
```bash
bun run migrate:make <name>   # Create new migration
bun run migrate:latest        # Run all pending migrations
bun run migrate:up            # Run next pending migration
bun run migrate:down          # Rollback last migration
bun run migrate:list          # List migration status
```

**Note:** Migration scripts use `bunx --bun` to ensure Bun runtime (required for `bun:sql` imports).

**Migration file structure:**
```ts
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("created_at", "text", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user").execute();
}
```

### Seeds

**Commands:**
```bash
bunx --bun kysely-ctl seed:make <name>      # Create new seed file
bunx --bun kysely-ctl seed:run              # Run all seed files
```

**Seed file structure:**
```ts
import { Kysely } from "kysely";

export async function seed(db: Kysely<any>): Promise<void> {
  await db
    .insertInto("user")
    .values([
      { email: "alice@example.com" },
      { email: "bob@example.com" },
    ])
    .execute();
}
```

### kysely-codegen

Generates TypeScript types from the database schema.

**Commands:**
```bash
bun run kysely-codegen                           # Generate types to default location
bun run kysely-codegen --out-file ./src/db.d.ts  # Custom output path
```

**Generated types example:**
```ts
import { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface User {
  id: Generated<number>;
  email: string;
  created_at: Generated<Timestamp>;
}

export interface DB {
  user: User;
}
```

**Using generated types:**
```ts
import { Kysely } from "kysely";
import { DB } from "./types";

const db = new Kysely<DB>({ dialect });

const users = await db.selectFrom("user").selectAll().execute();
// users is typed as User[]
```

### Workflow

1. Create migration using CLI: `bun run migrate:make add_users_table`
2. Edit the generated migration file in `src/infrastructure/db/migrations/`
3. Run migration: `bun run migrate:latest`
4. Regenerate types: `bun run kysely-codegen`

**Important:** Always create migration files using the CLI command, not manually. This ensures correct timestamps and file naming.
