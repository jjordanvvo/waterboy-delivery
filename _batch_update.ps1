param()
Set-Location "C:\Users\silly\Desktop\waterboy-delivery"

$files = @(
    "index.html","water-delivery.html","dispensers.html","bottle-pickup.html",
    "delivery-areas.html","shop.html","how-it-works.html","faq.html",
    "contact.html","about.html","compare.html","alkaline-water.html",
    "water-filtration.html","products.html"
)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# ── New sticky bar (LF-normalized) ──────────────────────────────────────────
$newBar = @"
<div id="wt-sticky-bar" role="navigation" aria-label="Water type selector">
  <span id="wt-bar-label">Water Type:</span>
  <button class="wt-bar-btn" data-type="regular" aria-pressed="false">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C6 8.5 4 12 4 15a8 8 0 0 0 16 0c0-3-2-6.5-8-13z"/></svg>
    Regular
  </button>
  <button class="wt-bar-btn" data-type="alkaline" aria-pressed="false">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    Alkaline <span class="wt-bar-badge">Only Us!</span>
  </button>
  <button class="wt-bar-btn" data-type="ro" aria-pressed="false">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/></svg>
    RO
  </button>
</div>
"@ -replace "`r`n","`n"

# ── New modal ────────────────────────────────────────────────────────────────
$newModal = @"
<div id="wt-modal" role="dialog" aria-modal="true" aria-labelledby="wt-modal-title">
  <div id="wt-modal-card">
    <div class="wt-modal-header-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6 8.5 4 12 4 15a8 8 0 0 0 16 0c0-3-2-6.5-8-13z"/></svg>
    </div>
    <h2 class="wt-modal-title" id="wt-modal-title">Choose Your Water</h2>
    <p class="wt-modal-sub">Tell us what you drink — we'll tailor pricing and recommendations just for you.</p>
    <div class="wt-modal-options">
      <div class="wt-modal-option" data-type="regular" role="button" tabindex="0" aria-label="Select Regular water">
        <div class="wt-modal-option-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6 8.5 4 12 4 15a8 8 0 0 0 16 0c0-3-2-6.5-8-13z"/></svg>
        </div>
        <div class="wt-modal-option-name">Regular</div>
        <div class="wt-modal-option-desc">Multi-stage purified · pH 7.0</div>
        <div class="wt-modal-option-price">From `$21/mo</div>
      </div>
      <div class="wt-modal-option wt-alkaline-opt" data-type="alkaline" role="button" tabindex="0" aria-label="Select Alkaline water">
        <span class="wt-modal-option-badge">Only Us!</span>
        <div class="wt-modal-option-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div class="wt-modal-option-name">Alkaline pH 8.5+</div>
        <div class="wt-modal-option-desc">Smooth taste · Fitness-ready</div>
        <div class="wt-modal-option-price">From `$25/mo</div>
      </div>
      <div class="wt-modal-option wt-ro-opt" data-type="ro" role="button" tabindex="0" aria-label="Select Reverse Osmosis water">
        <div class="wt-modal-option-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 3H2l8 9.46V19l4 2V12.46L22 3z"/></svg>
        </div>
        <div class="wt-modal-option-name">Reverse Osmosis</div>
        <div class="wt-modal-option-desc">Ultra-pure · 99% contaminants removed</div>
        <div class="wt-modal-option-price">Pricing TBD</div>
      </div>
    </div>
  </div>
</div>
"@ -replace "`r`n","`n"

# ── Left drawer block ────────────────────────────────────────────────────────
$leftDrawer = @"
<div id="left-drawer-overlay" class="left-drawer-overlay" aria-hidden="true"></div>
<aside id="left-drawer" class="left-drawer" role="dialog" aria-label="Site navigation" aria-modal="true" aria-hidden="true">
  <div class="left-drawer-header">
    <span class="left-drawer-title">Navigation</span>
    <button class="left-drawer-close" id="left-drawer-close" aria-label="Close navigation menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <nav class="left-drawer-nav" aria-label="Full site navigation">
    <div class="left-drawer-section">
      <div class="left-drawer-section-label">Shop &amp; Services</div>
      <a href="water-delivery.html" class="left-drawer-link">Water Delivery</a>
      <a href="dispensers.html" class="left-drawer-link">Dispensers</a>
      <a href="bottle-pickup.html" class="left-drawer-link">Bottle Pickup</a>
      <a href="shop.html" class="left-drawer-link">Shop Products</a>
      <a href="alkaline-water.html" class="left-drawer-link">Alkaline Water</a>
      <a href="reverse-osmosis-water.html" class="left-drawer-link">Reverse Osmosis Water</a>
    </div>
    <div class="left-drawer-section">
      <div class="left-drawer-section-label">Learn</div>
      <a href="how-it-works.html" class="left-drawer-link">How It Works</a>
      <a href="compare.html" class="left-drawer-link">Compare to Water.com</a>
      <a href="water-filtration.html" class="left-drawer-link">Water Filtration</a>
      <a href="delivery-areas.html" class="left-drawer-link">Service Area</a>
    </div>
    <div class="left-drawer-section">
      <div class="left-drawer-section-label">Company</div>
      <a href="about.html" class="left-drawer-link">About</a>
      <a href="contact.html" class="left-drawer-link">Contact</a>
      <a href="faq.html" class="left-drawer-link">FAQ</a>
    </div>
    <div class="left-drawer-section">
      <div class="left-drawer-section-label">Account</div>
      <a href="#" class="left-drawer-link" id="ld-signin-link">Sign In / Account</a>
      <a href="#" class="left-drawer-link" id="ld-cart-link">Cart</a>
    </div>
  </nav>
