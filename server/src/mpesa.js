require('dotenv').config();
const crypto = require('crypto');

const BASE = process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
let cached = { token: null, exp: 0 };

function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set in .env`);
  return v;
}

// Accepts 07xx, 01xx, 7xx, +254..., 254... and returns 2547XXXXXXXX (or null)
function normalizePhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  let p = null;
  if (/^0[17]\d{8}$/.test(d)) p = '254' + d.slice(1);
  else if (/^[17]\d{8}$/.test(d)) p = '254' + d;
  else if (/^254[17]\d{8}$/.test(d)) p = d;
  return p;
}

// Nairobi time (UTC+3), format YYYYMMDDHHmmss
function timestamp() {
  const d = new Date(Date.now() + 3 * 3600 * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

function password(ts) {
  return Buffer.from(`${need('MPESA_SHORTCODE')}${need('MPESA_PASSKEY')}${ts}`).toString('base64');
}

async function getToken() {
  if (cached.token && Date.now() < cached.exp) return cached.token;
  const auth = Buffer.from(`${need('MPESA_CONSUMER_KEY')}:${need('MPESA_CONSUMER_SECRET')}`).toString('base64');
  let res;
  try {
    res = await fetch(`${BASE}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  } catch {
    throw new Error('Could not reach M-Pesa. Check your internet connection and try again.');
  }
  if (!res.ok) throw new Error('M-Pesa login failed. Check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env');
  const d = await res.json();
  cached = { token: d.access_token, exp: Date.now() + (Number(d.expires_in || 3599) - 60) * 1000 };
  return cached.token;
}

// The callback path contains a secret derived from JWT_SECRET, because Safaricom does not sign callbacks.
function callbackSecret() {
  return crypto.createHmac('sha256', process.env.JWT_SECRET || 'dev-only-secret').update('mpesa-callback').digest('hex').slice(0, 32);
}

function callbackUrl() {
  const base = (process.env.MPESA_CALLBACK_URL || 'https://example.com').replace(/\/+$/, '');
  return `${base}/api/mpesa/callback/${callbackSecret()}`;
}

async function call(path, body) {
  const token = await getToken();
  let res;
  try {
    res = await fetch(BASE + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('Could not reach M-Pesa. Check your internet connection and try again.');
  }
  let data = {};
  try { data = await res.json(); } catch { /* ignore */ }
  return { ok: res.ok, data };
}

async function stkPush({ phone, amount, reference, description }) {
  const ts = timestamp();
  const { ok, data } = await call('/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: need('MPESA_SHORTCODE'),
    Password: password(ts),
    Timestamp: ts,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: need('MPESA_SHORTCODE'),
    PhoneNumber: phone,
    CallBackURL: callbackUrl(),
    AccountReference: String(reference).slice(0, 12),
    TransactionDesc: String(description).slice(0, 13)
  });
  if (!ok || data.ResponseCode !== '0') {
    throw new Error(data.errorMessage || data.ResponseDescription || 'M-Pesa could not start the payment');
  }
  return { checkoutRequestId: data.CheckoutRequestID, merchantRequestId: data.MerchantRequestID };
}

// Asks Safaricom for the result (used when the callback has not reached us, e.g. on localhost)
async function stkQuery(checkoutRequestId) {
  const ts = timestamp();
  const { data } = await call('/mpesa/stkpushquery/v1/query', {
    BusinessShortCode: need('MPESA_SHORTCODE'),
    Password: password(ts),
    Timestamp: ts,
    CheckoutRequestID: checkoutRequestId
  });
  // Still waiting: no ResultCode at all, or code 4999 ("transaction is still under processing").
  if (data.ResultCode === undefined || String(data.ResultCode) === '4999') return { done: false };
  return { done: true, success: String(data.ResultCode) === '0', description: data.ResultDesc };
}

module.exports = { normalizePhone, stkPush, stkQuery, callbackSecret, callbackUrl };
