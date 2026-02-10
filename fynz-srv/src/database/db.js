import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';

const dialect = new SqliteDialect({
  database: new Database('fynz.db'),
});

export const db = new Kysely({
  dialect,
});
