/* ============================================================
   create-portal-session.js — Stripe Billing Portal handoff
   + customer-facing "when's my next delivery" lookup
   POST { email } -> { url, subscriptions } or { error }

   `url` opens Stripe's hosted "Manage Subscription" portal, where the
   customer can update their card, view invoices, or cancel.

   `subscriptions` is computed in the same request (no extra Serverless
   Function needed -- the Hobby plan caps a deployment at 12, and this
   project is already at that limit) so manage-subscription.html's
   "Your Next Delivery" card can reuse this one endpoint instead of
   calling a dedicated one. Each entry's delivery date is computed the
   same way api/stripe-webhook.js computes it for Jordan's Google
   Calendar, so the customer sees the identical date he sees.
   ============================================================ */
const Stripe = require('stripe');

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* Mirrors resolveDeliveryDate() in api/stripe-webhook.js — duplicated,
   not imported, since these are separate Vercel Serverless Functions
   with no shared-module bundling. Keep in sync by hand if either changes. */
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
    const email = (req.body && req.body.email || '').toString().trim().toLowerCase();
    const skipPortal = !!(req.body && req.body.skipPortal);
    if (!email) return res.status(400).json({ error: 'Enter the email you used to subscribe.' });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.status(404).json({ error: "We couldn't find a subscription for that email." });
    }
    const customerId = customers.data[0].id;

    // The "Your Next Delivery" card only needs subscription metadata, not a
    // portal link — skip creating (and immediately discarding) a Billing
    // Portal session for that case.
    let url = null;
    if (!skipPortal) {
      const origin = req.headers.origin || ('https://' + req.headers.host);
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: origin + '/my-orders',
      });
      url = session.url;
    }

    let subscriptions = [];
    try {
      const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 10 });
      subscriptions = subs.data.map((sub) => {
        const meta = sub.metadata || {};
        return {
          planName: meta.planName || 'Water Boy Delivery',
          deliveryWindow: meta.deliveryWindow || '',
          address: meta.address || '',
          nextDeliveryDate: nextDeliveryDate(meta.deliveryDay),
          nextBillingDate: new Date(sub.current_period_end * 1000).toISOString().split('T')[0],
        };
      });
    } catch (e) { /* non-fatal — the portal link above still works even if this lookup fails */ }

    res.json({ url, subscriptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
