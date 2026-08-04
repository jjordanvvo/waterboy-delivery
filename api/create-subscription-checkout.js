const Stripe = require('stripe');

/* ============================================================
   create-subscription-checkout.js — Real recurring Stripe billing
   POST { planName, amount, customerEmail, customerName, successUrl, cancelUrl }
   -> { url }  (redirect the browser here — Stripe-hosted Checkout)

   Uses Stripe Checkout in subscription mode with an inline price
   (price_data), so it works immediately with no pre-created Stripe
   Products/Prices. Stripe's hosted page handles card collection,
   3D Secure, retries, and subscription lifecycle — the customer is
   billed automatically every month until they cancel from the
   confirmation email's "Manage subscription" link or the Stripe
   customer portal.
   ============================================================ */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const {
      planName, amount, customerEmail, customerName, successUrl, cancelUrl,
      address, phone, deliveryDay, deliveryWindow,
    } = req.body || {};

    const amt = Number(amount);
    if (!planName || !amt || amt <= 0) {
      return res.status(400).json({ error: 'Missing or invalid planName/amount.' });
    }

    const origin = req.headers.origin || 'https://www.elkgrovewaterboy.com';

    // Stored on the Subscription so the /api/stripe-webhook handler can build
    // a Google Calendar event for every renewal, not just the first delivery.
    const deliveryMeta = {
      customerName: customerName || '',
      planName,
      address: address || '',
      phone: phone || '',
      deliveryDay: deliveryDay || '',
      deliveryWindow: deliveryWindow || '',
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: customerEmail || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: planName,
            description: 'Water Boy Delivery — recurring monthly plan',
          },
          unit_amount: Math.round(amt * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      subscription_data: {
        metadata: deliveryMeta,
      },
      metadata: deliveryMeta,
      allow_promotion_codes: true,
      success_url: successUrl || (origin + '/my-orders?subscribed=1'),
      cancel_url: cancelUrl || (origin + '/order'),
    });

    res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
