const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../auth');
const { PLANS, listPlans } = require('../plans');
const mpesa = require('../mpesa');

const paymentsRouter = express.Router();
const mpesaRouter = express.Router();

// Marks a pending payment as success/failed once. Extends the subscription only on the first success.
async function settle(payment, ok, description, receipt) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      `UPDATE payments SET status = ?, result_desc = ?, mpesa_receipt = ?, paid_at = IF(?, NOW(), NULL)
       WHERE id = ? AND status = 'pending'`,
      [ok ? 'success' : 'failed', String(description || '').slice(0, 255), receipt || null, ok ? 1 : 0, payment.id]);
    if (r.affectedRows && ok) {
      await conn.query(
        `UPDATE companies SET subscription_status = 'active',
           subscription_ends = DATE_ADD(GREATEST(COALESCE(subscription_ends, CURDATE()), CURDATE()), INTERVAL ? DAY)
         WHERE id = ?`, [PLANS[payment.plan].days, payment.company_id]);
    }
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

paymentsRouter.get('/plans', (req, res) => res.json(listPlans()));

paymentsRouter.post('/stk', requireAuth, async (req, res) => {
  const plan = PLANS[req.body && req.body.plan];
  if (!plan) return res.status(400).json({ error: 'Choose a plan' });
  const phone = mpesa.normalizePhone(req.body.phone);
  if (!phone) return res.status(400).json({ error: 'Enter a valid Safaricom number, e.g. 0712345678' });

  const [cs] = await pool.query('SELECT id FROM companies WHERE user_id = ?', [req.uid]);
  if (!cs[0]) return res.status(404).json({ error: 'Company not found' });

  const [ins] = await pool.query(
    'INSERT INTO payments (company_id, plan, amount, phone) VALUES (?,?,?,?)', [cs[0].id, req.body.plan, plan.amount, phone]);
  try {
    const { checkoutRequestId, merchantRequestId } = await mpesa.stkPush({
      phone, amount: plan.amount, reference: 'Reverse', description: 'Reverse plan'
    });
    await pool.query('UPDATE payments SET checkout_request_id = ?, merchant_request_id = ? WHERE id = ?',
      [checkoutRequestId, merchantRequestId, ins.insertId]);
    res.status(201).json({ paymentId: ins.insertId });
  } catch (e) {
    console.error('STK push failed:', e.message);
    await pool.query("UPDATE payments SET status = 'failed', result_desc = ? WHERE id = ?", [e.message.slice(0, 255), ins.insertId]);
    res.status(502).json({ error: e.message });
  }
});

paymentsRouter.get('/mine', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.plan, p.amount, p.status, p.mpesa_receipt, p.created_at FROM payments p
     JOIN companies c ON c.id = p.company_id WHERE c.user_id = ? ORDER BY p.id DESC LIMIT 20`, [req.uid]);
  res.json(rows);
});

paymentsRouter.get('/:id/status', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.* FROM payments p JOIN companies c ON c.id = p.company_id WHERE p.id = ? AND c.user_id = ?`,
    [parseInt(req.params.id, 10) || 0, req.uid]);
  let p = rows[0];
  if (!p) return res.status(404).json({ error: 'Payment not found' });

  // If the callback has not arrived after a few seconds, ask Safaricom directly
  if (p.status === 'pending' && p.checkout_request_id && Date.now() - new Date(p.created_at).getTime() > 8000) {
    try {
      const q = await mpesa.stkQuery(p.checkout_request_id);
      if (q.done) {
        await settle(p, q.success, q.description, null);
        [p] = (await pool.query('SELECT * FROM payments WHERE id = ?', [p.id]))[0];
      }
    } catch (e) { console.error('STK query failed:', e.message); }
  }
  res.json({ status: p.status, message: p.result_desc, receipt: p.mpesa_receipt });
});

// Safaricom posts the payment result here
mpesaRouter.post('/callback/:secret', async (req, res) => {
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  if (req.params.secret !== mpesa.callbackSecret()) return;
  try {
    const cb = req.body && req.body.Body && req.body.Body.stkCallback;
    if (!cb) return;
    const [rows] = await pool.query('SELECT * FROM payments WHERE checkout_request_id = ?', [cb.CheckoutRequestID]);
    const payment = rows[0];
    if (!payment) return;

    if (Number(cb.ResultCode) !== 0) return settle(payment, false, cb.ResultDesc, null);

    const items = (cb.CallbackMetadata && cb.CallbackMetadata.Item) || [];
    const get = name => (items.find(i => i.Name === name) || {}).Value;
    if (Number(get('Amount')) < payment.amount) return settle(payment, false, 'Amount paid was less than the plan price', get('MpesaReceiptNumber'));
    await settle(payment, true, cb.ResultDesc, get('MpesaReceiptNumber'));
  } catch (e) {
    console.error('Callback error:', e);
  }
});

module.exports = { paymentsRouter, mpesaRouter };
