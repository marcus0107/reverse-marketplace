const router = require('express').Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { issueToken, clearToken, requireAuth } = require('../auth');
const { sendMail } = require('../mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = ['Products', 'Services', 'Custom Work', 'Business'];

router.post('/signup', async (req, res) => {
  const { companyName, email, password, category, location } = req.body || {};
  if (!companyName || !String(companyName).trim()) return res.status(400).json({ error: 'Company name is required' });
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ error: 'Enter a valid email' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hash = await bcrypt.hash(password, 12);
    const [u] = await conn.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email.toLowerCase().trim(), hash]);
    await conn.query(
      `INSERT INTO companies (user_id, name, category, location, subscription_status, subscription_ends)
       VALUES (?, ?, ?, ?, 'trial', DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
      [u.insertId, String(companyName).trim().slice(0, 150), CATEGORIES.includes(category) ? category : 'Products', (location || 'Nairobi').slice(0, 100)]
    );
    await conn.commit();
    issueToken(res, { id: u.insertId });
    res.status(201).json({ ok: true });
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That email is already registered' });
    console.error(e);
    res.status(500).json({ error: 'Could not create account' });
  } finally {
    conn.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [String(email || '').toLowerCase().trim()]);
  const user = rows[0];
  const ok = user && await bcrypt.compare(String(password || ''), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Wrong email or password' });
  issueToken(res, user);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => { clearToken(res); res.json({ ok: true }); });

router.get('/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.email, u.is_admin AS isAdmin, c.id AS companyId, c.name FROM users u JOIN companies c ON c.user_id = u.id WHERE u.id = ?`, [req.uid]);
  if (!rows[0]) return res.status(401).json({ error: 'Account not found' });
  res.json(rows[0]);
});

// ---- Forgot / reset password ----
const sha256 = v => crypto.createHash('sha256').update(v).digest('hex');
const forgotLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

router.post('/forgot', forgotLimiter, async (req, res) => {
  // Same reply whether or not the email exists, so nobody can probe which emails are registered
  const reply = { ok: true, message: 'If that email is registered, a reset link has been sent.' };
  const email = String((req.body && req.body.email) || '').toLowerCase().trim();
  if (!EMAIL_RE.test(email)) return res.json(reply);
  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows[0]) {
      const token = crypto.randomBytes(32).toString('hex');
      await pool.query('DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL', [rows[0].id]);
      await pool.query(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
        [rows[0].id, sha256(token)]);
      const base = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
      const link = `${base}/reset-password?token=${token}`;
      await sendMail({
        to: email,
        subject: 'Reset your Reverse password',
        text: `Use this link to choose a new password (valid for 1 hour):\n${link}\n\nIf you did not ask for this, ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto"><h2>Reset your password</h2><p>Click the button to choose a new password. The link works for 1 hour.</p><p><a href="${link}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Choose a new password</a></p><p style="color:#9a95a8;font-size:12px">If you did not ask for this, you can ignore this email.</p></div>`
      });
    }
  } catch (e) { console.error('Forgot password error:', e.message); }
  res.json(reply);
});

router.post('/reset', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const [rows] = await pool.query(
    'SELECT id, user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()', [sha256(String(token))]);
  if (!rows[0]) return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });
  const hash = await bcrypt.hash(password, 12);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, rows[0].user_id]);
  await pool.query('UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [rows[0].user_id]);
  res.json({ ok: true });
});

module.exports = router;
