const router = require('express').Router();
const crypto = require('crypto');
const pool = require('../db');
const { scoreMatch, MIN_SCORE } = require('../matching');
const { notifyLeads } = require('../mailer');

const CATEGORIES = ['Products', 'Services', 'Custom Work', 'Business'];

const publicCompany = `c.id, c.name, c.category, c.location, c.description, c.price, c.rating, c.image_url AS image, c.delivery`;

router.post('/', async (req, res) => {
  const b = req.body || {};
  const title = String(b.title || '').trim();
  const description = String(b.description || '').trim();
  const buyerName = String(b.buyerName || '').trim();
  const budget = parseInt(b.budget, 10);
  const email = String(b.buyerEmail || '').trim();
  const phone = String(b.buyerPhone || '').trim();

  if (!title || !description || !buyerName) return res.status(400).json({ error: 'Name, title and description are required' });
  if (!budget || budget < 1) return res.status(400).json({ error: 'Enter a valid budget' });
  if (!email && !phone) return res.status(400).json({ error: 'Add an email or phone so sellers can reach you' });
  if (!CATEGORIES.includes(b.category)) return res.status(400).json({ error: 'Invalid category' });

  const request = {
    title: title.slice(0, 200), description: description.slice(0, 4000), budget,
    category: b.category, location: String(b.location || 'Any').trim().slice(0, 100) || 'Any'
  };
  const token = crypto.randomBytes(16).toString('hex');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `INSERT INTO requests (public_token, buyer_name, buyer_email, buyer_phone, title, category, budget, deadline, location, description)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [token, buyerName.slice(0, 120), email.slice(0, 255) || null, phone.slice(0, 30) || null, request.title,
       request.category, budget, String(b.deadline || 'Flexible').slice(0, 40), request.location, request.description]);

    const [companies] = await conn.query(
      `SELECT c.id, c.name, c.category, c.location, c.description, c.tags, c.price, u.email
       FROM companies c JOIN users u ON u.id = c.user_id
       WHERE c.suspended = 0 AND c.subscription_status IN ('trial','active') AND (c.subscription_ends IS NULL OR c.subscription_ends >= CURDATE())`);

    const matches = companies
      .map(c => ({ companyId: c.id, score: scoreMatch(request, c), company: c }))
      .filter(m => m.score >= MIN_SCORE);

    for (const m of matches) {
      await conn.query('INSERT INTO matches (request_id, company_id, score) VALUES (?,?,?)', [r.insertId, m.companyId, m.score]);
    }
    await conn.commit();
    res.status(201).json({ token, matched: matches.length });
    // Email matched companies in the background; the buyer does not wait for this
    notifyLeads({ ...request, deadline: String(b.deadline || 'Flexible').slice(0, 40) }, matches)
      .catch(e => console.error('Lead emails failed:', e.message));
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Could not save request' });
  } finally {
    conn.release();
  }
});

// Buyer view: the token acts as the secret link to their own request
router.get('/:token', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, title, category, budget, deadline, location, description FROM requests WHERE public_token = ?', [req.params.token]);
  if (!rows[0]) return res.status(404).json({ error: 'Request not found' });
  const [matches] = await pool.query(
    `SELECT m.score, ${publicCompany} FROM matches m JOIN companies c ON c.id = m.company_id
     WHERE m.request_id = ? AND c.suspended = 0 ORDER BY m.score DESC, c.rating DESC`, [rows[0].id]);
  const { id, ...request } = rows[0];
  res.json({ request, matches });
});

module.exports = router;