</aside>
"@ -replace "`r`n","`n"

# ── Regex patterns ───────────────────────────────────────────────────────────
$barPattern   = '(?s)<div id="wt-sticky-bar"[^>]*>.*?</div>'
$modalPattern = '(?s)<div id="wt-modal"[^>]*>[\s\S]*?\n    </div>\n  </div>\n</div>'
$opts = [System.Text.RegularExpressions.RegexOptions]::Singleline

# MatchEvaluators (return literals, no $ escaping needed)
$barEval   = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $newBar.TrimEnd("`n") }
$modalEval = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $newModal.TrimEnd("`n") }

foreach ($file in $files) {
    $path = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $path)) { Write-Host "SKIP (missing): $file"; continue }

    $c = [System.IO.File]::ReadAllText($path) -replace "`r`n","`n"
    $orig = $c

    # 1 — Sticky bar
    $c = [regex]::Replace($c, $barPattern, $barEval, $opts)

    # 2 — Modal
    $c = [regex]::Replace($c, $modalPattern, $modalEval, $opts)

    # 3 — Nav menu button (insert first child of <nav id="navbar">)
    if ($c -notmatch 'id="nav-menu-btn"') {
        $navTag = '<nav id="navbar" role="navigation" aria-label="Main navigation">'
        $navReplacement = $navTag + "`n" + '  <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open site navigation" aria-expanded="false" aria-controls="left-drawer">' + "`n" + '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' + "`n" + '    <span>Menu</span>' + "`n" + '  </button>'
        $c = $c.Replace($navTag, $navReplacement)
    }

    # 4 — More dropdown: add RO after FAQ li
    $c = $c.Replace(
        '<a href="faq.html">FAQ</a></li>',
        '<a href="faq.html">FAQ</a></li><li><a href="reverse-osmosis-water.html">Reverse Osmosis Water</a></li>'
    )

    # 5 — Mobile menu: add RO after FAQ link (before Contact Us)
    $c = $c.Replace(
        'faq.html">FAQ</a>' + "`n" + '  <a href="contact.html"',
        'faq.html">FAQ</a>' + "`n" + '  <a href="reverse-osmosis-water.html">Reverse Osmosis Water</a>' + "`n" + '  <a href="contact.html"'
    )

    # 6 — Footer Services: add RO after Alkaline Water link (multi-line footer)
    $c = $c.Replace(
        '<a href="alkaline-water.html">Alkaline Water</a>' + "`n" + '      </nav>',
        '<a href="alkaline-water.html">Alkaline Water</a>' + "`n" + '        <a href="reverse-osmosis-water.html">Reverse Osmosis Water</a>' + "`n" + '      </nav>'
    )
    # compact footer (no newline before </nav>)
    $c = $c.Replace(
        '<a href="alkaline-water.html">Alkaline Water</a></nav>',
        '<a href="alkaline-water.html">Alkaline Water</a><a href="reverse-osmosis-water.html">Reverse Osmosis Water</a></nav>'
    )

    # 7 — Add left-menu.js + shared.js before </body> (handle both compact and multi-line script tags)
    # Pattern A: inline script tags
    $c = $c.Replace(
        '<script src="water-type-selector.js"></script><script src="shared.js"></script>',
        '<script src="water-type-selector.js"></script><script src="left-menu.js"></script><script src="shared.js"></script>'
    )
    # Pattern B: one-per-line script tags
    $c = $c.Replace(
        '<script src="water-type-selector.js"></script>' + "`n" + '<script src="shared.js"></script>',
        '<script src="water-type-selector.js"></script>' + "`n" + '<script src="left-menu.js"></script>' + "`n" + '<script src="shared.js"></script>'
    )
    # Pattern C: products.html (no shared.js, just add both after wts)
    if ($file -eq 'products.html' -and ($c -notmatch 'left-menu\.js')) {
        $c = $c.Replace(
            '<script src="water-type-selector.js"></script>',
            '<script src="water-type-selector.js"></script>' + "`n" + '<script src="left-menu.js"></script>' + "`n" + '<script src="shared.js"></script>'
        )
    }

    # 8 — Left drawer before back-to-top button
    if ($c -notmatch 'id="left-drawer"') {
        # Try multi-line variant first
        $replaced = $c.Replace(
            "`n<button id=`"back-to-top`"",
            "`n" + $leftDrawer + "<button id=`"back-to-top`""
        )
        if ($replaced -ne $c) {
            $c = $replaced
        } else {
            # Compact variant
            $c = $c.Replace(
                '<button id="back-to-top"',
                $leftDrawer + '<button id="back-to-top"'
            )
        }
    }

    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($path, $c, $utf8NoBom)
        Write-Host "UPDATED: $file"
    } else {
        Write-Host "UNCHANGED: $file"
    }
}

Write-Host "`nBatch update complete."
