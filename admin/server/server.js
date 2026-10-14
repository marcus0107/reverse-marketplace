require('dotenv').config();
const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:'], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"] }
  }
}));
app.use((req, res, next) => { res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive'); next(); }); // keep out of search engines
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', require('./src/routes/auth'));
app.use('/api', require('./src/routes/admin'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  const dbDown = ['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ETIMEDOUT', 'ENOTFOUND'].includes(err.code);
  res.status(dbDown ? 503 : 500).json({ error: dbDown ? 'The database is not reachable right now.' : 'Server error' });
});
process.on('unhandledRejection', e => console.error('Unhandled rejection:', e));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Reverse admin running on http://localhost:${port}`));
