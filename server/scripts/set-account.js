// DEV helper: change an account's email and password.
// Usage: node scripts/set-account.js "old-email" "new-email" "new-password"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

if (process.env.NODE_ENV === 'production') { console.error('Refusing to run in production.'); process.exit(1); }

(async () => {
  const [oldEmail, newEmail, newPassword] = process.argv.slice(2);
  if (!oldEmail || !newEmail || !newPassword) {
    console.error('Usage: node scripts/set-account.js "old-email" "new-email" "new-password"');
    process.exit(1);
  }
  if (newPassword.length < 8) { console.error('Password must be at least 8 characters.'); process.exit(1); }
  const hash = await bcrypt.hash(newPassword, 12);
  const [r] = await pool.query('UPDATE users SET email = ?, password_hash = ? WHERE email = ?',
    [newEmail.toLowerCase().trim(), hash, oldEmail.toLowerCase().trim()]);
  console.log(r.affectedRows ? `Done. Log in with ${newEmail.toLowerCase().trim()} and your new password.` : 'No account found with that old email.');
  await pool.end();
})().catch(e => { console.error(e.code === 'ER_DUP_ENTRY' ? 'That new email is already used by another account.' : e.message); process.exit(1); });
