$enc = New-Object System.Text.UTF8Encoding($false)
$baseDir = 'C:\Users\silly\Desktop\waterboy-delivery'

$files = @(
  'index.html','water-delivery.html','alkaline-water.html','bottle-pickup.html',
  'contact.html','delivery-areas.html','dispensers.html','faq.html',
  'how-it-works.html','products.html','reverse-osmosis-water.html',
  'shop.html','water-filtration.html','about.html'
)

$newNavbar = @'
<nav id="navbar" role="navigation" aria-label="Main navigation">
  <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open site navigation" aria-expanded="false" aria-controls="left-drawer">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    <span>Menu</span>
  </button>
  <a href="index.html" class="nav-logo" aria-label="Waterboy Delivery home">
    <img src="logo.png" alt="Waterboy Delivery logo" onerror="this.style.display='none'" />
  </a>
  <div class="nav-wt-pills" role="group" aria-label="Water type selector">
    <button class="nav-wt-btn" data-type="ro" aria-pressed="false">RO</button>
    <button class="nav-wt-btn" data-type="alkaline" aria-pressed="false">Alkaline</button>
    <button class="nav-wt-btn" data-type="hydrogen" aria-pressed="false">Hydrogen</button>
  </div>
  <ul class="nav-links" role="list" style="list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:8px;"></ul>
</nav>
'@

$newDrawer = @'
<div id="left-drawer-overlay" class="left-drawer-overlay" aria-hidden="true"></div>
<aside id="left-drawer" class="left-drawer" role="dialog" aria-label="Site navigation" aria-modal="true" aria-hidden="true">
  <div class="left-drawer-header">
    <span class="left-drawer-title">Navigation</span>
    <button class="left-drawer-close" id="left-drawer-close" aria-label="Close navigation menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <nav class="left-drawer-nav" aria-label="Full site navigation">
    <a href="index.html" class="left-drawer-link">Home</a>
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
'@

$newFooterLearn = @'
      <nav class="footer-links" aria-label="Info links">
        <a href="how-it-works.html">How It Works</a>
        <a href="water-filtration.html">Water Filtration</a>
        <a href="faq.html">FAQ</a>
        <a href="about.html">About Us</a>
        <a href="contact.html">Contact</a>
      </nav>
'@

$script:nb = $newNavbar
$script:dr = $newDrawer
$script:fl = $newFooterLearn

$nbEval = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $script:nb }
$drEval = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $script:dr }
$flEval = [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $script:fl }

$optsMS = [System.Text.RegularExpressions.RegexOptions]::Singleline -bor [System.Text.RegularExpressions.RegexOptions]::Multiline
$optsS  = [System.Text.RegularExpressions.RegexOptions]::Singleline

foreach ($fname in $files) {
  $path = Join-Path $baseDir $fname
  if (-not (Test-Path $path)) { Write-Host "SKIP: $fname"; continue }

  $c = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $orig = $c

  # 1. Remove sticky bar (no nested divs inside)
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?s)<div id="wt-sticky-bar"[^>]*>.*?</div>', '', $optsS)

  # 2. Remove modal (^</div> matches outer close at col-0)
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?ms)<div id="wt-modal"[^>]*>.*?^</div>', '', $optsMS)

  # 3. Replace navbar
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?ms)<nav id="navbar"[^>]*>.*?^</nav>', $nbEval, $optsMS)

  # 4. Remove mobile menu
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?ms)\n<div id="mobile-menu"[^>]*>.*?^</div>', '', $optsMS)

  # 5. Replace left drawer overlay + aside
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?ms)<div id="left-drawer-overlay".*?^</aside>', $drEval, $optsMS)

  # 6. Replace footer Learn nav
  $c = [System.Text.RegularExpressions.Regex]::Replace($c,
    '(?s)<nav class="footer-links" aria-label="Info links">.*?</nav>', $flEval, $optsS)

  # 7. Rename water type values: regular -> hydrogen
  $c = $c.Replace('data-type="regular"',    'data-type="hydrogen"')
  $c = $c.Replace("data-type='regular'",    "data-type='hydrogen'")
  $c = $c.Replace('data-panel="regular"',   'data-panel="hydrogen"')
  $c = $c.Replace('id="panel-regular"',     'id="panel-hydrogen"')
  $c = $c.Replace('aria-controls="panel-regular"', 'aria-controls="panel-hydrogen"')
  $c = $c.Replace('"Select Regular water"', '"Select Hydrogen water"')

  # 8. Remove compare.html links
  $c = $c.Replace('<a href="compare.html">vs Water.com</a>', '')
  $c = $c.Replace('<a href="compare.html">Compare to Water.com</a>', '')
  $c = $c.Replace('<li><a href="compare.html">vs Water.com</a></li>', '')
  $c = $c.Replace('<li><a href="compare.html">Compare to Water.com</a></li>', '')

  # 9. Clean orphaned comment markers
  $c = $c.Replace('<!-- WATER TYPE STICKY BAR -->', '')
  $c = $c.Replace('<!-- WATER TYPE MODAL -->', '')
  $c = $c.Replace('<!-- Mobile menu -->', '')

  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($path, $c, $enc)
    Write-Host "UPDATED: $fname"
  } else {
    Write-Host "NO CHANGE: $fname"
  }
}
Write-Host 'Done.'
