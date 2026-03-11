import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH || 'fynz.db';

const dialect = new SqliteDialect({
  database: new Database(DB_PATH),
});

export const db = new Kysely({
  dialect,
});
