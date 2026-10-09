require('dotenv').config();
const nodemailer = require('nodemailer');

const enabled = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const transporter = enabled
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } })
  : null;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => 'KSh ' + Number(n || 0).toLocaleString('en-KE');
const appUrl = () => (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');

// Returns true if sent, false if email is not configured or sending failed. Never throws.
async function sendMail({ to, subject, text, html }) {
  if (!enabled) { console.warn('Email not configured (EMAIL_USER / EMAIL_PASS missing), skipping email to', to); return false; }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, text, html });
    return true;
  } catch (e) {
    console.error('Email failed:', e.message);
    return false;
  }
}

// New-lead email. Buyer contact details are NOT included: companies see them in the dashboard.
function buildLeadEmail(request, company, score) {
  const link = `${appUrl()}/dashboard`;
  const desc = String(request.description || '').slice(0, 300);
  return {
    subject: `New buyer lead (${score}% fit): ${request.title}`,
    text:
`Hi ${company.name},

A new buyer request matches your company (${score}% fit).

${request.title}
Category: ${request.category}
Budget: ${money(request.budget)}
Location: ${request.location}
Needed by: ${request.deadline}

${desc}

Open your dashboard to see the buyer's contact details and reach out quickly:
${link}

Reverse`,
    html:
`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1f1b2e">
  <h2 style="margin-bottom:4px">New buyer lead</h2>
  <p style="margin-top:0;color:#6f6a7d">${esc(company.name)}, a buyer request matches you (<b>${score}% fit</b>).</p>
  <div style="border:1px solid #e8e3f1;border-radius:12px;padding:16px">
    <h3 style="margin:0 0 8px">${esc(request.title)}</h3>
    <p style="margin:0 0 4px">${esc(request.category)} · ${money(request.budget)} · ${esc(request.location)}</p>
    <p style="margin:0 0 8px;color:#6f6a7d">Needed by: ${esc(request.deadline)}</p>
    <p style="margin:0">${esc(desc)}</p>
  </div>
  <p><a href="${esc(link)}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">View buyer contact</a></p>
  <p style="color:#9a95a8;font-size:12px">You get this email because your company is subscribed to Reverse.</p>
</div>`
  };
}

async function notifyLeads(request, matches) {
  for (const m of matches) {
    if (/@demo\.test$/i.test(m.company.email)) continue; // sample companies have fake addresses
    const mail = buildLeadEmail(request, m.company, m.score);
    await sendMail({ to: m.company.email, ...mail });
  }
}

module.exports = { sendMail, notifyLeads, buildLeadEmail, enabled };
