const Stripe = require('stripe');

/* ============================================================
   get-next-delivery.js — Customer-facing "when's my next delivery"
   POST { email } -> { subscriptions: [{ planName, deliveryWindow,
                        address, nextDeliveryDate, nextBillingDate }] }

   Looks up every active subscription for this email and computes the
   next delivery date the exact same way /api/stripe-webhook does for
   Jordan's Google Calendar, so the customer sees the identical date
   he sees — not a second, possibly-different guess.
   ============================================================ */

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* Mirrors resolveDeliveryDate() in api/stripe-webhook.js. This project has
   no shared-module bundling across separate Vercel serverless functions,
   so the logic is duplicated rather than imported — keep the two in sync
   by hand if either changes. */
function nextDeliveryDate(deliveryDay) {
  if (deliveryDay && /^\d{4}-\d{2}-\d{2}$/.test(deliveryDay)) {
    const d = new Date(deliveryDay + 'T00:00:00');
    if (!isNaN(d.getTime()) && d.getTime() >= Date.now() - 86400000) return deliveryDay;
  }
  let weekdayIdx = WEEKDAYS.indexOf(deliveryDay);
  if (weekdayIdx < 0 && deliveryDay && /^\d{4}-\d{2}-\d{2}$/.test(deliveryDay)) {
    const orig = new Date(deliveryDay + 'T00:00:00');
    if (!isNaN(orig.getTime())) weekdayIdx = orig.getDay();
  }
  const d = new Date();
  if (weekdayIdx >= 0) {
    const diff = (weekdayIdx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
  } else {
    d.setDate(d.getDate() + 3);
  }
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const email = ((req.body && req.body.email) || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Enter the email you used to subscribe.' });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.status(404).json({ error: "We couldn't find a subscription for that email." });
    }

    const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'active', limit: 10 });
    if (!subs.data.length) {
      return res.status(404).json({ error: 'No active subscription found for that email.' });
    }

    const subscriptions = subs.data.map((sub) => {
      const meta = sub.metadata || {};
      return {
        planName: meta.planName || 'Water Boy Delivery',
        deliveryWindow: meta.deliveryWindow || '',
        address: meta.address || '',
        nextDeliveryDate: nextDeliveryDate(meta.deliveryDay),
        nextBillingDate: new Date(sub.current_period_end * 1000).toISOString().split('T')[0],
      };
    });

    res.status(200).json({ subscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
