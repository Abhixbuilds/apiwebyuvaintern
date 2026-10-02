require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  dbPath: process.env.DB_PATH || './data/dsa-log.db',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
