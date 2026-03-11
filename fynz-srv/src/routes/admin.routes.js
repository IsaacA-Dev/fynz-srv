import { AdminService } from '../services/admin.service.js';
import { authMiddleware, adminMiddleware } from '../auth/auth.js';

export async function adminRoutes(fastify) {
    // ─── MIDDLEWARE GLOBAL DE RUTA ───────────────────────────
    // Todas las rutas de este archivo requieren ser Admin
    fastify.addHook('preHandler', authMiddleware);
    fastify.addHook('preHandler', adminMiddleware);

    /**
     * GET /api/admin/users
     * Listar todos los usuarios.
     */
    fastify.get('/users', async () => {
        return {
            success: true,
            data: await AdminService.listUsers(),
        };
    });

    /**
     * PUT /api/admin/users/:id/role
     * Cambiar rol de un usuario.
     */
    fastify.put('/users/:id/role', async (request) => {
        const { id } = request.params;
        const { role } = request.body;

        return {
            success: true,
            message: 'Rol actualizado',
            data: await AdminService.updateUserRole(Number(id), role),
        };
    });

    /**
     * DELETE /api/admin/users/:id
     * Eliminar usuario.
     */
    fastify.delete('/users/:id', async (request) => {
        const { id } = request.params;
        return await AdminService.deleteUser(Number(id));
    });
}
