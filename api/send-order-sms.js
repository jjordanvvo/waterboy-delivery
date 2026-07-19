/* ============================================================
   send-order-sms.js — Order SMS via Twilio
   POST { to, orderId, deliveryDate, deliveryWindow, customerName, address, total }
   Texts the customer a confirmation, and — if OWNER_PHONE_NUMBER is set —
   also texts the owner a new-order alert to their own personal phone.
   Both use the same Twilio "From" number as the sender; only the
   recipient differs. Uses Twilio's REST API directly (no SDK dependency)
   so it matches this project's existing pattern of graceful no-ops when
   a third-party key isn't configured yet (see api/create-payment-intent.js,
   api/add-calendar-event.js).
   Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
   OWNER_PHONE_NUMBER is optional — owner alert is skipped without it.
   ============================================================ */
function toE164(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.length === 10 ? '+1' + digits : '+' + digits;
}

async function sendSms(sid, token, from, to, body) {
  const auth = Buffer.from(sid + ':' + token).toString('base64');
  const r = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });
  const data = await r.json();
  if (!r.ok) return { ok: false, reason: data.message || 'twilio_error' };
  return { ok: true, sid: data.sid };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SID = process.env.TWILIO_ACCOUNT_SID;
  const TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const FROM = process.env.TWILIO_FROM_NUMBER;
  const OWNER = process.env.OWNER_PHONE_NUMBER;
  if (!SID || !TOKEN || !FROM) return res.status(200).json({ ok: false, reason: 'not_configured' });

  const { to, orderId, deliveryDate, deliveryWindow, customerName, address, total } = req.body || {};

  const when = deliveryDate === 'As Soon As Possible'
    ? 'today (ASAP)'
    : (deliveryDate || 'your scheduled date') + (deliveryWindow ? ', ' + deliveryWindow : '');

  const result = { customer: { ok: false, reason: 'skipped' }, owner: { ok: false, reason: 'skipped' } };

  const customerTo = toE164(to);
  if (customerTo) {
    const body = 'Water Boy Delivery: your order' + (orderId ? ' #' + orderId : '') + ' is confirmed for ' + when + '. Questions? Call (916) 753-3866.';
    try {
      result.customer = await sendSms(SID, TOKEN, FROM, customerTo, body);
    } catch (err) {
      result.customer = { ok: false, reason: 'request_failed' };
    }
  } else {
    result.customer = { ok: false, reason: 'invalid_phone' };
  }

  const ownerTo = toE164(OWNER);
  if (ownerTo) {
    const body = 'New order' + (orderId ? ' #' + orderId : '') + (customerName ? ' from ' + customerName : '') + '. ' + when + '.' + (address ? ' ' + address + '.' : '') + (total ? ' $' + total : '');
    try {
      result.owner = await sendSms(SID, TOKEN, FROM, ownerTo, body);
    } catch (err) {
      result.owner = { ok: false, reason: 'request_failed' };
    }
  } else if (!OWNER) {
    result.owner = { ok: false, reason: 'not_configured' };
  } else {
    result.owner = { ok: false, reason: 'invalid_owner_phone' };
  }

  return res.status(200).json({ ok: result.customer.ok || result.owner.ok, ...result });
};
