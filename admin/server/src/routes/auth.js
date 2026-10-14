const router = require('express').Router();
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { issueToken, clearToken, requireAdmin } = require('../auth');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many attempts. Try again in 15 minutes.' } });
// Compared when the email is unknown, so response time does not reveal which emails exist
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.query('SELECT id, password_hash FROM admins WHERE email = ?', [String(email || '').toLowerCase().trim()]);
  const admin = rows[0];
  const ok = await bcrypt.compare(String(password || ''), admin ? admin.password_hash : DUMMY_HASH);
  if (!admin || !ok) return res.status(401).json({ error: 'Wrong email or password' });
  issueToken(res, admin);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => { clearToken(res); res.json({ ok: true }); });

router.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));

module.exports = router;
