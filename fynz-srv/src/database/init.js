import { db } from './db.js';

export async function initDatabase() {
  // 1. Usuarios
  await db.schema.createTable('users').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey()) // Removí .autoincrement()
    .addColumn('username', 'varchar', (col) => col.unique().notNull())
    .addColumn('email', 'varchar', (col) => col.unique().notNull())
    .addColumn('password_hash', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
    .execute();

  // 2. Categorías
  await db.schema.createTable('categories').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey()) // Removí .autoincrement()
    .addColumn('name', 'varchar', (col) => col.notNull())
    .execute();

  // 3. Bolsillos (Savings Pockets)
  await db.schema.createTable('pockets').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey()) // Removí .autoincrement()
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('user_id', 'integer', (col) => col.references('users.id'))
    .execute();

  // 4. Transacciones
  await db.schema.createTable('transactions').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey()) // Removí .autoincrement()
    .addColumn('amount', 'real', (col) => col.notNull())
    .addColumn('type', 'varchar', (col) => col.notNull()) 
    .addColumn('pocket_id', 'integer', (col) => col.references('pockets.id')) 
    .addColumn('category_id', 'integer', (col) => col.references('categories.id'))
    .addColumn('user_id', 'integer', (col) => col.references('users.id'))
    .addColumn('date', 'timestamp', (col) => col.defaultTo('CURRENT_TIMESTAMP'))
    .execute();

  console.log('✅ Base de datos inicializada correctamente');
}