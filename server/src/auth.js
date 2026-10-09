const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
const SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const COOKIE = 'reverse_token';

function issueToken(res, user) {
  const token = jwt.sign({ uid: user.id }, SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 3600 * 1000
  });
}

function clearToken(res) { res.clearCookie(COOKIE); }

function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE];
    if (!token) throw new Error('no token');
    req.uid = jwt.verify(token, SECRET).uid;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in' });
  }
}

module.exports = { issueToken, clearToken, requireAuth };
