import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

const { Pool } = pg;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
});

export const db = new Kysely({
  dialect,
});
