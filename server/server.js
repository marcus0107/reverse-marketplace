require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://images.pexels.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const postLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authLimiter, require('./src/routes/auth'));
app.post('/api/requests', postLimiter);
app.use('/api/requests', require('./src/routes/requests'));
const { paymentsRouter, mpesaRouter } = require('./src/routes/payments');
app.post('/api/payments/stk', rateLimit({ windowMs: 60 * 60 * 1000, limit: 15, standardHeaders: true, legacyHeaders: false }));
app.use('/api/payments', paymentsRouter);
app.use('/api/mpesa', mpesaRouter);
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/companies', require('./src/routes/companies'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Optional: serve the built React client if a client/dist folder sits next to this server
const dist = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Reverse running on http://localhost:${port}`));
