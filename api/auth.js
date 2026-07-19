/* ============================================================
   auth.js — Customer accounts (signup / login)
   POST { action:'signup', firstName,lastName,email,phone,addr,city,zip,password }
   POST { action:'login',  email, password }
   Storage: Redis via REDIS_URL (ioredis) — same store as delivery-config.js.
   Passwords are hashed with scrypt (Node's built-in crypto, no extra
   dependency); the hash/salt are never returned to the client.
   ============================================================ */
const Redis = require('ioredis');
const crypto = require('crypto');

const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_URL || '';

let _redis = null;
function getRedis() {
  if (!REDIS_URL) return null;
  if (_redis) return _redis;
  _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2, connectTimeout: 8000, lazyConnect: false });
  _redis.on('error', () => {}); // swallow — handled by callers falling back to an error response
  return _redis;
}

function userKey(email) {
  return 'wb_user:' + email.toLowerCase().trim();
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function safeUser(record) {
  const { salt, hash, ...safe } = record;
  return safe;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'Accounts storage is not connected yet. Please call (916) 753-3866.' });

  const body = req.body || {};
  const action = body.action;
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    if (action === 'signup') {
      const firstName = (body.firstName || '').trim();
      const lastName = (body.lastName || '').trim();
      if (!firstName) return res.status(400).json({ error: 'First name is required.' });
      if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

      const key = userKey(email);
      const existing = await redis.get(key);
      if (existing) return res.status(409).json({ error: 'An account with that email already exists. Please sign in.' });

      const salt = crypto.randomBytes(16).toString('hex');
      const record = {
        firstName, lastName, email,
        phone: (body.phone || '').trim(),
        addr: (body.addr || '').trim(),
        city: (body.city || '').trim(),
        zip: (body.zip || '').trim(),
        salt, hash: hashPassword(password, salt),
        createdAt: Date.now(),
      };
      await redis.set(key, JSON.stringify(record));
      return res.status(200).json({ ok: true, user: safeUser(record) });
    }

    if (action === 'login') {
      const key = userKey(email);
      const raw = await redis.get(key);
      if (!raw) return res.status(401).json({ error: 'No account found with that email. Please check your details or create an account.' });

      const record = JSON.parse(raw);
      const candidate = Buffer.from(hashPassword(password, record.salt), 'hex');
      const stored = Buffer.from(record.hash, 'hex');
      const match = candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });

      return res.status(200).json({ ok: true, user: safeUser(record) });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error — please try again.' });
  }
};
