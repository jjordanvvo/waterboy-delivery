/* ============================================================
   setup-stripe-products.js — Water Boy Delivery
   Creates every Stripe Product + Price (one-time water/add-ons
   and recurring monthly bundles) in your Stripe account.

   Run ONCE (safe to re-run — it's idempotent via lookup_key):

     1. npm install stripe
     2. STRIPE_SECRET_KEY=sk_live_xxx node scripts/setup-stripe-products.js

   On Windows PowerShell:
     $env:STRIPE_SECRET_KEY="sk_live_xxx"; node scripts/setup-stripe-products.js

   It prints a table of every price ID at the end. Prices use
   lookup_key so running again won't create duplicates.
   ============================================================ */

const Stripe = require('stripe');

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error('\n  ✗ Missing STRIPE_SECRET_KEY environment variable.\n');
  process.exit(1);
}
const stripe = Stripe(KEY);

/* ── Catalog (mirrors prices.js) ───────────────────────────── */
// One-time products: { key, name, amount(USD) }
const ONE_TIME = [
  { key: 'ro_5gal',        name: '5-Gallon RO Water',            amount: 11.99 },
  { key: 'ro_3gal',        name: '3-Gallon RO Water',            amount: 9.99  },
  { key: 'alkaline_5gal',  name: '5-Gallon Alkaline Water',      amount: 13.99 },
  { key: 'alkaline_3gal',  name: '3-Gallon Alkaline Water',      amount: 11.99 },
  { key: 'hydrogen_1gal',  name: '1-Gallon Hydrogen Water',      amount: 10.99 },
  { key: 'hydrogen_3gal',  name: '3-Gallon Hydrogen Water',      amount: 32.97 },
  // Add-ons
  { key: 'addon_lmnt_can',    name: 'LMNT Sparkling Electrolyte Can (16oz)', amount: 4.99  },
  { key: 'addon_lmnt_packet', name: 'LMNT Zero-Sugar Electrolyte Packets',   amount: 2.99  },
  { key: 'addon_zipfizz',     name: 'Zipfizz Energy Drink Mix (30-pack)',    amount: 39.99 },
  { key: 'addon_echo',        name: 'Echo Hydrogen Prebiotic Drink Mix',     amount: 4.99  },
  { key: 'addon_ice',         name: 'Ice Bag (10lb)',                        amount: 4.99  },
  // Dispensers
  { key: 'disp_brio_bottom',  name: 'Brio Bottom-Load Dispenser',            amount: 279.99 },
  { key: 'disp_brio_top',     name: 'Brio Top-Load Dispenser',               amount: 129.99 },
  // Bottle deposits
  { key: 'bottle_5gal_empty', name: '5-Gallon Bottle (Empty / Deposit)',     amount: 12.99 },
  { key: 'bottle_3gal_empty', name: '3-Gallon Bottle (Empty / Deposit)',     amount: 9.99  },
];

// Recurring monthly subscription bundles: { key, name, amount(USD) }
const MONTHLY = [
  { key: 'sub_ro_solo',       name: 'RO Solo Bundle (2×5-gal / mo)',        amount: 24.99  },
  { key: 'sub_ro_family',     name: 'RO Family Bundle (4×5-gal / mo)',      amount: 45.99  },
  { key: 'sub_ro_household',  name: 'RO Household Bundle (6×5-gal / mo)',   amount: 69.99  },
  { key: 'sub_ro_office',     name: 'RO Office Bundle (8×5-gal / mo)',      amount: 94.99  },
  { key: 'sub_ro_max',        name: 'RO Max Bundle (12×5-gal / mo)',        amount: 140.99 },
  { key: 'sub_alk_solo',      name: 'Alkaline Solo Bundle (2×5-gal / mo)',      amount: 27.99  },
  { key: 'sub_alk_family',    name: 'Alkaline Family Bundle (4×5-gal / mo)',    amount: 54.99  },
  { key: 'sub_alk_household', name: 'Alkaline Household Bundle (6×5-gal / mo)', amount: 74.99  },
  { key: 'sub_alk_office',    name: 'Alkaline Office Bundle (8×5-gal / mo)',    amount: 99.99  },
  { key: 'sub_alk_max',       name: 'Alkaline Max Bundle (12×5-gal / mo)',      amount: 149.99 },
];

/* ── Helpers ───────────────────────────────────────────────── */
async function findOrCreateProduct(key, name) {
  const found = await stripe.products.search({ query: `metadata['wb_key']:'${key}'`, limit: 1 });
  if (found.data.length) return found.data[0];
  return stripe.products.create({ name, metadata: { wb_key: key } });
}

async function findPriceByLookup(lookupKey) {
  const list = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
  return list.data[0] || null;
}

async function ensurePrice({ key, name, amount, recurring }) {
  const lookupKey = recurring ? `${key}_monthly` : `${key}_onetime`;
  const existing = await findPriceByLookup(lookupKey);
  if (existing) return { name, lookupKey, id: existing.id, reused: true };

  const product = await findOrCreateProduct(key, name);
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency: 'usd',
    lookup_key: lookupKey,
    ...(recurring ? { recurring: { interval: 'month' } } : {}),
  });
  return { name, lookupKey, id: price.id, reused: false };
}

/* ── Run ───────────────────────────────────────────────────── */
(async () => {
  const results = [];
  console.log('\n  Creating one-time products…');
  for (const p of ONE_TIME) results.push(await ensurePrice({ ...p, recurring: false }));
  console.log('  Creating monthly subscription bundles…');
  for (const p of MONTHLY) results.push(await ensurePrice({ ...p, recurring: true }));

  console.log('\n  ✓ Done. Price catalog:\n');
  console.log('  ' + 'LOOKUP KEY'.padEnd(26) + 'PRICE ID'.padEnd(34) + 'STATUS');
  console.log('  ' + '-'.repeat(72));
  for (const r of results) {
    console.log('  ' + r.lookupKey.padEnd(26) + r.id.padEnd(34) + (r.reused ? 'reused' : 'created'));
  }
  console.log('\n  Copy these price IDs into your checkout / subscription flow as needed.\n');
})().catch((err) => {
  console.error('\n  ✗ Error:', err.message, '\n');
  process.exit(1);
});
