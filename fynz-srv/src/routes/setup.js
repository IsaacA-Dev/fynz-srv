import { db } from '../database/db.js';
import { generateToken, authMiddleware } from '../auth/auth.js';

export async function setupRoutes(fastify) {

  // =========================
  // USERS
  // =========================

  // Crear usuario (público)
  fastify.post('/users', async (request, reply) => {
    const { email, password } = request.body;

    const result = await db
      .insertInto('users')
      .values({
        email,
        password_hash: password
      })
      .executeTakeFirst();

    return { message: 'Usuario creado', id: Number(result.insertId) };
  });

  // Login (público)
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user || user.password_hash !== password) {
      reply.code(401);
      return { message: 'Credenciales inválidas' };
    }

    const token = generateToken(user);

    return {
      message: 'Login correcto',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    };
  });

  // =========================
  // TODAS LAS RUTAS PROTEGIDAS
  // =========================

  // Listar usuarios
  fastify.get('/users', { preHandler: authMiddleware }, async () => {
    return await db.selectFrom('users').selectAll().execute();
  });

  // =========================
  // CATEGORIES
  // =========================

  fastify.post('/categories', { preHandler: authMiddleware }, async (request) => {
    const { name } = request.body;

    const result = await db
      .insertInto('categories')
      .values({ name })
      .executeTakeFirst();

    return { message: 'Categoría creada', id: Number(result.insertId) };
  });

  fastify.get('/categories', { preHandler: authMiddleware }, async () => {
    return await db.selectFrom('categories').selectAll().execute();
  });

  // =========================
  // POCKETS
  // =========================

  fastify.post('/pockets', { preHandler: authMiddleware }, async (request) => {
    const { name } = request.body;

    const result = await db
      .insertInto('pockets')
      .values({
        name,
        user_id: request.user.id
      })
      .executeTakeFirst();

    return { message: 'Bolsillo creado', id: Number(result.insertId) };
  });

  fastify.get('/pockets', { preHandler: authMiddleware }, async (request) => {
    return await db
      .selectFrom('pockets')
      .selectAll()
      .where('user_id', '=', request.user.id)
      .execute();
  });

  fastify.get('/users/:userId/pockets', { preHandler: authMiddleware }, async (request) => {
    const { userId } = request.params;

    return await db
      .selectFrom('pockets')
      .selectAll()
      .where('user_id', '=', Number(userId))
      .execute();
  });

  // =========================
  // TRANSACTIONS
  // =========================

  fastify.post('/transactions', { preHandler: authMiddleware }, async (request) => {
    const { amount, type, pocketId, categoryId, date } = request.body;

    const result = await db
      .insertInto('transactions')
      .values({
        amount,
        type,
        pocket_id: pocketId,
        category_id: categoryId,
        user_id: request.user.id,
        date: date ?? undefined
      })
      .executeTakeFirst();

    return { message: 'Transacción creada', id: Number(result.insertId) };
  });

  fastify.get('/transactions', { preHandler: authMiddleware }, async (request) => {
    return await db
      .selectFrom('transactions')
      .selectAll()
      .where('user_id', '=', request.user.id)
      .execute();
  });

  fastify.get('/users/:userId/transactions', { preHandler: authMiddleware }, async (request) => {
    const { userId } = request.params;

    return await db
      .selectFrom('transactions')
      .selectAll()
      .where('user_id', '=', Number(userId))
      .execute();
  });

  fastify.get('/pockets/:pocketId/transactions', { preHandler: authMiddleware }, async (request) => {
    const { pocketId } = request.params;

    return await db
      .selectFrom('transactions')
      .selectAll()
      .where('pocket_id', '=', Number(pocketId))
      .where('user_id', '=', request.user.id)
      .execute();
  });

  fastify.get('/categories/:categoryId/transactions', { preHandler: authMiddleware }, async (request) => {
    const { categoryId } = request.params;

    return await db
      .selectFrom('transactions')
      .selectAll()
      .where('category_id', '=', Number(categoryId))
      .where('user_id', '=', request.user.id)
      .execute();
  });
}
