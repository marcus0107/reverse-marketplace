const router = require('express').Router();
const pool = require('../db');
const { requireAuth } = require('../auth');
const { words } = require('../matching');

const CATEGORIES = ['Products', 'Services', 'Custom Work', 'Business'];
const STATUSES = ['new', 'contacted', 'won', 'lost'];

const isActive = c => !c.suspended && ['trial', 'active'].includes(c.subscription_status) &&
  (!c.subscription_ends || new Date(c.subscription_ends) >= new Date(new Date().toDateString()));

// ---- Company dashboard (auth) ----
router.get('/me/dashboard', requireAuth, async (req, res) => {
  const [cs] = await pool.query('SELECT * FROM companies WHERE user_id = ?', [req.uid]);
  const company = cs[0];
  if (!company) return res.status(404).json({ error: 'Company not found' });
  const active = isActive(company);

  const [leads] = await pool.query(
    `SELECT m.id, m.score, m.status, m.created_at, r.title, r.category, r.budget, r.deadline, r.location, r.description,
            r.buyer_name, r.buyer_email, r.buyer_phone
     FROM matches m JOIN requests r ON r.id = m.request_id
     WHERE m.company_id = ? ORDER BY m.created_at DESC LIMIT 100`, [company.id]);

  // Buyer contact details are only revealed while the subscription is active
  const safeLeads = leads.map(l => active ? l : { ...l, buyer_name: null, buyer_email: null, buyer_phone: null });

  const week = Date.now() - 7 * 24 * 3600 * 1000;
  const total = leads.length;
  const stats = {
    newThisWeek: leads.filter(l => new Date(l.created_at).getTime() >= week).length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    won: leads.filter(l => l.status === 'won').length,
    avgFit: total ? Math.round(leads.reduce((s, l) => s + l.score, 0) / total) : 0,
    conversion: total ? Math.round((leads.filter(l => l.status === 'won').length / total) * 100) : 0
  };

  res.json({
    company: {
      id: company.id, name: company.name, category: company.category, location: company.location,
      description: company.description, price: company.price, delivery: company.delivery,
      condition: company.item_condition, subscriptionStatus: company.subscription_status,
      subscriptionEnds: company.subscription_ends, subscriptionActive: active
    },
    stats, leads: safeLeads
  });
});

// Edit listing (submit-offer.html)
router.put('/me', requireAuth, async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  const description = String(b.description || '').trim();
  const price = parseInt(b.price, 10);
  const category = CATEGORIES.includes(b.category) ? b.category : 'Products';
  if (!name || !description || !price || price < 1) return res.status(400).json({ error: 'Name, price and description are required' });

  const tags = [...new Set(words(`${description} ${name}`))].slice(0, 60).join(' ');
  await pool.query(
    `UPDATE companies SET name=?, category=?, location=?, price=?, delivery=?, item_condition=?, description=?, tags=? WHERE user_id=?`,
    [name.slice(0, 150), category, String(b.location || 'Nairobi').slice(0, 100), price,
     String(b.delivery || '3-5 days').slice(0, 50), String(b.condition || 'New').slice(0, 50),
     description.slice(0, 4000), tags, req.uid]);
  res.json({ ok: true });
});

router.patch('/me/leads/:id', requireAuth, async (req, res) => {
  if (!STATUSES.includes(req.body && req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  const [r] = await pool.query(
    `UPDATE matches m JOIN companies c ON c.id = m.company_id SET m.status = ? WHERE m.id = ? AND c.user_id = ?`,
    [req.body.status, req.params.id, req.uid]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Lead not found' });
  res.json({ ok: true });
});

// ---- Public company profile (offer.html) ----
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, category, location, description, price, delivery, item_condition AS \`condition\`, rating, image_url AS image
     FROM companies WHERE id = ?`, [parseInt(req.params.id, 10) || 0]);
  if (!rows[0]) return res.status(404).json({ error: 'Company not found' });
  let score = null;
  if (req.query.r) {
    const [m] = await pool.query(
      `SELECT m.score FROM matches m JOIN requests r ON r.id = m.request_id WHERE r.public_token = ? AND m.company_id = ?`,
      [String(req.query.r), rows[0].id]);
    score = m[0] ? m[0].score : null;
  }
  res.json({ ...rows[0], score });
});

module.exports = router;
