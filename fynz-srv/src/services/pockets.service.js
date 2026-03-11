import { db } from '../database/db.js';
import { sql } from 'kysely';
import { AppError } from '../errors/AppError.js';

export class PocketsService {

    /**
     * Obtener todos los bolsillos del usuario, con saldo calculado dinámicamente.
     */
    static async getAll(userId) {
        const pockets = await db.selectFrom('pockets')
            .selectAll()
            .where('user_id', '=', userId)
            .orderBy('created_at', 'desc')
            .execute();

        // Calcular saldo de cada pocket basado en sus transacciones
        const pocketsWithBalance = await Promise.all(
            pockets.map(async (pocket) => {
                const balance = await PocketsService.calculatePocketBalance(pocket.id);
                return {
                    ...pocket,
                    current_amount: balance,
                    progress: pocket.target_amount > 0
                        ? Math.min((balance / pocket.target_amount) * 100, 100)
                        : 0,
                };
            })
        );

        return pocketsWithBalance;
    }

    /**
     * Obtener un pocket por ID (validando pertenencia al usuario).
     */
    static async getById(userId, pocketId) {
        const pocket = await db.selectFrom('pockets')
            .selectAll()
            .where('id', '=', pocketId)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!pocket) {
            throw new AppError('Bolsillo no encontrado', 404);
        }

        const balance = await PocketsService.calculatePocketBalance(pocket.id);

        return {
            ...pocket,
            current_amount: balance,
            progress: pocket.target_amount > 0
                ? Math.min((balance / pocket.target_amount) * 100, 100)
                : 0,
        };
    }

    /**
     * Crear un nuevo bolsillo.
     */
    static async create(userId, { name, target_amount, color, icon }) {
        const result = await db
            .insertInto('pockets')
            .values({
                name,
                target_amount: target_amount || 0,
                color: color || '#3b82f6',
                icon: icon || null,
                user_id: userId,
            })
            .executeTakeFirst();

        return {
            id: Number(result.insertId),
            name,
            target_amount: target_amount || 0,
            color: color || '#3b82f6',
            icon: icon || null,
            current_amount: 0,
            progress: 0,
        };
    }

    /**
     * Actualizar un bolsillo existente.
     */
    static async update(userId, pocketId, data) {
        const pocket = await db.selectFrom('pockets')
            .selectAll()
            .where('id', '=', pocketId)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!pocket) {
            throw new AppError('Bolsillo no encontrado', 404);
        }

        await db.updateTable('pockets')
            .set(data)
            .where('id', '=', pocketId)
            .execute();

        return { id: pocketId, ...data };
    }

    /**
     * Eliminar un bolsillo (las transacciones asociadas quedan con pocket_id = NULL).
     */
    static async delete(userId, pocketId) {
        const pocket = await db.selectFrom('pockets')
            .selectAll()
            .where('id', '=', pocketId)
            .where('user_id', '=', userId)
            .executeTakeFirst();

        if (!pocket) {
            throw new AppError('Bolsillo no encontrado', 404);
        }

        await db.deleteFrom('pockets')
            .where('id', '=', pocketId)
            .execute();

        return { message: 'Bolsillo eliminado' };
    }

    /**
     * Calcular el saldo actual de un pocket sumando sus transfers.
     */
    static async calculatePocketBalance(pocketId) {
        const result = await db.selectFrom('transactions')
            .select(sql`COALESCE(SUM(amount), 0)`.as('total'))
            .where('pocket_id', '=', pocketId)
            .where('type', '=', 'transfer')
            .executeTakeFirst();

        return result?.total || 0;
    }
}
