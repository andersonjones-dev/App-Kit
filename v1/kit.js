/*
 * App-Kit v1: the shared pieces every Anderson Jones app uses, kept in ONE file.
 * Fix something here once and every app gets it the next time it opens.
 *
 * Each app adds one tag per piece it wants, all pointing at this same file:
 *   <script src="/App-Kit/v1/kit.js" data-part="about"   data-app="App name" data-desc="..." data-fine="..." data-host="#app"></script>
 *   <script src="/App-Kit/v1/kit.js" data-part="install" data-app="App name" data-shrink="#app"></script>
 *   <script src="/App-Kit/v1/kit.js" data-part="update"  data-app="App name" data-sw="sw.js"></script>
 * (Apps hosted elsewhere, like ChurchOS, use the full address https://andersonjones-dev.github.io/App-Kit/v1/kit.js)
 *
 * The browser downloads the file once; each tag runs only the piece named in data-part.
 * Each app's sw.js saves this file for offline use and refreshes it in the background.
 * Breaking changes go in a new folder (v2) so older apps keep working.
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var part = me && me.getAttribute('data-part');
  var PARTS = {};

  /* ===================== about ===================== */
  /*
   * About + copyright (the same file in all of Anderson's apps).
   * ---------------------------------------------------------------
   * Adds AppAbout.open() and a ready-made "© 2026 Anderson Jones · About"
   * link. The panel matches The Odd Disciple's About: what the app is,
   * who designed it, the copyright line and a feedback email.
   *
   * Use:
   *   <script src="about.js" data-app="App name"
   *           data-desc="One sentence about the app."
   *           data-fine="Optional small print."
   *           data-host="#app"></script>          (data-host is optional)
   *
   * Put a link anywhere with:  AppAbout.linkHTML()   (an HTML string)
   *                       or:  AppAbout.link()       (a button element)
   * Any element with data-about-open also opens it.
   */
  PARTS['about'] = function (me) {
    var A = function (k, d) { return (me && me.getAttribute('data-' + k)) || d; };
    var NAME = A('app', document.title || 'This app');
    var DESC = A('desc', '');
    var FINE = A('fine', '');
    var HOST = A('host', '');
    var OWNER = 'Anderson Jones';
    var EMAIL = 'andy.andersonjones@gmail.com';
    var YEAR = '2026';
    var LINK_TEXT = '© ' + YEAR + ' ' + OWNER + ' · About';

    var box = null, lastFocus = null;

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function addStyles() {
      if (document.getElementById('abt-style')) return;
      var s = document.createElement('style');
      s.id = 'abt-style';
      s.textContent =
        '.abt-link{background:none;border:0;color:inherit;opacity:.62;font:inherit;font-size:12px;line-height:1.4;padding:10px;margin:2px auto 0;display:block;' +
        'text-decoration:underline;text-underline-offset:3px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
        '.abt-link:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:6px}' +
        '.abt-wrap{inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;' +
        'padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));' +
        'background:rgba(6,8,16,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:abt-fade .2s ease-out}' +
        '.abt-card{--abt-bg:#ffffff;--abt-fg:#1b1d26;--abt-mu:#6b6f80;--abt-ln:rgba(20,24,40,.12);--abt-ac:#2f5fd0;' +
        'position:relative;width:100%;max-width:420px;max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box;' +
        'background:var(--abt-bg);color:var(--abt-fg);border:1px solid var(--abt-ln);border-radius:22px;padding:22px 22px 18px;' +
        'box-shadow:0 24px 60px rgba(0,0,0,.35);font:15px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,"Segoe UI",Roboto,sans-serif;text-align:left;animation:abt-rise .25s cubic-bezier(.2,.9,.25,1)}' +
        '.abt-card.dark{--abt-bg:#151a2c;--abt-fg:#eef1ff;--abt-mu:#9aa3c7;--abt-ln:rgba(190,205,255,.16);--abt-ac:#8fb4ff}' +
        '.abt-card *{box-sizing:border-box}' +
        '.abt-x{position:absolute;top:8px;right:8px;width:44px;height:44px;border:0;background:none;color:var(--abt-mu);font-size:24px;line-height:1;cursor:pointer;border-radius:12px}' +
        '.abt-card h2{margin:0 44px 2px 0;font-size:21px;line-height:1.2;font-weight:800;color:var(--abt-fg)}' +
        '.abt-card h3{margin:16px 0 4px;font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--abt-mu)}' +
        '.abt-card p{margin:0 0 6px;color:var(--abt-fg)}' +
        '.abt-card .abt-desc{color:var(--abt-mu);margin-top:6px}' +
        '.abt-mail{display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
        '.abt-mail a{color:var(--abt-ac);font-weight:600;word-break:break-all}' +
        '.abt-copy{min-height:36px;padding:0 12px;border-radius:10px;border:1px solid var(--abt-ln);background:none;color:var(--abt-fg);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}' +
        '.abt-fine{margin-top:14px !important;padding-top:12px;border-top:1px solid var(--abt-ln);font-size:12.5px;color:var(--abt-mu) !important}' +
        '.abt-card button:focus-visible,.abt-card a:focus-visible{outline:2px solid var(--abt-ac);outline-offset:2px}' +
        '@keyframes abt-fade{from{opacity:0}}@keyframes abt-rise{from{opacity:0;transform:translateY(10px)}}' +
        '@media (prefers-reduced-motion:reduce){.abt-wrap,.abt-card{animation:none}}';
      document.head.appendChild(s);
    }

    // Light or dark panel, matching whatever the app is showing right now.
    function isDark(from) {
      for (var el = from; el && el.nodeType === 1; el = el.parentElement) {
        var c = getComputedStyle(el).backgroundColor;
        var m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
        if (m && (m[4] === undefined || +m[4] > 0.5)) return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) < 128;
      }
      try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
    }

    function close() {
      if (!box) return;
      box.remove(); box = null;
      document.removeEventListener('keydown', onKey, true);
      if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }

    function open() {
      if (box) return;
      addStyles();
      lastFocus = document.activeElement;
      var host = (HOST && document.querySelector(HOST)) || document.body;
      box = document.createElement('div');
      box.className = 'abt-wrap';
      box.style.position = host === document.body ? 'fixed' : 'absolute';
      box.innerHTML =
        '<div class="abt-card' + (isDark(lastFocus && lastFocus.nodeType === 1 ? lastFocus : host) ? ' dark' : '') + '" role="dialog" aria-modal="true" aria-labelledby="abt-title">' +
          '<button type="button" class="abt-x" aria-label="Close">×</button>' +
          '<h2 id="abt-title">' + esc(NAME) + '</h2>' +
          (DESC ? '<p class="abt-desc">' + esc(DESC) + '</p>' : '') +
          '<h3>Designed by</h3><p><b>' + OWNER + '</b></p>' +
          '<p>© ' + YEAR + ' ' + OWNER + '. All rights reserved.</p>' +
          '<h3>Feedback</h3><p>Would love to hear your feedback and suggestions. Thank you!</p>' +
          '<p class="abt-mail"><a href="mailto:' + EMAIL + '?subject=' + encodeURIComponent(NAME + ' feedback') + '">' + EMAIL + '</a>' +
          '<button type="button" class="abt-copy">Copy</button></p>' +
          (FINE ? '<p class="abt-fine">' + esc(FINE) + '</p>' : '') +
        '</div>';
      host.appendChild(box);
      box.addEventListener('click', function (e) {
        if (e.target === box || e.target.closest('.abt-x')) { close(); return; }
        var c = e.target.closest('.abt-copy');
        if (c) {
          var done = function () { c.textContent = 'Copied'; setTimeout(function () { if (c) c.textContent = 'Copy'; }, 1600); };
          try { navigator.clipboard.writeText(EMAIL).then(done, function () { c.textContent = EMAIL; }); }
          catch (err) { c.textContent = EMAIL; }
        }
      });
      document.addEventListener('keydown', onKey, true);
      box.querySelector('.abt-x').focus({ preventScroll: true });
    }

    function linkHTML(extraClass) {
      return '<button type="button" class="abt-link' + (extraClass ? ' ' + extraClass : '') + '" data-about-open>' + LINK_TEXT + '</button>';
    }
    function link(extraClass) {
      var t = document.createElement('div'); t.innerHTML = linkHTML(extraClass);
      return t.firstChild;
    }

    addStyles();
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-about-open]');
      if (t) { e.preventDefault(); open(); }
    });

    window.AppAbout = { open: open, close: close, link: link, linkHTML: linkHTML, text: LINK_TEXT };
  };

  /* ===================== install ===================== */
  /*
   * Install hint (the same file in all of Anderson's apps, except the songbook).
   * ---------------------------------------------------------------
   * Shows one slim line at the top of the page, only on a phone and only while
   * the app is opened in the browser: "Add this app to your Home Screen  How  X".
   * Tapping How opens three short steps for the person's phone (iPhone Safari
   * or Android Chrome). On Android phones that allow it there is also a
   * one-tap Install button.
   *
   * It never shows once the app is opened from the Home Screen, disappears for
   * good after the app is installed or the cross is tapped, and is not fixed
   * over the content (it sits in the page flow, so tab bars and buttons are
   * never covered).
   *
   * Use:  <script src="install.js" data-app="App name"></script>
   *       data-shrink="#app" (optional) for apps with a fixed screen height: the
   *                          element to shorten by the strip's height
   *       data-host="#app"   (optional) put the strip at the top of this element
   *                          instead of the top of <body>
   * Add install.js to the list of files cached in sw.js and bump VERSION.
   */
  PARTS['install'] = function (me) {
    var NAME = (me && me.getAttribute('data-app')) || 'this app';
    var HOST = (me && me.getAttribute('data-host')) || '';
    var SHRINK = (me && me.getAttribute('data-shrink')) || '';
    var KEY = 'install-hint-off:' + NAME;

    function store(get, v) {
      try { return get ? localStorage.getItem(KEY) : localStorage.setItem(KEY, v); } catch (e) { return null; }
    }
    try { if (window.self !== window.top) return; } catch (e) { return; }          // previews inside other pages
    if (!/^https?:$/.test(location.protocol)) return;

    var ua = navigator.userAgent || '';
    var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var android = /Android/.test(ua);
    if (!ios && !android) return;                                                  // phones and tablets only

    function installed() {
      try {
        return navigator.standalone === true ||
          (window.matchMedia && (matchMedia('(display-mode: standalone)').matches ||
            matchMedia('(display-mode: fullscreen)').matches ||
            matchMedia('(display-mode: minimal-ui)').matches));
      } catch (e) { return false; }
    }
    if (installed() || store(true)) return;

    var inApp = ios && /FBAN|FBAV|Instagram|WhatsApp|Line\/|Twitter|Snapchat|MicroMessenger/.test(ua);
    var deferred = null, strip = null, scrim = null, lastFocus = null;

    var ICON = {
      share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
      dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>',
      plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>'
    };
    function ic(n) { return '<span class="ih-ic">' + ICON[n] + '</span>'; }

    function addStyles() {
      if (document.getElementById('ih-style')) return;
      var s = document.createElement('style');
      s.id = 'ih-style';
      s.textContent =
        ':root{--ih-bg:#fff3d1;--ih-ink:#4f3c00;--ih-panel:#fff;--ih-text:#1d2a24;--ih-mute:#566159;--ih-line:#d7ddd8;--ih-acc:#2b6650;--ih-on:#fff;--ih-soft:#dfede5}' +
        '@media (prefers-color-scheme:dark){:root{--ih-bg:#3a2f10;--ih-ink:#f5dfa0;--ih-panel:#1b2420;--ih-text:#e8efea;--ih-mute:#a4b0a8;--ih-line:#2d3a33;--ih-acc:#7fcba8;--ih-on:#0f1a14;--ih-soft:#243a2e}}' +
        '.ih-strip{box-sizing:border-box;display:block;padding:max(8px,env(safe-area-inset-top,0px)) 12px 8px;flex:none;position:relative;z-index:5;width:100%}' +
        '.ih-in{box-sizing:border-box;display:flex;align-items:center;gap:4px;min-height:48px;padding:0 2px 0 14px;border-radius:14px;background:var(--ih-bg);color:var(--ih-ink);' +
        'font:600 13.5px/1.25 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}' +
        '.ih-strip *{box-sizing:border-box}' +
        '.ih-t{flex:1;min-width:0}' +
        '.ih-b{min-height:44px;padding:0 10px;border:0;background:none;color:inherit;font:800 13.5px/1 inherit;font-family:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
        '.ih-go{min-height:36px;padding:0 14px;border:0;border-radius:999px;background:var(--ih-acc);color:var(--ih-on);font:800 13px/1 inherit;font-family:inherit;cursor:pointer;text-decoration:none}' +
        '.ih-x{width:44px;height:44px;border:0;background:none;color:inherit;font-size:20px;line-height:1;cursor:pointer;border-radius:50%;flex:none;-webkit-tap-highlight-color:transparent}' +
        '.ih-in button:focus-visible,.ih-sheet button:focus-visible{outline:3px solid #b95f43;outline-offset:2px}' +
        '.ih-scrim{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}' +
        '.ih-sheet{box-sizing:border-box;width:100%;max-width:480px;background:var(--ih-panel);color:var(--ih-text);border-radius:26px 26px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));' +
        'display:flex;flex-direction:column;gap:12px;font:400 15px/1.35 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;animation:ih-up .25s ease-out}' +
        '.ih-tag{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ih-acc);background:var(--ih-soft);border-radius:999px;padding:3px 9px}' +
        '.ih-sheet h3{margin:0;font-size:19px;line-height:1.2;letter-spacing:-.01em;font-weight:800}' +
        '.ih-sheet ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;counter-reset:s}' +
        '.ih-sheet li{display:flex;gap:12px;align-items:center;counter-increment:s}' +
        '.ih-sheet li:before{content:counter(s);flex:none;width:28px;height:28px;border-radius:50%;background:var(--ih-soft);color:var(--ih-acc);display:grid;place-items:center;font-weight:800;font-size:14px}' +
        '.ih-ic{display:inline-flex;vertical-align:-5px;width:22px;height:22px;color:var(--ih-acc)}' +
        '.ih-ic svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
        '.ih-note{margin:0;font-size:12.5px;color:var(--ih-mute)}' +
        '.ih-row{display:flex;gap:8px;margin-top:2px}' +
        '.ih-row button{flex:1;min-height:48px;border-radius:14px;border:1.5px solid var(--ih-line);background:none;color:var(--ih-text);font:700 14px/1 inherit;font-family:inherit;cursor:pointer}' +
        '.ih-row .ih-p{background:var(--ih-acc);color:var(--ih-on);border-color:var(--ih-acc)}' +
        '@keyframes ih-up{from{transform:translateY(30px);opacity:0}}' +
        '@media (prefers-reduced-motion:reduce){.ih-sheet{animation:none}}';
      document.head.appendChild(s);
    }

    function remove() {
      if (strip && strip.parentNode) strip.parentNode.removeChild(strip);
      strip = null; closeSheet(true); shrink();
    }
    function never() { store(false, '1'); remove(); }

    function build() {
      if (strip || installed()) return;
      addStyles();
      strip = document.createElement('div');
      strip.className = 'ih-strip';
      strip.setAttribute('role', 'note');
      paint();
      var host = (HOST && document.querySelector(HOST)) || document.body;
      host.insertBefore(strip, host.firstChild);
      shrink();
    }

    // Apps with a fixed screen height: make room for the strip so nothing slides off the bottom.
    function shrink() {
      var st = document.getElementById('ih-shrink');
      if (!SHRINK || !strip) { if (st && st.parentNode) st.parentNode.removeChild(st); return; }
      var h = strip.offsetHeight, el = document.querySelector(SHRINK);
      if (!el) return;
      var pos = getComputedStyle(el).position, fixed = pos === 'fixed' || pos === 'absolute';
      if (!st) { st = document.createElement('style'); st.id = 'ih-shrink'; document.head.appendChild(st); }
      st.textContent = SHRINK + '{' + (fixed ? 'top:' + h + 'px!important;' : '') + 'height:calc(100dvh - ' + h + 'px)!important;max-height:calc(100dvh - ' + h + 'px)!important}';
    }

    function paint() {
      if (!strip) return;
      var lead = ios ? 'Add this app to your Home Screen' : 'Install this app on your phone';
      var main = (android && deferred)
        ? '<button class="ih-go" type="button" data-ih="install">Install</button><button class="ih-b" type="button" data-ih="how" aria-label="Show steps">Steps</button>'
        : '<button class="ih-b" type="button" data-ih="how">How</button>';
      strip.innerHTML = '<div class="ih-in"><span class="ih-t">' + lead + '</span>' + main +
        '<button class="ih-x" type="button" data-ih="never" aria-label="Hide this for good">✕</button>';
    }

    function steps() {
      if (ios) {
        return {
          tag: 'iPhone · Safari',
          li: ['Tap ' + ic('share') + ' <b>Share</b> at the bottom of Safari',
               'Scroll down and tap ' + ic('plus') + ' <b>Add to Home Screen</b>',
               'Tap <b>Add</b>. The app icon appears on your Home Screen.'],
          note: inApp ? 'Open this page in Safari first, then follow these steps.' : 'Not seeing Share? Open this page in Safari first.'
        };
      }
      return {
        tag: 'Android · Chrome',
        li: ['Tap the ' + ic('dots') + ' <b>menu</b> at the top right of Chrome',
             'Tap <b>Install app</b> (or <b>Add to Home screen</b>)',
             'Tap <b>Install</b>. The app icon appears on your Home Screen.'],
        note: 'Your phone may also show an Install button on this page.'
      };
    }

    function openSheet() {
      if (scrim) return;
      lastFocus = document.activeElement;
      var d = steps();
      scrim = document.createElement('div');
      scrim.className = 'ih-scrim';
      scrim.innerHTML = '<div class="ih-sheet" role="dialog" aria-modal="true" aria-labelledby="ih-h"><span class="ih-tag">' + d.tag + '</span>' +
        '<h3 id="ih-h">Add ' + NAME.replace(/</g, '&lt;') + ' in 3 taps</h3><ol>' +
        d.li.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('') +
        '</ol><p class="ih-note">' + d.note + '</p><div class="ih-row"><button type="button" data-ih="later">Maybe later</button><button type="button" class="ih-p" data-ih="never">Got it, hide this</button></div></div>';
      document.body.appendChild(scrim);
      var f = scrim.querySelector('.ih-p'); if (f) f.focus();
    }
    function closeSheet(quiet) {
      if (!scrim) return;
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      scrim = null;
      if (!quiet && lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    }

    function install() {
      if (!deferred) { openSheet(); return; }
      var e = deferred; deferred = null;
      try {
        e.prompt();
        if (e.userChoice) e.userChoice.then(function (c) { if (c && c.outcome === 'accepted') remove(); else paint(); });
      } catch (x) { paint(); openSheet(); }
    }

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (scrim && t === scrim) { closeSheet(); return; }
      var b = t && t.closest ? t.closest('[data-ih]') : null;
      if (!b) return;
      var a = b.getAttribute('data-ih');
      if (a === 'how') openSheet();
      else if (a === 'install') install();
      else if (a === 'later') closeSheet();
      else if (a === 'never') never();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && scrim) closeSheet(); });

    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; paint(); });
    window.addEventListener('appinstalled', function () { store(false, '1'); remove(); });
    try {
      var mq = matchMedia('(display-mode: standalone)');
      var on = function (m) { if (m.matches) remove(); };
      if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on);
    } catch (e) {}

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
  };

  /* ===================== update ===================== */
  /*
   * Update bar (the same file in all of Anderson's apps).
   * ---------------------------------------------------------------
   * When a new version is published on GitHub (VERSION changed in sw.js),
   * the app shows "A new version of <name> is ready" with an Update button.
   * Nothing changes until Update is tapped, so it never interrupts work in
   * progress. The app checks for updates when it opens and every time you
   * come back to it.
   *
   * Use:  <script src="update.js" data-app="App name"></script>
   * Needs sw.js to: not call skipWaiting() on install, and call it when it
   * receives the message {type: 'SKIP_WAITING'}.
   */
  PARTS['update'] = function (me) {
    var NAME = (me && me.getAttribute('data-app')) || 'this app';
    var SW = (me && me.getAttribute('data-sw')) || 'sw.js';
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    try { if (window.self !== window.top) return; } catch (e) { return; } // previews inside other pages

    var wanted = false;     // reload only after the person tapped Update
    var bar = null;
    var snoozed = false;    // "Later" hides it until the next time the app is opened
    var lastCheck = 0;

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (wanted) { wanted = false; location.reload(); }
    });

    function addStyles() {
      if (document.getElementById('upd-style')) return;
      var s = document.createElement('style');
      s.id = 'upd-style';
      s.textContent =
        '.upd-bar{position:fixed;left:50%;top:max(12px,calc(env(safe-area-inset-top,0px) + 20px));transform:translateX(-50%);' +
        'z-index:2147483000;display:flex;align-items:center;gap:6px;width:max-content;max-width:calc(100% - 24px);' +
        'padding:6px 4px 6px 16px;border-radius:18px;background:#141a2e;color:#f3f5ff;' +
        'box-shadow:0 12px 36px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.08);' +
        'font:600 14px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;animation:upd-in .3s ease-out}' +
        '.upd-text{min-width:0}' +
        '.upd-go{flex:none;min-height:44px;padding:0 16px;border:0;border-radius:13px;background:#f3f5ff;color:#141a2e;' +
        'font:800 14px/1 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;cursor:pointer}' +
        '.upd-go:disabled{opacity:.7}' +
        '.upd-x{flex:none;width:44px;height:44px;border:0;background:none;color:#9aa3c7;font-size:22px;line-height:1;cursor:pointer}' +
        '.upd-go:focus-visible,.upd-x:focus-visible{outline:3px solid #8fb4ff;outline-offset:2px}' +
        '@keyframes upd-in{from{opacity:0;transform:translate(-50%,-8px)}}' +
        '@media (prefers-reduced-motion:reduce){.upd-bar{animation:none}}';
      document.head.appendChild(s);
    }

    function show(reg) {
      if (bar || snoozed) return;
      addStyles();
      bar = document.createElement('div');
      bar.className = 'upd-bar';
      bar.setAttribute('role', 'status');
      bar.innerHTML = '<span class="upd-text"></span><button type="button" class="upd-go">Update</button>' +
        '<button type="button" class="upd-x" aria-label="Not now">×</button>';
      bar.querySelector('.upd-text').textContent = 'A new version of ' + NAME + ' is ready.';
      bar.querySelector('.upd-go').addEventListener('click', function () {
        var w = reg.waiting;
        if (!w) { location.reload(); return; }
        wanted = true;
        this.disabled = true;
        this.textContent = 'Updating…';
        w.postMessage({ type: 'SKIP_WAITING' });
        setTimeout(function () { if (wanted) location.reload(); }, 4000); // safety net
      });
      bar.querySelector('.upd-x').addEventListener('click', function () {
        snoozed = true;
        if (bar) { bar.remove(); bar = null; }
      });
      document.body.appendChild(bar);
    }

    function watch(reg) {
      var ready = function () { return reg.waiting && navigator.serviceWorker.controller; };
      if (ready()) show(reg);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) show(reg);
        });
      });
      function check() {
        var now = Date.now();
        if (now - lastCheck < 30000) return;
        lastCheck = now;
        reg.update().catch(function () {});
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { snoozed = false; return; }
        check();
        if (ready()) show(reg);
      });
      setInterval(check, 30 * 60 * 1000);
    }

    function start() {
      navigator.serviceWorker.register(SW).then(watch).catch(function () {});
    }
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start);
  };

  if (PARTS[part]) PARTS[part](me);
})();
