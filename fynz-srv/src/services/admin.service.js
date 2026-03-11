import { db } from '../database/db.js';
import { AppError } from '../errors/AppError.js';

export class AdminService {
    /**
     * Listar todos los usuarios del sistema.
     */
    static async listUsers() {
        const users = await db.selectFrom('users')
            .select(['id', 'username', 'email', 'role', 'created_at'])
            .execute();
        
        return users;
    }

    /**
     * Cambiar el rol de un usuario.
     */
    static async updateUserRole(userId, newRole) {
        if (!['user', 'admin'].includes(newRole)) {
            throw new AppError('Rol no válido', 400);
        }

        const user = await db.updateTable('users')
            .set({ role: newRole, updated_at: new Date() })
            .where('id', '=', userId)
            .returning(['id', 'username', 'email', 'role'])
            .executeTakeFirst();

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return user;
    }

    /**
     * Eliminar un usuario (CUIDADO: Borrado en cascada configurado).
     */
    static async deleteUser(userId) {
        const result = await db.deleteFrom('users')
            .where('id', '=', userId)
            .executeTakeFirst();

        if (Number(result.numDeletedRows) === 0) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return { success: true, message: 'Usuario eliminado correctamente' };
    }
}
