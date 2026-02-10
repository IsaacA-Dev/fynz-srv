import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'super_secret_key';
const EXPIRES_IN = '7d';

// Crear token
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

// Verificar token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware para proteger rutas
export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    reply.code(401);
    throw new Error('Token requerido');
  }

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);

  if (!decoded) {
    reply.code(401);
    throw new Error('Token inválido o expirado');
  }

  // Adjuntamos el usuario al request
  request.user = decoded;
}
