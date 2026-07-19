/* ============================================================
   send-order-sms.js — Order-confirmation SMS via Twilio
   POST { to, orderId, deliveryDate, deliveryWindow }
   Sends a confirmation text to the customer's phone. Uses Twilio's REST
   API directly (no SDK dependency) so it matches this project's existing
   pattern of graceful no-ops when a third-party key isn't configured yet
   (see api/create-payment-intent.js, api/add-calendar-event.js).
   Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
   ============================================================ */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;
  if (!SID || !TOKEN || !FROM) return res.status(200).json({ ok: false, reason: 'not_configured' });

  const { to, orderId, deliveryDate, deliveryWindow } = req.body || {};
  const digits = (to || '').replace(/\D/g, '');
  if (digits.length < 10) return res.status(200).json({ ok: false, reason: 'invalid_phone' });
  const toE164 = digits.length === 10 ? '+1' + digits : '+' + digits;

  const when = deliveryDate === 'As Soon As Possible'
    ? 'today (ASAP)'
    : (deliveryDate || 'your scheduled date') + (deliveryWindow ? ', ' + deliveryWindow : '');
  const body = 'Water Boy Delivery: your order' + (orderId ? ' #' + orderId : '') + ' is confirmed for ' + when + '. Questions? Call (916) 753-3866.';

  try {
    const auth = Buffer.from(SID + ':' + TOKEN).toString('base64');
    const r = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + SID + '/Messages.json', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: toE164, From: FROM, Body: body }).toString(),
    });
    const data = await r.json();
    if (!r.ok) return res.status(200).json({ ok: false, reason: data.message || 'twilio_error' });
    return res.status(200).json({ ok: true, sid: data.sid });
  } catch (err) {
    return res.status(200).json({ ok: false, reason: 'request_failed' });
  }
};
