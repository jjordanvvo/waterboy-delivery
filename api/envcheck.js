// TEMPORARY diagnostic — reports only booleans, never any secret value. Remove after use.
module.exports = (req, res) => {
  const keys = Object.keys(process.env);
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    STRIPE_SECRET_KEY_present: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_SECRET_KEY_prefix: (process.env.STRIPE_SECRET_KEY || '').slice(0, 8), // e.g. "sk_live_" — confirms it's a real key, not the whole secret
    a_var_is_misnamed_as_the_key: keys.some(k => k.startsWith('sk_live') || k.startsWith('sk_test')),
    google_calendar_present: !!process.env.GOOGLE_REFRESH_TOKEN,
    // count of user-defined (non-system) env vars, to confirm anything is set at all
    user_env_var_count: keys.filter(k => k === k.toUpperCase() && !k.startsWith('VERCEL') && !k.startsWith('AWS') && !k.startsWith('LAMBDA') && !k.startsWith('_')).length
  });
};
