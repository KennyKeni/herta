import { config } from  "../../config"
import { SQL } from "bun"
import { PostgresJSDialect } from "kysely-postgres-js"
import { DB } from "./types"
import { Kysely } from "kysely"

const dialect = new PostgresJSDialect({
  postgres: new SQL({
    database: config.postgres.POSTGRES_DB,
    host: config.postgres.POSTGRES_HOST,
    port: config.postgres.POSTGRES_PORT,
    user: config.postgres.POSTGRES_USER,
    password: config.postgres.POSTGRES_PASSWORD,
    max: 10,
  }),
})

export const db = new Kysely<DB>({
  dialect,
})
