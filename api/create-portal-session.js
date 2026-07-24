/* ============================================================
   create-portal-session.js — Stripe Billing Portal handoff
   POST { email } -> { url } (redirect target) or { error }
   Looks up the Stripe Customer created by subscription Checkout for
   this email and opens Stripe's hosted "Manage Subscription" portal,
   where the customer can update their card, view invoices, or cancel
   -- no custom UI needed, Stripe handles it all securely.
   ============================================================ */
const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const email = (req.body && req.body.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Enter the email you used to subscribe.' });

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (!customers.data.length) {
      return res.status(404).json({ error: "We couldn't find a subscription for that email." });
    }

    const origin = req.headers.origin || ('https://' + req.headers.host);
    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: origin + '/my-orders',
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
