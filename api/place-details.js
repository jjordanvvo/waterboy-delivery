/* ============================================================
   place-details.js — Resolve a Google Place ID into a structured address
   GET ?placeId=<id> -> { ok, street, city, state, zip, lat, lng }
   Server-side proxy so GOOGLE_MAPS_API_KEY never reaches the browser.
   ============================================================ */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const KEY = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = (req.query.placeId || '').toString().trim();
  if (!KEY || !placeId) return res.status(200).json({ ok: false });

  try {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json'
      + '?place_id=' + encodeURIComponent(placeId)
      + '&fields=address_component,geometry'
      + '&key=' + KEY;
    const r = await fetch(url);
    const data = await r.json();
    if (data.status !== 'OK') return res.status(200).json({ ok: false });

    const comps = (data.result && data.result.address_components) || [];
    const get = (type) => {
      const c = comps.find((c) => c.types.includes(type));
      return c ? (c.short_name || c.long_name) : '';
    };
    const street = [get('street_number'), get('route')].filter(Boolean).join(' ');
    const city = get('locality') || get('sublocality') || get('postal_town');
    const state = get('administrative_area_level_1');
    const zip = get('postal_code');
    const loc = data.result.geometry && data.result.geometry.location;

    return res.status(200).json({
      ok: true, street, city, state, zip,
      lat: loc ? loc.lat : null,
      lng: loc ? loc.lng : null,
    });
  } catch (err) {
    return res.status(200).json({ ok: false });
  }
};
