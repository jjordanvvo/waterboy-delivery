/* ============================================================
   validate-promo.js — Customer-facing discount code check
   POST { code, productIds: string[] } -> { valid, percentOff, productId }
   productIds is every product in the current order (water type + any
   add-ons). A code matches if it's set to 'all' (whole-order discount) or
   targets one of the given product ids — the response's productId tells
   the client which single line to discount (or 'all' for the subtotal).
   Looks up ONE code server-side; never exposes the full code list
   (that stays behind the admin password in /api/promo-codes.js).
   Storage: Redis via REDIS_URL (ioredis) — same store as promo-codes.js.
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ valid: false, error: 'Method not allowed' });

  const redis = getRedis();
  if (!redis) return res.status(200).json({ valid: false, error: 'Promo codes are not available right now.' });

  const body = req.body || {};
  const code = (body.code || '').trim().toUpperCase();
  const productIds = Array.isArray(body.productIds) ? body.productIds : [];
  if (!code) return res.status(200).json({ valid: false, error: 'Enter a promo code.' });

  try {
    const raw = await redis.get(KEY);
    const codes = raw ? JSON.parse(raw) : [];
    const match = codes.find((c) => c.code === code && c.active);
    if (!match) return res.status(200).json({ valid: false, error: 'Invalid or expired promo code.' });
    if (match.productId !== 'all' && !productIds.includes(match.productId)) {
      return res.status(200).json({ valid: false, error: 'This code doesn\'t apply to your order.' });
    }
    return res.status(200).json({ valid: true, percentOff: match.percentOff, productId: match.productId, code: match.code });
  } catch (err) {
    return res.status(200).json({ valid: false, error: 'Could not check promo code — try again.' });
  }
};
