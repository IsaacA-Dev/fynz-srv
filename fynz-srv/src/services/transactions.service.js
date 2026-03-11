import { db } from '../database/db.js';
import { sql } from 'kysely';
import { AppError } from '../errors/AppError.js';

export class TransactionsService {

    /**
     * Crear una nueva transacción.
     * Valida que el pocket y la categoría existan y pertenezcan al usuario.
     */
    static async create(userId, { amount, description, type, pocket_id, category_id, date }) {
        // Validar que el pocket exista y pertenezca al usuario (si se envía)
        if (pocket_id) {
            const pocket = await db.selectFrom('pockets')
                .selectAll()
                .where('id', '=', pocket_id)
                .where('user_id', '=', userId)
                .executeTakeFirst();

            if (!pocket) {
                throw new AppError('Bolsillo no encontrado o no te pertenece', 404);
            }
        }

        // Validar que la categoría exista y sea accesible para el usuario
        if (category_id) {
            const category = await db.selectFrom('categories')
                .selectAll()
                .where('id', '=', category_id)
                .where((eb) =>
                    eb.or([
                        eb('is_default', '=', true),
                        eb('user_id', '=', userId),
                    ])
                )
                .executeTakeFirst();

            if (!category) {
                throw new AppError('Categoría no encontrada o no accesible', 404);
            }
        }

        // Si es transfer, pocket_id es obligatorio
        if (type === 'transfer' && !pocket_id) {
            throw new AppError('Las transferencias requieren un bolsillo destino (pocket_id)', 400);
        }

        const result = await db
            .insertInto('transactions')
            .values({
                amount,
                description: description || null,
                type,
                pocket_id: pocket_id || null,
                category_id: category_id || null,
                user_id: userId,
                date: date || undefined, // Si no se pasa, usa NOW()
            })
            .returning(['id', 'amount', 'description', 'type', 'pocket_id', 'category_id'])
            .executeTakeFirstOrThrow();

        return result;
    }

    /**
     * Obtener transacciones con filtros y paginación.
     */
    static async getAll(userId, filters = {}) {
        const { type, category_id, pocket_id, from, to, limit = 50, offset = 0 } = filters;

        let query = db.selectFrom('transactions')
            .selectAll()
            .where('user_id', '=', userId);

        if (type) {
            query = query.where('type', '=', type);
        }
        if (category_id) {
            query = query.where('category_id', '=', category_id);
        }
        if (pocket_id) {
            query = query.where('pocket_id', '=', pocket_id);
        }
        if (from) {
            query = query.where('date', '>=', from);
        }
        if (to) {
            query = query.where('date', '<=', to);
        }

        // Contar total para paginación
        const countResult = await db.selectFrom('transactions')
            .select(sql`COUNT(*)`.as('total'))
            .where('user_id', '=', userId)
            .executeTakeFirst();

        const transactions = await query
            .orderBy('date', 'desc')
            .limit(limit)
            .offset(offset)
            .execute();

        return {
            data: transactions,
            pagination: {
                total: countResult?.total || 0,
                limit,
                offset,
            },
        };
    }

    /**
     * Obtener una transacción por ID.
     */
    static async getById(userId, transactionId) {
        const transaction = await db.selectFrom('transactions')
            .selectAll()
            .where('id', '=', transactionId)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!transaction) {
            throw new AppError('Transacción no encontrada', 404);
        }

        return transaction;
    }

    /**
     * Eliminar una transacción.
     */
    static async delete(userId, transactionId) {
        const transaction = await db.selectFrom('transactions')
            .selectAll()
            .where('id', '=', transactionId)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!transaction) {
            throw new AppError('Transacción no encontrada', 404);
        }

        await db.deleteFrom('transactions')
            .where('id', '=', transactionId)
            .execute();

        return { message: 'Transacción eliminada' };
    }

    /**
     * Obtener resumen financiero del usuario.
     * Devuelve: total income, total expenses, balance, gasto por categoría.
     */
    static async getSummary(userId) {
        // Totales por tipo
        const totals = await db.selectFrom('transactions')
            .select([
                'type',
                sql`SUM(amount)`.as('total'),
            ])
            .where('user_id', '=', userId)
            .groupBy('type')
            .execute();

        const summary = {
            income: 0,
            expense: 0,
            transfer: 0,
            balance: 0,
        };

        totals.forEach(row => {
            summary[row.type] = row.total || 0;
        });
        summary.balance = summary.income - summary.expense - summary.transfer;

        // Gasto por categoría
        const byCategory = await db.selectFrom('transactions')
            .innerJoin('categories', 'categories.id', 'transactions.category_id')
            .select([
                'categories.name as category_name',
                'categories.icon as category_icon',
                'categories.color as category_color',
                sql`SUM(transactions.amount)`.as('total'),
            ])
            .where('transactions.user_id', '=', userId)
            .where('transactions.type', '=', 'expense')
            .groupBy(['categories.id', 'categories.name', 'categories.icon', 'categories.color'])
            .orderBy('total', 'desc')
            .execute();

        return {
            ...summary,
            expenses_by_category: byCategory,
        };
    }
}
