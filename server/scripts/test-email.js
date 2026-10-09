// Usage: node scripts/test-email.js you@example.com
const { sendMail, enabled } = require('../src/mailer');
(async () => {
  const to = process.argv[2];
  if (!to) return console.error('Usage: node scripts/test-email.js you@example.com');
  if (!enabled) return console.error('EMAIL_USER and EMAIL_PASS are not set in .env');
  const ok = await sendMail({ to, subject: 'Reverse test email', text: 'Email sending works.', html: '<p>Email sending works. ✅</p>' });
  console.log(ok ? 'Sent! Check your inbox (and spam).' : 'Failed. See the error above.');
})();
