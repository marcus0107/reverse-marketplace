// Usage: node scripts/create-admin.js admin@example.com "a-long-password"
// Creates the admin, or changes the password if that email already exists.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

(async () => {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) { console.error('Usage: node scripts/create-admin.js <email> "<password>"'); process.exit(1); }
  if (password.length < 12) { console.error('Use a password of at least 12 characters.'); process.exit(1); }
  await pool.query(`CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
    [email.toLowerCase().trim(), hash]);
  console.log(`Done. ${email.toLowerCase().trim()} can now log in to the admin site.`);
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
