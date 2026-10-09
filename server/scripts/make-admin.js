// Usage: node scripts/make-admin.js your-email@example.com   (add "remove" at the end to undo)
require('dotenv').config();
const pool = require('../src/db');
(async () => {
  const [email, flag] = process.argv.slice(2);
  if (!email) { console.error('Usage: node scripts/make-admin.js your-email@example.com [remove]'); process.exit(1); }
  const [r] = await pool.query('UPDATE users SET is_admin = ? WHERE email = ?', [flag === 'remove' ? 0 : 1, email.toLowerCase().trim()]);
  console.log(r.affectedRows ? (flag === 'remove' ? 'Admin access removed.' : 'Done. That account is now an admin.') : 'No account found with that email.');
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
