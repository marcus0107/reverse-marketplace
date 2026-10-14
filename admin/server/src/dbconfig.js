require('dotenv').config();

// Hosted databases (Aiven, etc.) use their own port and require an encrypted connection.
// DB_SSL_CA = the provider's CA certificate text (best). DB_SSL=true = encrypt without checking the certificate.
function sslOption() {
  if (process.env.DB_SSL_CA) return { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n') };
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  return undefined;
}

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  ssl: sslOption()
};
