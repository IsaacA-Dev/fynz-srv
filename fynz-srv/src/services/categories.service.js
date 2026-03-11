import { db } from '../database/db.js';
import { AppError } from '../errors/AppError.js';

export class CategoriesService {

    /**
     * Obtener todas las categorías visibles para el usuario:
     * - Categorías globales (is_default = 1)
     * - Categorías personalizadas del usuario (user_id = userId)
     */
    static async getAll(userId) {
        return await db.selectFrom('categories')
            .selectAll()
            .where((eb) =>
                eb.or([
                    eb('is_default', '=', 1),
                    eb('user_id', '=', userId),
                ])
            )
            .orderBy('name', 'asc')
            .execute();
    }

    /**
     * Crear una categoría personalizada del usuario.
     */
    static async create(userId, { name, icon, color }) {
        // Verificar que no exista ya una con el mismo nombre para el usuario
        const existing = await db.selectFrom('categories')
            .selectAll()
            .where((eb) =>
                eb.and([
                    eb('name', '=', name),
                    eb.or([
                        eb('user_id', '=', userId),
                        eb('is_default', '=', 1),
                    ]),
                ])
            )
            .executeTakeFirst();

        if (existing) {
            throw new AppError('Ya existe una categoría con ese nombre', 409);
        }

        const result = await db
            .insertInto('categories')
            .values({
                name,
                icon: icon || null,
                color: color || '#3b82f6',
                user_id: userId,
                is_default: 0,
            })
            .executeTakeFirst();

        return {
            id: Number(result.insertId),
            name,
            icon: icon || null,
            color: color || '#3b82f6',
        };
    }

    /**
     * Actualizar una categoría personalizada del usuario.
     * No permite editar categorías del sistema (is_default = 1).
     */
    static async update(userId, categoryId, data) {
        const category = await db.selectFrom('categories')
            .selectAll()
            .where('id', '=', categoryId)
            .executeTakeFirst();

        if (!category) {
            throw new AppError('Categoría no encontrada', 404);
        }

        if (category.is_default === 1) {
            throw new AppError('No puedes editar categorías del sistema', 403);
        }

        if (category.user_id !== userId) {
            throw new AppError('No tienes permiso para editar esta categoría', 403);
        }

        await db.updateTable('categories')
            .set(data)
            .where('id', '=', categoryId)
            .execute();

        return { id: categoryId, ...data };
    }

    /**
     * Eliminar una categoría personalizada.
     */
    static async delete(userId, categoryId) {
        const category = await db.selectFrom('categories')
            .selectAll()
            .where('id', '=', categoryId)
            .executeTakeFirst();

        if (!category) {
            throw new AppError('Categoría no encontrada', 404);
        }

        if (category.is_default === 1) {
            throw new AppError('No puedes eliminar categorías del sistema', 403);
        }

        if (category.user_id !== userId) {
            throw new AppError('No tienes permiso para eliminar esta categoría', 403);
        }

        await db.deleteFrom('categories')
            .where('id', '=', categoryId)
            .execute();

        return { message: 'Categoría eliminada' };
    }
}
