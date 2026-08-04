const Stripe = require('stripe');

/* TEMPORARY diagnostic — investigate why subscription-checkout payments
   show under Payments but not under Subscriptions. Never returns secrets.
   GET /api/subdiag?email=someone@example.com */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const email = (req.query.email || '').trim();
    if (!email) return res.status(400).json({ error: 'email query param required' });

    const customers = await stripe.customers.list({ email, limit: 5 });
    const out = [];
    for (const c of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
      const pis = await stripe.paymentIntents.list({ customer: c.id, limit: 10 });
      out.push({
        customerId: c.id,
        email: c.email,
        created: new Date(c.created * 1000).toISOString(),
        subscriptions: subs.data.map(s => ({
          id: s.id, status: s.status, created: new Date(s.created * 1000).toISOString(),
          current_period_end: s.current_period_end ? new Date(s.current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: s.cancel_at_period_end,
          items: s.items.data.map(i => ({ price: i.price.id, amount: i.price.unit_amount, recurring: i.price.recurring })),
        })),
        paymentIntents: pis.data.map(p => ({
          id: p.id, amount: p.amount, status: p.status, created: new Date(p.created * 1000).toISOString(),
          invoice: p.invoice || null,
        })),
      });
    }
    // also search checkout sessions by email in case no Customer object was reused
    const sessions = await stripe.checkout.sessions.list({ limit: 20 });
    const matching = sessions.data
      .filter(s => (s.customer_details && s.customer_details.email === email) || s.customer_email === email)
      .map(s => ({ id: s.id, mode: s.mode, status: s.status, payment_status: s.payment_status, subscription: s.subscription, created: new Date(s.created * 1000).toISOString() }));

    res.status(200).json({ customersFound: customers.data.length, out, matchingRecentSessions: matching });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
