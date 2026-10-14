const jwt = require('jsonwebtoken');
const pool = require('./db');

if (!process.env.ADMIN_JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_JWT_SECRET must be set in production');
}
const SECRET = process.env.ADMIN_JWT_SECRET || 'dev-only-admin-secret';
const COOKIE = 'reverse_admin_token';
const EIGHT_HOURS = 8 * 3600;

function issueToken(res, admin) {
  const token = jwt.sign({ aid: admin.id }, SECRET, { expiresIn: EIGHT_HOURS });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: EIGHT_HOURS * 1000
  });
}

function clearToken(res) { res.clearCookie(COOKIE); }

// Also checks the admin still exists, so deleting an admin ends their access immediately
async function requireAdmin(req, res, next) {
  let aid;
  try { aid = jwt.verify(req.cookies[COOKIE] || '', SECRET).aid; } catch { return res.status(401).json({ error: 'Please log in' }); }
  const [rows] = await pool.query('SELECT id, email FROM admins WHERE id = ?', [aid]);
  if (!rows[0]) return res.status(401).json({ error: 'Please log in' });
  req.admin = rows[0];
  next();
}

module.exports = { issueToken, clearToken, requireAdmin };
