/* ============================================================
   places-autocomplete.js — Google Places address suggestions
   GET ?q=<partial address> -> { configured, predictions: [{placeId, main, sub}] }
   Server-side proxy so GOOGLE_MAPS_API_KEY never reaches the browser.
   Biased to the Elk Grove / Sacramento County service area.
   If GOOGLE_MAPS_API_KEY isn't set, returns { configured:false } so the
   client can fall back to the keyless OpenStreetMap autocomplete.
   ============================================================ */
const STORE_LAT = 38.4088;
const STORE_LNG = -121.4208;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!KEY) return res.status(200).json({ configured: false, predictions: [] });

  const q = (req.query.q || '').toString().trim();
  if (!q) return res.status(200).json({ configured: true, predictions: [] });

  try {
    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'
      + '?input=' + encodeURIComponent(q)
      + '&types=address'
      + '&components=country:us'
      + '&location=' + STORE_LAT + ',' + STORE_LNG
      + '&radius=40000'
      + '&key=' + KEY;
    const r = await fetch(url);
    const data = await r.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return res.status(200).json({ configured: true, predictions: [], error: data.status });
    }

    const predictions = (data.predictions || []).slice(0, 5).map((p) => ({
      placeId: p.place_id,
      main: (p.structured_formatting && p.structured_formatting.main_text) || p.description,
      sub: (p.structured_formatting && p.structured_formatting.secondary_text) || '',
    }));
    return res.status(200).json({ configured: true, predictions });
  } catch (err) {
    return res.status(200).json({ configured: true, predictions: [], error: 'request_failed' });
  }
};
