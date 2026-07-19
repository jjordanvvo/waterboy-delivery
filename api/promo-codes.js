/* ============================================================
   promo-codes.js — Admin management of discount codes
   GET  (admin)  -> { codes: [...] }
   POST (admin)  -> replace the whole codes list; requires x-admin-pass
   Storage: Redis via REDIS_URL (ioredis) — same store as delivery-config.js.
   Each code: { code, percentOff, productId, active }
   productId is one of the water types ('purified'|'alkaline'|'hydrogen'),
   an add-on id ('lmnt-cans' etc.), or 'all' for order-wide discounts.
   Customer-facing validation happens in /api/validate-promo, which never
   exposes this full list.
   ============================================================ */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_URL || '';
const KEY = 'promo_codes';

let _redis = null;
function getRedis() {
  if (!REDIS_URL) return null;
  if (_redis) return _redis;
  _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2, connectTimeout: 8000, lazyConnect: false });
  _redis.on('error', () => {});
  return _redis;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pass');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pass = req.headers['x-admin-pass'] || '';
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server yet.' });
  if (pass !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password.' });

  const redis = getRedis();
  if (!redis) return res.status(500).json({ error: 'Storage not connected. Create a Redis store first.' });

  if (req.method === 'GET') {
    try {
      const raw = await redis.get(KEY);
      return res.status(200).json({ codes: raw ? JSON.parse(raw) : [] });
    } catch (err) {
      return res.status(500).json({ error: 'Could not load codes.' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!Array.isArray(body.codes)) return res.status(400).json({ error: 'codes must be an array.' });

    const codes = body.codes
      .filter((c) => c && typeof c.code === 'string' && c.code.trim())
      .map((c) => ({
        code: c.code.trim().toUpperCase().slice(0, 30),
        percentOff: Math.min(100, Math.max(1, parseInt(c.percentOff, 10) || 0)),
        productId: (typeof c.productId === 'string' && c.productId) || 'all',
        active: c.active !== false,
      }));

    try {
      await redis.set(KEY, JSON.stringify(codes));
      return res.status(200).json({ ok: true, codes });
    } catch (err) {
      return res.status(500).json({ error: 'Save failed — check your storage connection.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
