# Waterboy Delivery — Website

**Pure Water. Delivered.**

## Files

| File | Purpose |
|------|---------|
| `index.html` | Complete single-page site |
| `styles.css` | All styles, animations, responsive |
| `script.js` | Loading screen, particles, ripple, scroll reveals, FAQ, counters |
| `netlify.toml` | Netlify deploy config + headers |
| `logo.png` | Company logo (place here) |
| `dispenser1.png` | Brio 430 bottom-load (hero + product card 1) |
| `dispenser2.png` | Brio Self-Cleaning filtration (product card 2) |
| `dispenser3.png` | Brio 400 classic (product card 3) |

## Before You Launch — Checklist

### 1. Add Your Images
Place these files in the project root (same folder as index.html):
- `logo.png` — your cartoon Waterboy logo
- `dispenser1.png` — Brio bottom-load (blue background)
- `dispenser2.png` — Brio filtration/stainless
- `dispenser3.png` — Brio 400 classic black/stainless

All images have graceful fallbacks if missing.

### 2. Replace All Placeholder Text
Search the HTML for `[` brackets — every placeholder is clearly marked:
- `[PHONE NUMBER HERE]`
- `[EMAIL HERE]`
- `[ADDRESS HERE]`
- `[SERVICE AREA HERE]`
- `[HOURS HERE]`
- `[PRICE TBD]` (appears on each pricing card and product card)
- Schema.org structured data at the top of index.html

### 3. Update Meta Tags
In `<head>` of index.html:
- Update `og:url` with your real domain
- Update Schema.org `"url"` field

## Deploy to Netlify (Drag & Drop — 60 seconds)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign in (or create a free account)
3. Click **"Add new site"** → **"Deploy manually"**
4. Drag the entire `waterboy-delivery` folder onto the page
5. Done — your site is live instantly

**To connect a custom domain:**
- In Netlify dashboard → Site settings → Domain management → Add custom domain

**Form submissions:**
- Contact form submissions appear in Netlify dashboard → Forms
- To get email notifications: Site settings → Forms → Form notifications → Add notification

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** → **"Browse"**
3. Select the `waterboy-delivery` folder
4. Framework: **Other**
5. Deploy

## Local Preview

Open `index.html` directly in your browser, or use a local server:
```
npx serve .
```

## Customization Notes

**Colors** — All colors are CSS custom properties in `styles.css` `:root`:
- Change `--cyan` to update the primary accent throughout
- Change `--bg-primary` for the main dark background

**Fonts** — Outfit (headlines), Inter (body), Space Mono (accents)
- All loaded from Google Fonts

**Pricing** — Search for `[PRICE TBD]` in index.html and replace with actual prices

**Loading animation** — Plays once per browser session (sessionStorage flag).
To disable: remove the loading screen div in index.html and the `initLoadingScreen` call in script.js.
