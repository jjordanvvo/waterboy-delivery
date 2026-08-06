const Stripe = require('stripe');

/* Truncate to Stripe's 500-char metadata value limit. */
function m(v) {
  return String(v == null ? '' : v).slice(0, 500);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const {
      amount, customerEmail, customerName,
      orderId, items, address, phone, deliveryDate, deliveryWindow,
    } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      receipt_email: customerEmail,
      description: 'Water Boy Delivery order for ' + customerName,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      // wb_order:'1' tells /api/stripe-webhook to record this order to the
      // customer's account history (keyed by email) on payment_intent.succeeded.
      metadata: {
        wb_order: '1',
        orderId: m(orderId),
        email: m((customerEmail || '').trim().toLowerCase()),
        name: m(customerName),
        items: m(items),
        address: m(address),
        phone: m(phone),
        deliveryDate: m(deliveryDate),
        deliveryWindow: m(deliveryWindow),
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
