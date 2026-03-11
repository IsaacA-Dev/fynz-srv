import { db } from './db.js';
import { sql } from 'kysely';

export async function initDatabase() {
  // ─── 1. USERS ─────────────────────────────────────────────
  await db.schema.createTable('users').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('username', 'varchar', (col) => col.unique().notNull())
    .addColumn('email', 'varchar', (col) => col.unique().notNull())
    .addColumn('password_hash', 'varchar', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // ─── 2. CATEGORIES ────────────────────────────────────────
  // user_id nullable: null = categoría global del sistema
  await db.schema.createTable('categories').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('icon', 'varchar')
    .addColumn('color', 'varchar', (col) => col.defaultTo('#3b82f6'))
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade'))
    .addColumn('is_default', 'integer', (col) => col.defaultTo(0))
    .execute();

  // ─── 3. POCKETS (Bolsillos) ───────────────────────────────
  // current_amount ELIMINADO — se calcula con SUM(transactions)
  await db.schema.createTable('pockets').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('target_amount', 'real', (col) => col.defaultTo(0))
    .addColumn('color', 'varchar', (col) => col.defaultTo('#3b82f6'))
    .addColumn('icon', 'varchar')
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // ─── 4. TRANSACTIONS ─────────────────────────────────────
  await db.schema.createTable('transactions').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('amount', 'real', (col) => col.notNull())
    .addColumn('description', 'varchar')
    .addColumn('type', 'text', (col) =>
      col.notNull().check(sql`type IN ('income', 'expense', 'transfer')`)
    )
    .addColumn('pocket_id', 'integer', (col) => col.references('pockets.id').onDelete('set null'))
    .addColumn('category_id', 'integer', (col) => col.references('categories.id').onDelete('set null'))
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('date', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // ─── 5. RECURRING EXPENSES ────────────────────────────────
  await db.schema.createTable('recurring_expenses').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('amount', 'real', (col) => col.notNull())
    .addColumn('frequency', 'text', (col) =>
      col.notNull().check(sql`frequency IN ('daily', 'weekly', 'biweekly', 'monthly')`)
    )
    .addColumn('category_id', 'integer', (col) => col.references('categories.id').onDelete('set null'))
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('is_active', 'integer', (col) => col.defaultTo(1))
    .addColumn('next_due_date', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // ─── 6. BUDGETS ───────────────────────────────────────────
  await db.schema.createTable('budgets').ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('limit_amount', 'real', (col) => col.notNull())
    .addColumn('period', 'text', (col) =>
      col.notNull().check(sql`period IN ('weekly', 'biweekly', 'monthly')`)
    )
    .addColumn('category_id', 'integer', (col) => col.references('categories.id').onDelete('set null'))
    .addColumn('user_id', 'integer', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('start_date', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // ─── SEED: Categorías por defecto ─────────────────────────
  const existingCategories = await db.selectFrom('categories')
    .selectAll()
    .where('is_default', '=', 1)
    .execute();

  if (existingCategories.length === 0) {
    const defaultCategories = [
      { name: 'Alimentación', icon: '🍔', color: '#ef4444', is_default: 1 },
      { name: 'Transporte', icon: '🚗', color: '#f59e0b', is_default: 1 },
      { name: 'Entretenimiento', icon: '🎬', color: '#8b5cf6', is_default: 1 },
      { name: 'Salud', icon: '💊', color: '#10b981', is_default: 1 },
      { name: 'Educación', icon: '📚', color: '#3b82f6', is_default: 1 },
      { name: 'Hogar', icon: '🏠', color: '#6366f1', is_default: 1 },
      { name: 'Servicios', icon: '📱', color: '#ec4899', is_default: 1 },
      { name: 'Personal', icon: '👤', color: '#14b8a6', is_default: 1 },
      { name: 'Inversión', icon: '📈', color: '#22c55e', is_default: 1 },
      { name: 'Otros', icon: '📦', color: '#64748b', is_default: 1 },
    ];

    await db.insertInto('categories')
      .values(defaultCategories)
      .execute();

    console.log('📦 Categorías por defecto insertadas');
  }

  console.log('✅ Base de datos Fynz inicializada correctamente');
}