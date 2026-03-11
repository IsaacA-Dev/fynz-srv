import jwt from 'jsonwebtoken';

/**
 * Generar un JWT token para el usuario.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

/**
 * Verificar un JWT token.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware de autenticación para Fastify.
 * Extrae el token del header Authorization y lo verifica.
 */
export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      success: false,
      message: 'Acceso denegado. Token requerido (Bearer <token>)',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return reply.code(401).send({
      success: false,
      message: 'Token inválido o expirado',
    });
  }

  request.user = decoded;
}
