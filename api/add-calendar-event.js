const Stripe = require('stripe');

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* Mirrors resolveDeliveryDate() in api/stripe-webhook.js (the fixed
   version) — duplicated, not imported, since these are separate Vercel
   Serverless Functions with no shared-module bundling. Keep in sync by
   hand if either changes. */
function correctDeliveryDate(deliveryDay, isFirstDelivery) {
  if (isFirstDelivery && deliveryDay && /^\d{4}-\d{2}-\d{2}$/.test(deliveryDay)) {
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

async function getGoogleAccessToken(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN) {
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

/* ============================================================
   ADMIN-ONLY: audit (and optionally fix) subscription calendar events
   created by the resolveDeliveryDate bug fixed in api/stripe-webhook.js.
   That bug only affected RENEWAL events for subscriptions whose first
   delivery was picked via calendar date (not a weekday name) -- every
   renewal after the first fell back to a hardcoded "3 days from now"
   instead of the customer's real recurring day.

   POST { adminAction: 'audit-subscription-calendar', adminPass, confirm }
   - confirm: false (default) -> DRY RUN. Reports every mismatch found,
     changes nothing. Always run this first and review the list.
   - confirm: true -> actually patches each wrong event to the correct
     date, using the same colorId/reminders, updating only start/end and
     re-labeling that it was corrected.
   ============================================================ */
async function auditSubscriptionCalendar(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD is not set on the server.' });
  if (req.body.adminPass !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect admin password.' });
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) return res.status(500).json({ error: 'Google Calendar is not configured.' });

  const confirm = !!req.body.confirm;
  const stripe = Stripe(STRIPE_SECRET_KEY);

  const accessToken = await getGoogleAccessToken(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);

  // Subscription events only ever get created reactively, at the moment a
  // renewal invoice succeeds -- there's nothing to audit far in the future.
  // Covers the last 75 days of history plus a few days ahead as a buffer.
  const timeMin = new Date(Date.now() - 75 * 86400000).toISOString();
  const timeMax = new Date(Date.now() + 7 * 86400000).toISOString();

  const listRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) +
    '/events?timeMin=' + encodeURIComponent(timeMin) + '&timeMax=' + encodeURIComponent(timeMax) +
    '&maxResults=250&singleEvents=true',
    { headers: { Authorization: 'Bearer ' + accessToken } }
  );
  const listData = await listRes.json();
  if (!listRes.ok) throw new Error((listData.error && listData.error.message) || 'Calendar list error');

  const subscriptionEvents = (listData.items || []).filter((ev) => ev.summary && ev.summary.indexOf('🔁') === 0);

  const results = [];
  for (const ev of subscriptionEvents) {
    const desc = ev.description || '';
    const invoiceMatch = desc.match(/INVOICE:\s*(\S+)/);
    const nameMatch = desc.match(/NAME:\s*(.+)/);
    if (!invoiceMatch) { results.push({ eventId: ev.id, summary: ev.summary, skipped: 'no invoice id in description' }); continue; }
    const invoiceId = invoiceMatch[1];

    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      if (!invoice.subscription) { results.push({ eventId: ev.id, summary: ev.summary, skipped: 'invoice has no subscription' }); continue; }
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const meta = subscription.metadata || {};
      const isFirstDelivery = invoice.billing_reason === 'subscription_create';
      const correctDate = correctDeliveryDate(meta.deliveryDay, isFirstDelivery);

      const actualDateStr = (ev.start && (ev.start.dateTime || ev.start.date) || '').slice(0, 10);
      const wrong = actualDateStr && actualDateStr !== correctDate;

      const row = {
        eventId: ev.id,
        customerName: (nameMatch && nameMatch[1].trim()) || meta.customerName || '',
        planName: meta.planName || '',
        currentDate: actualDateStr,
        correctDate,
        wrong,
        fixed: false,
      };

      if (wrong && confirm) {
        // Preserve the event's own time-of-day/window, only the date moves.
        const oldStart = new Date(ev.start.dateTime || ev.start.date + 'T16:00:00');
        const oldEnd = new Date(ev.end.dateTime || ev.end.date + 'T19:00:00');
        const durationMs = oldEnd.getTime() - oldStart.getTime();
        const newStart = new Date(correctDate + 'T00:00:00');
        newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
        const newEnd = new Date(newStart.getTime() + (durationMs > 0 ? durationMs : 3 * 3600000));

        const patchRes = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events/' + encodeURIComponent(ev.id),
          {
            method: 'PATCH',
            headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start: { dateTime: newStart.toISOString(), timeZone: 'America/Los_Angeles' },
              end: { dateTime: newEnd.toISOString(), timeZone: 'America/Los_Angeles' },
            }),
          }
        );
        row.fixed = patchRes.ok;
        if (!patchRes.ok) { const pd = await patchRes.json(); row.patchError = (pd.error && pd.error.message) || 'unknown'; }
      }

      results.push(row);
    } catch (e) {
      results.push({ eventId: ev.id, summary: ev.summary, skipped: 'error: ' + e.message });
    }
  }

  const wrongCount = results.filter((r) => r.wrong).length;
  const fixedCount = results.filter((r) => r.fixed).length;
  return res.status(200).json({
    mode: confirm ? 'fix' : 'dry-run',
    scanned: subscriptionEvents.length,
    wrongCount,
    fixedCount,
    results,
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (req.body && req.body.adminAction === 'audit-subscription-calendar') {
    try {
      return await auditSubscriptionCalendar(req, res);
    } catch (err) {
      console.error('Calendar audit error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  const {
    orderId, customerName, phone, email,
    address, bundle, waterType, deliveryDate, deliveryWindow,
    startHour, endHour
  } = req.body || {};

  const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const CALENDAR_ID   = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return res.status(200).json({ ok: false, reason: 'not_configured' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type:    'refresh_token'
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error('Token error: ' + (tokenData.error || 'unknown'));

    const isAsap = !deliveryDate || deliveryDate === 'As Soon As Possible';
    /* startHour/endHour are optional. Callers whose delivery windows are named
       periods ("Morning (8am–12pm)") omit them and keep the 3-hour bucket
       below; callers with exact ranges ("10 AM – 12 PM") send the real hours
       so the event is blocked when the driver actually arrives. */
    const validHour = (h) => Number.isFinite(h) && h >= 0 && h <= 23;
    const startH = validHour(startHour) ? startHour
                 : deliveryWindow && deliveryWindow.includes('Morning')   ? 8
                 : deliveryWindow && deliveryWindow.includes('Afternoon') ? 12 : 16;
    const endH = validHour(endHour) && endHour > startH ? endHour : startH + 3;

    const base  = isAsap ? new Date() : new Date(deliveryDate + 'T00:00:00');
    const start = new Date(base); start.setHours(startH, 0, 0, 0);
    const end   = new Date(base); end.setHours(endH, 0, 0, 0);

    const event = {
      summary:  (isAsap ? '⚡ ASAP' : '📅 Delivery') + ' — ' + (customerName || '') + ' — ' + (address || ''),
      description: [
        'DELIVER TO: ' + (address      || '—'),
        'NAME: '       + (customerName || '—'),
        'PHONE: '      + (phone        || '—'),
        'EMAIL: '      + (email        || '—'),
        'ORDER: '      + (bundle       || '—') + ' (' + (waterType || '') + ')',
        'WINDOW: '     + (deliveryWindow || '—'),
        'ORDER ID: '   + (orderId      || '—'),
      ].join('\n'),
      location: address || '',
      start: { dateTime: start.toISOString(), timeZone: 'America/Los_Angeles' },
      end:   { dateTime: end.toISOString(),   timeZone: 'America/Los_Angeles' },
      colorId: '7',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 }
        ]
      }
    };

    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/' +
        encodeURIComponent(CALENDAR_ID) + '/events',
      {
        method: 'POST',
        headers: {
          Authorization:  'Bearer ' + tokenData.access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );
    const calData = await calRes.json();
    if (!calRes.ok) throw new Error((calData.error && calData.error.message) || 'Calendar API error');

    res.status(200).json({ ok: true, eventId: calData.id });
  } catch (err) {
    console.error('Calendar event error:', err.message);
    res.status(200).json({ ok: false, error: err.message });
  }
};
