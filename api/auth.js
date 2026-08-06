/* ============================================================
   auth.js — Customer accounts: signup / login / sessions / account data
   POST { action:'signup', firstName,lastName,email,phone,addr,city,zip,password }
   POST { action:'login',  email, password }
   POST { action:'logout' }
   POST { action:'me' }
   POST { action:'update', firstName?,lastName?,phone?,addr?,city?,zip? }
   POST { action:'orders' }         — session required
   POST { action:'subscriptions' }  — session required

   Storage: Redis via REDIS_URL (ioredis) — same store as delivery-config.js.
     wb_user:<email>   → JSON user record (scrypt hash+salt, never sent to client)
     wb_sess:<token>   → email, 30-day TTL (httpOnly cookie "wb_sess")
     wb_orders:<email> → hash of orderRef → order JSON (written by stripe-webhook)
     wb_rl:*           → rate-limit counters

   Sessions are httpOnly+Secure+SameSite=Lax cookies — JS never sees the
   token. Login is rate-limited per IP and per email. CORS is locked to
   the site's own origins (all calls are same-origin anyway).
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

const ALLOWED_ORIGINS = [
  'https://www.elkgrovewaterboy.com',
  'https://elkgrovewaterboy.com',
  'http://localhost:3000',
  'http://localhost:3999',
  'http://127.0.0.1:3000',
];

function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
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

/* ── Sessions ─────────────────────────────────────────────── */
const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isLocalhost(req) {
  const host = req.headers.host || '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

function sessionCookie(req, token, maxAge) {
  return 'wb_sess=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + (isLocalhost(req) ? '' : '; Secure');
}

async function createSession(redis, req, res, email) {
  const token = crypto.randomBytes(32).toString('hex');
  await redis.set('wb_sess:' + token, email.toLowerCase().trim(), 'EX', SESSION_TTL);
  res.setHeader('Set-Cookie', sessionCookie(req, token, SESSION_TTL));
  return token;
}

async function getSession(redis, req) {
  const token = parseCookies(req).wb_sess;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const email = await redis.get('wb_sess:' + token);
  if (!email) return null;
  // Sliding expiry — active users stay signed in.
  redis.expire('wb_sess:' + token, SESSION_TTL).catch(() => {});
  return { token, email };
}

/* ── Rate limiting ────────────────────────────────────────── */
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function rateLimited(redis, key, limit, windowSec) {
  try {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, windowSec);
    return n > limit;
  } catch (e) {
    return false; // Redis hiccup — don't lock users out
  }
}

/* ── Orders ───────────────────────────────────────────────── */
async function listOrders(redis, email) {
  const raw = await redis.hgetall('wb_orders:' + email.toLowerCase().trim());
  const orders = [];
  Object.keys(raw || {}).forEach((k) => {
    try { orders.push(JSON.parse(raw[k])); } catch (e) {}
  });
  orders.sort((a, b) => (b.placedAt || 0) - (a.placedAt || 0));
  return orders;
}

/* ── Subscriptions (live from Stripe) ─────────────────────── */
async function listSubscriptions(email) {
  if (!process.env.STRIPE_SECRET_KEY) return [];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const customers = await stripe.customers.list({ email, limit: 5 });
  const subs = [];
  for (const cust of customers.data) {
    const list = await stripe.subscriptions.list({ customer: cust.id, status: 'all', limit: 10 });
    for (const s of list.data) {
      if (!['active', 'trialing', 'past_due'].includes(s.status)) continue;
      const item = (s.items && s.items.data && s.items.data[0]) || {};
      const price = item.price || {};
      subs.push({
        id: s.id,
        planName: (s.metadata && s.metadata.planName) || price.nickname || 'Monthly Water Delivery',
        amount: price.unit_amount != null ? price.unit_amount / 100 : null,
        interval: (price.recurring && price.recurring.interval) || 'month',
        status: s.status,
        cancelAtPeriodEnd: !!s.cancel_at_period_end,
        currentPeriodEnd: s.current_period_end ? s.current_period_end * 1000 : null,
        startedAt: s.start_date ? s.start_date * 1000 : null,
        deliveryDay: (s.metadata && s.metadata.deliveryDay) || '',
        address: (s.metadata && s.metadata.address) || '',
      });
    }
  }
  return subs;
}

/* ── Handler ──────────────────────────────────────────────── */
module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'Accounts storage is not connected yet. Please call (916) 753-3866.' });

  const body = req.body || {};
  const action = body.action;
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const ip = clientIp(req);

  try {
    if (action === 'signup') {
      if (await rateLimited(redis, 'wb_rl:signup:' + ip, 10, 3600)) {
        return res.status(429).json({ error: 'Too many attempts. Please try again in an hour.' });
      }
      const firstName = (body.firstName || '').trim();
      const lastName = (body.lastName || '').trim();
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
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
      await createSession(redis, req, res, email);
      return res.status(200).json({ ok: true, user: safeUser(record) });
    }

    if (action === 'login') {
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
      if (await rateLimited(redis, 'wb_rl:login_ip:' + ip, 20, 900)) {
        return res.status(429).json({ error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' });
      }
      if (await rateLimited(redis, 'wb_rl:login_em:' + email, 8, 900)) {
        return res.status(429).json({ error: 'Too many sign-in attempts for this email. Please wait 15 minutes and try again.' });
      }

      const raw = await redis.get(userKey(email));
      if (!raw) return res.status(401).json({ error: 'No account found with that email. Please check your details or create an account.' });

      const record = JSON.parse(raw);
      const candidate = Buffer.from(hashPassword(password, record.salt), 'hex');
      const stored = Buffer.from(record.hash, 'hex');
      const match = candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });

      await createSession(redis, req, res, email);
      return res.status(200).json({ ok: true, user: safeUser(record) });
    }

    if (action === 'logout') {
      const sess = await getSession(redis, req);
      if (sess) await redis.del('wb_sess:' + sess.token);
      res.setHeader('Set-Cookie', sessionCookie(req, '', 0));
      return res.status(200).json({ ok: true });
    }

    /* Everything below requires a session. */
    const sess = await getSession(redis, req);

    if (action === 'me') {
      if (!sess) return res.status(200).json({ ok: true, user: null });
      const raw = await redis.get(userKey(sess.email));
      return res.status(200).json({ ok: true, user: raw ? safeUser(JSON.parse(raw)) : null });
    }

    if (!sess) return res.status(401).json({ error: 'Please sign in.' });

    if (action === 'update') {
      const raw = await redis.get(userKey(sess.email));
      if (!raw) return res.status(404).json({ error: 'Account not found.' });
      const record = JSON.parse(raw);
      ['firstName', 'lastName', 'phone', 'addr', 'city', 'zip'].forEach((f) => {
        if (typeof body[f] === 'string') record[f] = body[f].trim();
      });
      await redis.set(userKey(sess.email), JSON.stringify(record));
      return res.status(200).json({ ok: true, user: safeUser(record) });
    }

    if (action === 'orders') {
      const orders = await listOrders(redis, sess.email);
      return res.status(200).json({ ok: true, orders });
    }

    if (action === 'subscriptions') {
      const subscriptions = await listSubscriptions(sess.email);
      return res.status(200).json({ ok: true, subscriptions });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('auth error:', err.message);
    return res.status(500).json({ error: 'Server error — please try again.' });
  }
};
