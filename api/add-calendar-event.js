export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    orderId, customerName, phone, email,
    address, bundle, waterType, deliveryDate, deliveryWindow
  } = req.body || {};

  const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
  const CALENDAR_ID   = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return res.status(200).json({ ok: false, reason: 'not_configured' });
  }

  // Only create a real calendar event for scheduled deliveries
  const isAsap = !deliveryDate || deliveryDate === 'As Soon As Possible';

  try {
    // Exchange refresh token for access token
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

    // Build event start / end in Pacific time
    const startH = deliveryWindow && deliveryWindow.includes('Morning')   ? 8
                 : deliveryWindow && deliveryWindow.includes('Afternoon') ? 12 : 16;
    const endH   = startH + 3;

    // For ASAP we still log it as "today" but mark it clearly
    const base  = isAsap ? new Date() : new Date(deliveryDate + 'T00:00:00');
    const start = new Date(base); start.setHours(startH, 0, 0, 0);
    const end   = new Date(base); end.setHours(endH,   0, 0, 0);

    const windowLabel = deliveryWindow && deliveryWindow.includes('Morning')   ? 'Morning (8am–11am)'
                      : deliveryWindow && deliveryWindow.includes('Afternoon') ? 'Afternoon (12pm–3pm)'
                      : 'Evening (4pm–7pm)';

    const desc = [
      '📋 Order ID: '  + (orderId      || '—'),
      '👤 Customer: '  + (customerName || '—'),
      '📞 Phone: '     + (phone        || '—'),
      '📧 Email: '     + (email        || '—'),
      '📍 Address: '   + (address      || '—'),
      '💧 Bundle: '    + (bundle       || '—'),
      '🕐 Window: '    + windowLabel,
      isAsap ? '⚡ Delivery: ASAP (today)' : '📅 Date: ' + deliveryDate,
    ].join('\n');

    // Attendees: customer gets a calendar invite; business org is the organizer
    const attendees = [];
    if (email && email.includes('@')) {
      attendees.push({ email, displayName: customerName || '', responseStatus: 'accepted' });
    }

    const event = {
      summary:     '💧 ' + (bundle || 'Delivery') + ' — ' + (customerName || ''),
      description: desc,
      location:    address || '',
      start: { dateTime: start.toISOString(), timeZone: 'America/Los_Angeles' },
      end:   { dateTime: end.toISOString(),   timeZone: 'America/Los_Angeles' },
      colorId:   '7',
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // day-before email
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 }
        ]
      }
    };

    // sendUpdates='all' makes Google send the customer a calendar invite email
    const calRes = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/' +
        encodeURIComponent(CALENDAR_ID) + '/events?sendUpdates=all',
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

    res.status(200).json({ ok: true, eventId: calData.id, invited: attendees.length > 0 });
  } catch (err) {
    console.error('Calendar event error:', err.message);
    res.status(200).json({ ok: false, error: err.message });
  }
}