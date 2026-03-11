import { db } from '../database/db.js';
import { hashPassword, verifyPassword } from '../auth/utils.js';
import { generateToken } from '../auth/auth.js';
import { AppError } from '../errors/AppError.js';

export class UsersService {

    /**
     * Registrar un usuario nuevo.
     */
    static async register({ email, username, password }) {
        // Verificar si el email ya existe
        const existingEmail = await db.selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        if (existingEmail) {
            throw new AppError('El email ya está registrado', 409);
        }

        // Verificar si el username ya existe
        const existingUsername = await db.selectFrom('users')
            .selectAll()
            .where('username', '=', username)
            .executeTakeFirst();

        if (existingUsername) {
            throw new AppError('El nombre de usuario ya está en uso', 409);
        }

        const passwordHash = await hashPassword(password);

        const result = await db
            .insertInto('users')
            .values({
                email,
                username,
                password_hash: passwordHash,
            })
            .returning(['id', 'email', 'username'])
            .executeTakeFirstOrThrow();

        return result;
    }

    /**
     * Iniciar sesión y devolver token + datos del usuario.
     */
    static async login({ email, password }) {
        const user = await db.selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst();

        if (!user) {
            throw new AppError('Credenciales inválidas', 401);
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            throw new AppError('Credenciales inválidas', 401);
        }

        const token = generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        };
    }

    /**
     * Obtener perfil del usuario autenticado con su balance calculado.
     */
    static async getProfile(userId) {
        const user = await db.selectFrom('users')
            .select(['id', 'username', 'email', 'created_at'])
            .where('id', '=', userId)
            .executeTakeFirst();

        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Calcular balance dinámicamente
        const balance = await UsersService.calculateBalance(userId);

        return { ...user, balance };
    }

    /**
     * Calcular el balance del usuario dinámicamente.
     * income suma, expense resta, transfer resta del general.
     */
    static async calculateBalance(userId) {
        const transactions = await db.selectFrom('transactions')
            .select(['amount', 'type'])
            .where('user_id', '=', userId)
            .execute();

        return transactions.reduce((total, tx) => {
            if (tx.type === 'income') return total + tx.amount;
            if (tx.type === 'expense') return total - tx.amount;
            if (tx.type === 'transfer') return total - tx.amount;
            return total;
        }, 0);
    }
}
