// DEV ONLY: pretends Safaricom confirmed a payment, to test plan activation without real money.
// Usage: node scripts/fake-payment.js your-company-email@example.com [monthly|quarterly|yearly]
require('dotenv').config();
const crypto = require('crypto');
const pool = require('../src/db');
const { PLANS } = require('../src/plans');
const { callbackSecret } = require('../src/mpesa');

if (process.env.NODE_ENV === 'production') { console.error('Refusing to run in production.'); process.exit(1); }

(async () => {
  const [email, planId = 'monthly'] = process.argv.slice(2);
  const plan = PLANS[planId];
  if (!email || !plan) { console.error('Usage: node scripts/fake-payment.js <company-email> [monthly|quarterly|yearly]'); process.exit(1); }

  const [rows] = await pool.query(
    'SELECT c.id, c.name, c.subscription_ends FROM users u JOIN companies c ON c.user_id = u.id WHERE u.email = ?', [email.toLowerCase()]);
  if (!rows[0]) { console.error('No company found for that email.'); process.exit(1); }
  const company = rows[0];
  console.log(`Plan end date before: ${company.subscription_ends ? new Date(company.subscription_ends).toDateString() : 'none'}`);

  const checkoutId = 'ws_CO_FAKE_' + crypto.randomBytes(6).toString('hex');
  await pool.query(
    'INSERT INTO payments (company_id, plan, amount, phone, checkout_request_id, merchant_request_id) VALUES (?,?,?,?,?,?)',
    [company.id, planId, plan.amount, '254700000000', checkoutId, 'FAKE']);

  const res = await fetch(`http://localhost:${process.env.PORT || 3000}/api/mpesa/callback/${callbackSecret()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Body: { stkCallback: {
      MerchantRequestID: 'FAKE', CheckoutRequestID: checkoutId, ResultCode: 0, ResultDesc: 'The service request is processed successfully.',
      CallbackMetadata: { Item: [{ Name: 'Amount', Value: plan.amount }, { Name: 'MpesaReceiptNumber', Value: 'TEST' + Date.now().toString().slice(-6) }] }
    } } })
  });
  console.log('Callback sent, server replied:', res.status);
  await new Promise(r => setTimeout(r, 800));

  const [after] = await pool.query('SELECT subscription_status, subscription_ends FROM companies WHERE id = ?', [company.id]);
  const [pay] = await pool.query('SELECT status, mpesa_receipt FROM payments WHERE checkout_request_id = ?', [checkoutId]);
  console.log(`Payment: ${pay[0].status} (receipt ${pay[0].mpesa_receipt})`);
  console.log(`Plan now: ${after[0].subscription_status}, ends ${new Date(after[0].subscription_ends).toDateString()}`);
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
