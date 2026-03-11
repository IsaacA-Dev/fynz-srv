import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}