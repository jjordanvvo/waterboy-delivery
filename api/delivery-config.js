/* ============================================================
   delivery-config.js — Blocked dates + same-day cutoff
   GET  (public)  -> returns { blockedDates, cutoffHour, storageConnected }
   POST (admin)   -> saves config; requires header x-admin-pass === ADMIN_PASSWORD
   Storage: Redis via REDIS_URL (ioredis). Falls back to DEFAULTS so the
   checkout keeps working even before storage is connected.
   ============================================================ */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_URL || '';
const KEY = 'delivery_config';
const DEFAULTS = { blockedDates: ['2026-12-25', '2026-01-01', '2026-11-26', '2026-07-04'], cutoffHour: 14 };

let _redis = null;
function getRedis() {
  if (!REDIS_URL) return null;
  if (_redis) return _redis;
  _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2, connectTimeout: 8000, lazyConnect: false });
  _redis.on('error', () => {}); // swallow — handlers below fall back to defaults
  return _redis;
}
async function storeGet() {
  const r = getRedis();
  if (!r) return null;
  try { const v = await r.get(KEY); return v ? JSON.parse(v) : null; } catch (_) { return null; }
}
async function storeSet(val) {
  const r = getRedis();
  if (!r) return false;
  try { await r.set(KEY, JSON.stringify(val)); return true; } catch (_) { return false; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pass');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const cfg = await storeGet();
    // TEMP: live read/write test to confirm the Redis connection actually works
    let _redisOk = null;
    try {
      const r = getRedis();
      if (r) { await r.set('_wb_ping', '1', 'EX', 60); _redisOk = (await r.get('_wb_ping')) === '1'; }
    } catch (e) { _redisOk = 'err:' + e.message; }
    return res.status(200).json({ ...(cfg || DEFAULTS), storageConnected: !!REDIS_URL, _redisOk });
  }

  if (req.method === 'POST') {
    const pass = req.headers['x-admin-pass'] || '';
    if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server yet.' });
    if (pass !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password.' });
    if (!REDIS_URL) return res.status(500).json({ error: 'Storage not connected. Create a Redis store first.' });

    const body = req.body || {};
    const blockedDates = Array.isArray(body.blockedDates)
      ? [...new Set(body.blockedDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort()
      : [];
    let cutoffHour = parseInt(body.cutoffHour, 10);
    if (isNaN(cutoffHour) || cutoffHour < 0 || cutoffHour > 23) cutoffHour = 14;

    const ok = await storeSet({ blockedDates, cutoffHour });
    if (!ok) return res.status(500).json({ error: 'Save failed — check your storage connection.' });
    return res.status(200).json({ ok: true, blockedDates, cutoffHour });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
