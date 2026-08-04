const Stripe = require('stripe');
const Redis = require('ioredis');

/* ============================================================
   stripe-webhook.js — Calendars every subscription delivery
   Listens for invoice.payment_succeeded (fires for BOTH the first
   invoice created by /api/create-subscription-checkout AND every
   monthly renewal after it), reads the delivery info stashed as
   Subscription metadata at signup, and creates a Google Calendar
   event the same way /api/add-calendar-event does for one-time
   orders. This is what makes recurring/subscription bookings show
   up on the calendar at all — order.html/water-delivery.html's
   client-side calendar call never fires for these because the
   browser redirects to Stripe's hosted checkout and back, with no
   client-side "success" moment to hook into.

   Setup required (can't be done from here):
   1. Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
      URL: https://www.elkgrovewaterboy.com/api/stripe-webhook
      Event: invoice.payment_succeeded
   2. Copy the "Signing secret" (whsec_...) into Vercel as
      STRIPE_WEBHOOK_SECRET.
   ============================================================ */

const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_URL || '';
let _redis = null;
function getRedis() {
  if (!REDIS_URL) return null;
  if (_redis) return _redis;
  _redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2, connectTimeout: 8000, lazyConnect: false });
  _redis.on('error', () => {});
  return _redis;
}

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

async function getGoogleAccessToken() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return null;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error('Google token error: ' + (tokenData.error || 'unknown'));
  return tokenData.access_token;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* deliveryDay may be an actual ISO date (first delivery, picked on a
   calendar) or a weekday name (recurring day-of-week preference, in
   which case every renewal needs the NEXT occurrence recomputed, not
   the original signup date). Falls back to 3 days out if neither. */
function resolveDeliveryDate(deliveryDay) {
  if (deliveryDay && /^\d{4}-\d{2}-\d{2}$/.test(deliveryDay)) {
    const d = new Date(deliveryDay + 'T00:00:00');
    if (!isNaN(d.getTime()) && d.getTime() >= Date.now() - 86400000) return deliveryDay;
  }
  const weekdayIdx = WEEKDAYS.indexOf(deliveryDay);
  const d = new Date();
  if (weekdayIdx >= 0) {
    const diff = (weekdayIdx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
  } else {
    d.setDate(d.getDate() + 3);
  }
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

async function createCalendarEvent(accessToken, meta, invoice) {
  const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const isFirstDelivery = invoice.billing_reason === 'subscription_create';
  const deliveryDateStr = resolveDeliveryDate(meta.deliveryDay);
  const startH = meta.deliveryWindow && meta.deliveryWindow.includes('Morning') ? 8
    : meta.deliveryWindow && meta.deliveryWindow.includes('Afternoon') ? 12 : 16;

  const start = new Date(deliveryDateStr + 'T00:00:00'); start.setHours(startH, 0, 0, 0);
  const end = new Date(start); end.setHours(startH + 3, 0, 0, 0);

  const event = {
    summary: (isFirstDelivery ? '🔁 New Subscription' : '🔁 Subscription Renewal') + ' — ' + (meta.customerName || '') + (meta.address ? ' — ' + meta.address : ''),
    description: [
      'PLAN: ' + (meta.planName || '—'),
      'NAME: ' + (meta.customerName || '—'),
      'PHONE: ' + (meta.phone || '—'),
      'EMAIL: ' + (invoice.customer_email || '—'),
      'DELIVER TO: ' + (meta.address || '— not captured at signup, contact customer —'),
      'AMOUNT: $' + (invoice.amount_paid / 100).toFixed(2),
      'INVOICE: ' + invoice.id,
    ].join('\n'),
    location: meta.address || '',
    start: { dateTime: start.toISOString(), timeZone: 'America/Los_Angeles' },
    end: { dateTime: end.toISOString(), timeZone: 'America/Los_Angeles' },
    colorId: '9',
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 60 }, { method: 'popup', minutes: 15 }] },
  };

  const calRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events',
    { method: 'POST', headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify(event) }
  );
  const calData = await calRes.json();
  if (!calRes.ok) throw new Error((calData.error && calData.error.message) || 'Calendar API error');
  return calData.id;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set.');
    return res.status(500).end();
  }

  let event;
  try {
    const rawBody = await buffer(req);
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  if (event.type !== 'invoice.payment_succeeded') {
    return res.status(200).json({ received: true, skipped: event.type });
  }

  const invoice = event.data.object;
  if (!invoice.subscription) {
    // A one-time invoice, not tied to a subscription — nothing to calendar here.
    return res.status(200).json({ received: true, skipped: 'no_subscription' });
  }

  const redis = getRedis();
  const dedupeKey = 'cal_evt:' + invoice.id;
  try {
    if (redis && (await redis.get(dedupeKey))) {
      return res.status(200).json({ received: true, skipped: 'already_processed' });
    }
  } catch (e) { /* Redis unreachable — proceed anyway, worst case a duplicate event */ }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const meta = subscription.metadata || {};

    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      // Google Calendar isn't configured — nothing to do, but don't fail the webhook.
      return res.status(200).json({ received: true, skipped: 'calendar_not_configured' });
    }

    const eventId = await createCalendarEvent(accessToken, meta, invoice);

    if (redis) {
      try { await redis.set(dedupeKey, '1', 'EX', 60 * 60 * 24 * 90); } catch (e) { /* non-fatal */ }
    }

    res.status(200).json({ received: true, eventId });
  } catch (err) {
    console.error('stripe-webhook calendar error:', err.message);
    // Non-200 so Stripe retries with backoff — the dedupe key above (only set
    // after success) makes retries safe.
    res.status(500).json({ error: err.message });
  }
};

module.exports.config = { api: { bodyParser: false } };
