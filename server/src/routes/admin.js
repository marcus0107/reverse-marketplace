const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../auth');

const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

async function requireAdmin(req, res, next) {
  const [r] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [req.uid]);
  if (!r[0] || !r[0].is_admin) return res.status(403).json({ error: 'Admins only' });
  next();
}
router.use(requireAuth, wrap(requireAdmin));

router.get('/overview', wrap(async (req, res) => {
  const one = async (sql) => (await pool.query(sql))[0][0];
  const companies = await one(`SELECT COUNT(*) AS total,
      SUM(suspended = 0 AND subscription_status = 'active' AND (subscription_ends IS NULL OR subscription_ends >= CURDATE())) AS active,
      SUM(suspended = 0 AND subscription_status = 'trial' AND (subscription_ends IS NULL OR subscription_ends >= CURDATE())) AS trial,
      SUM(suspended = 1) AS suspended FROM companies`);
  const requests = await one('SELECT COUNT(*) AS total FROM requests');
  const matches = await one('SELECT COUNT(*) AS total FROM matches');
  const revenue = await one(`SELECT COALESCE(SUM(amount),0) AS total,
      COALESCE(SUM(CASE WHEN paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN amount END),0) AS month,
      COUNT(*) AS payments FROM payments WHERE status = 'success'`);
  const pending = await one("SELECT COUNT(*) AS total FROM payments WHERE status = 'pending'");
  res.json({
    companies: Number(companies.total), active: Number(companies.active || 0), trial: Number(companies.trial || 0), suspended: Number(companies.suspended || 0),
    requests: requests.total, matches: matches.total,
    revenueTotal: Number(revenue.total), revenueMonth: Number(revenue.month), paymentsCount: revenue.payments, pendingPayments: pending.total
  });
}));

router.get('/companies', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.category, c.location, c.subscription_status AS status, c.subscription_ends AS ends, c.suspended, c.created_at,
            u.email, (SELECT COUNT(*) FROM matches m WHERE m.company_id = c.id) AS leads
     FROM companies c JOIN users u ON u.id = c.user_id ORDER BY c.id DESC LIMIT 200`);
  res.json(rows);
}));

router.patch('/companies/:id', wrap(async (req, res) => {
  const id = parseInt(req.params.id, 10) || 0;
  const { addDays, suspended } = req.body || {};
  const [exists] = await pool.query('SELECT id FROM companies WHERE id = ?', [id]);
  if (!exists[0]) return res.status(404).json({ error: 'Company not found' });

  if (addDays !== undefined) {
    const days = parseInt(addDays, 10);
    if (!days || days < 1 || days > 365) return res.status(400).json({ error: 'Days must be between 1 and 365' });
    await pool.query(
      `UPDATE companies SET subscription_status = 'active',
         subscription_ends = DATE_ADD(GREATEST(COALESCE(subscription_ends, CURDATE()), CURDATE()), INTERVAL ? DAY) WHERE id = ?`, [days, id]);
  }
  if (suspended !== undefined) {
    await pool.query('UPDATE companies SET suspended = ? WHERE id = ?', [suspended ? 1 : 0, id]);
  }
  res.json({ ok: true });
}));

router.get('/payments', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.plan, p.amount, p.status, p.mpesa_receipt AS receipt, p.result_desc AS note, p.created_at,
            CONCAT('****', RIGHT(p.phone, 4)) AS phone, c.name AS company
     FROM payments p JOIN companies c ON c.id = p.company_id ORDER BY p.id DESC LIMIT 100`);
  res.json(rows);
}));

router.get('/requests', wrap(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.title, r.category, r.budget, r.location, r.created_at,
            (SELECT COUNT(*) FROM matches m WHERE m.request_id = r.id) AS matches
     FROM requests r ORDER BY r.id DESC LIMIT 100`);
  res.json(rows);
}));

module.exports = router;
