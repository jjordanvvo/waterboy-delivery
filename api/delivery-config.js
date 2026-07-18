/* ============================================================
   delivery-config.js — Blocked dates + same-day cutoff
   GET  (public)  -> returns { blockedDates, cutoffHour, storageConnected }
   POST (admin)   -> saves config; requires header x-admin-pass === ADMIN_PASSWORD
   Storage: Vercel KV / Upstash Redis (via REST). Falls back to DEFAULTS
   so the checkout keeps working even before storage is connected.
   ============================================================ */
const KV_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL   || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KEY = 'delivery_config';
const DEFAULTS = { blockedDates: ['2026-12-25', '2026-01-01', '2026-11-26', '2026-07-04'], cutoffHour: 14 };

async function kvGet() {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const r = await fetch(KV_URL + '/get/' + KEY, { headers: { Authorization: 'Bearer ' + KV_TOKEN } });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d || d.result == null) return null;
    return JSON.parse(d.result);
  } catch (_) { return null; }
}
async function kvSet(val) {
  const r = await fetch(KV_URL + '/set/' + KEY, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KV_TOKEN },
    body: JSON.stringify(val)
  });
  return r.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pass');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const cfg = await kvGet();
    // TEMP diagnostic: which storage-related env var NAMES exist (names only, no values)
    const _storageVars = Object.keys(process.env).filter((k) => /REDIS|KV|UPSTASH|STORAGE/i.test(k));
    return res.status(200).json({ ...(cfg || DEFAULTS), storageConnected: !!(KV_URL && KV_TOKEN), _storageVars });
  }

  if (req.method === 'POST') {
    const pass = req.headers['x-admin-pass'] || '';
    if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server yet.' });
    if (pass !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password.' });
    if (!KV_URL || !KV_TOKEN) return res.status(500).json({ error: 'Storage not connected. Create a Vercel KV store first.' });

    const body = req.body || {};
    const blockedDates = Array.isArray(body.blockedDates)
      ? [...new Set(body.blockedDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort()
      : [];
    let cutoffHour = parseInt(body.cutoffHour, 10);
    if (isNaN(cutoffHour) || cutoffHour < 0 || cutoffHour > 23) cutoffHour = 14;

    const ok = await kvSet({ blockedDates, cutoffHour });
    if (!ok) return res.status(500).json({ error: 'Save failed — check your storage connection.' });
    return res.status(200).json({ ok: true, blockedDates, cutoffHour });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
