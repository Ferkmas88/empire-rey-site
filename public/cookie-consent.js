/*!
 * Empire Rey cookie consent banner + footer policy links injector
 * - Vanilla JS, no dependencies, <5KB.
 * - Bilingual (auto-detects <html lang> or falls back to ES).
 * - Stores choice in localStorage ("empire_cookie_consent").
 * - Exposes window.empireCookies.{ open, get, set, reset } for other code.
 * - Loads Google Analytics only after explicit analytics consent. GA id is
 *   configurable via window.EMPIRE_GA_ID before this script runs; when absent,
 *   no analytics is loaded.
 * - Skips banner on /admin* pages.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var STORAGE_KEY = 'empire_cookie_consent';
  var STORAGE_VERSION = 1;
  var path = (location.pathname || '/').toLowerCase();
  var isAdmin = path.indexOf('/admin') === 0;

  var lang = (document.documentElement.getAttribute('lang') || 'es').toLowerCase().split('-')[0];
  if (lang !== 'en' && lang !== 'es') lang = 'es';

  var COPY = {
    es: {
      title: 'Usamos cookies',
      body: 'Usamos cookies para mejorar tu experiencia y medir el rendimiento del sitio. Puedes aceptarlas, rechazarlas o configurarlas.',
      linkText: 'Ver pol\u00edtica de cookies',
      acceptAll: 'Aceptar todo',
      rejectAll: 'Rechazar',
      customize: 'Configurar',
      save: 'Guardar preferencias',
      close: 'Cerrar',
      necessaryTitle: 'Estrictamente necesarias',
      necessaryDesc: 'Requeridas para el funcionamiento del sitio. No se pueden desactivar.',
      analyticsTitle: 'Anal\u00edticas',
      analyticsDesc: 'Nos ayudan a entender c\u00f3mo se usa el sitio. Se cargan solo si las aceptas.',
      marketingTitle: 'Marketing',
      marketingDesc: 'Medir la efectividad de anuncios. Actualmente no activas.',
      footerPolicy: 'Pol\u00edtica de Privacidad',
      footerCookies: 'Pol\u00edtica de Cookies',
      footerTerms: 'T\u00e9rminos',
      footerManage: 'Preferencias de cookies'
    },
    en: {
      title: 'We use cookies',
      body: 'We use cookies to improve your experience and measure site performance. You can accept, reject or configure them.',
      linkText: 'See cookies policy',
      acceptAll: 'Accept all',
      rejectAll: 'Reject',
      customize: 'Configure',
      save: 'Save preferences',
      close: 'Close',
      necessaryTitle: 'Strictly necessary',
      necessaryDesc: 'Required for the site to work. Cannot be disabled.',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'Help us understand how the site is used. Loaded only if accepted.',
      marketingTitle: 'Marketing',
      marketingDesc: 'Measure ad effectiveness. Currently inactive.',
      footerPolicy: 'Privacy Policy',
      footerCookies: 'Cookies Policy',
      footerTerms: 'Terms',
      footerManage: 'Cookie preferences'
    }
  };
  var t = COPY[lang];

  // ---- Storage helpers ----
  function loadConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== STORAGE_VERSION) return null;
      return obj;
    } catch (e) { return null; }
  }
  function saveConsent(consent) {
    var obj = {
      v: STORAGE_VERSION,
      ts: new Date().toISOString(),
      necessary: true,
      analytics: !!consent.analytics,
      marketing: !!consent.marketing
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
    applyConsent(obj);
    return obj;
  }

  // ---- Apply (load GA if allowed) ----
  var gaLoaded = false;
  function applyConsent(consent) {
    if (consent && consent.analytics && !gaLoaded && window.EMPIRE_GA_ID) {
      gaLoaded = true;
      var id = window.EMPIRE_GA_ID;
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', id, { anonymize_ip: true });
    }
  }

  // ---- Styles (scoped, injected once) ----
  function injectStyles() {
    if (document.getElementById('empire-cc-styles')) return;
    var css = [
      '.empire-cc-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99998;display:none;}',
      '.empire-cc-backdrop.is-open{display:block;}',
      '.empire-cc-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:640px;margin:0 auto;background:#151515;color:#f0f0f0;border:1px solid rgba(212,175,55,.25);border-radius:10px;padding:18px 20px;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.5;z-index:99999;box-shadow:0 14px 40px rgba(0,0,0,.4);font-size:14px;}',
      '.empire-cc-banner h3{font-size:15px;font-weight:700;color:#d4af37;margin:0 0 6px;}',
      '.empire-cc-banner p{margin:0 0 12px;color:#cfcfcf;}',
      '.empire-cc-banner a.empire-cc-link{color:#d4af37;text-decoration:underline;}',
      '.empire-cc-actions{display:flex;flex-wrap:wrap;gap:8px;}',
      '.empire-cc-btn{cursor:pointer;border:1px solid transparent;border-radius:6px;padding:8px 14px;font-weight:600;font-size:13px;font-family:inherit;}',
      '.empire-cc-btn.primary{background:#d4af37;color:#000;border-color:#d4af37;}',
      '.empire-cc-btn.primary:hover{background:#b8941f;}',
      '.empire-cc-btn.ghost{background:transparent;color:#f0f0f0;border-color:rgba(255,255,255,.18);}',
      '.empire-cc-btn.ghost:hover{border-color:#d4af37;color:#d4af37;}',
      '.empire-cc-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:100000;padding:24px;}',
      '.empire-cc-modal.is-open{display:flex;}',
      '.empire-cc-modal__card{background:#0f0f0f;color:#f0f0f0;border:1px solid rgba(212,175,55,.25);border-radius:12px;max-width:520px;width:100%;padding:24px;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;max-height:90vh;overflow:auto;}',
      '.empire-cc-modal__card h3{color:#d4af37;font-size:18px;margin:0 0 12px;}',
      '.empire-cc-group{border-top:1px solid rgba(212,175,55,.15);padding:14px 0;display:flex;justify-content:space-between;gap:14px;align-items:flex-start;}',
      '.empire-cc-group:first-of-type{border-top:none;}',
      '.empire-cc-group h4{margin:0 0 4px;font-size:14px;color:#f0f0f0;}',
      '.empire-cc-group p{margin:0;font-size:12px;color:#a9a9a9;line-height:1.5;}',
      '.empire-cc-toggle{appearance:none;-webkit-appearance:none;width:38px;height:22px;background:#333;border-radius:999px;position:relative;cursor:pointer;border:none;flex:none;margin-top:2px;transition:background .15s;}',
      '.empire-cc-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .15s;}',
      '.empire-cc-toggle:checked{background:#d4af37;}',
      '.empire-cc-toggle:checked::after{transform:translateX(16px);}',
      '.empire-cc-toggle:disabled{opacity:.6;cursor:not-allowed;}',
      '.empire-cc-modal__actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;}',
      '.empire-cc-footer-links{display:flex;flex-wrap:wrap;gap:10px 14px;justify-content:center;margin:10px 0 0;font-size:12px;opacity:.85;}',
      '.empire-cc-footer-links a,.empire-cc-footer-links button{color:inherit;text-decoration:underline;background:none;border:none;padding:0;cursor:pointer;font:inherit;}',
      '.empire-cc-footer-links a:hover,.empire-cc-footer-links button:hover{color:#d4af37;}',
      '@media(max-width:520px){.empire-cc-banner{font-size:13px;padding:16px;}.empire-cc-btn{padding:7px 11px;font-size:12px;}}'
    ].join('');
    var style = document.createElement('style');
    style.id = 'empire-cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---- Banner ----
  var bannerEl, modalEl, backdropEl;
  function buildBanner() {
    if (bannerEl) return bannerEl;
    bannerEl = document.createElement('div');
    bannerEl.className = 'empire-cc-banner';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-live', 'polite');
    bannerEl.setAttribute('aria-label', t.title);
    bannerEl.innerHTML =
      '<h3>' + esc(t.title) + '</h3>' +
      '<p>' + esc(t.body) + ' <a class="empire-cc-link" href="/cookies-policy.html">' + esc(t.linkText) + '</a></p>' +
      '<div class="empire-cc-actions">' +
        '<button type="button" class="empire-cc-btn primary" data-cc="accept">' + esc(t.acceptAll) + '</button>' +
        '<button type="button" class="empire-cc-btn ghost" data-cc="reject">' + esc(t.rejectAll) + '</button>' +
        '<button type="button" class="empire-cc-btn ghost" data-cc="customize">' + esc(t.customize) + '</button>' +
      '</div>';
    bannerEl.addEventListener('click', function (e) {
      var action = e.target && e.target.getAttribute && e.target.getAttribute('data-cc');
      if (action === 'accept') { saveConsent({ analytics: true, marketing: true }); hideBanner(); }
      else if (action === 'reject') { saveConsent({ analytics: false, marketing: false }); hideBanner(); }
      else if (action === 'customize') { showModal(); }
    });
    return bannerEl;
  }

  function buildModal() {
    if (modalEl) return modalEl;
    backdropEl = document.createElement('div');
    backdropEl.className = 'empire-cc-backdrop';
    backdropEl.addEventListener('click', hideModal);

    modalEl = document.createElement('div');
    modalEl.className = 'empire-cc-modal';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.innerHTML =
      '<div class="empire-cc-modal__card">' +
        '<h3>' + esc(t.title) + '</h3>' +
        group('necessary', t.necessaryTitle, t.necessaryDesc, true, true) +
        group('analytics', t.analyticsTitle, t.analyticsDesc, false, false) +
        group('marketing', t.marketingTitle, t.marketingDesc, false, false) +
        '<div class="empire-cc-modal__actions">' +
          '<button type="button" class="empire-cc-btn ghost" data-cc="modal-reject">' + esc(t.rejectAll) + '</button>' +
          '<button type="button" class="empire-cc-btn ghost" data-cc="modal-accept">' + esc(t.acceptAll) + '</button>' +
          '<button type="button" class="empire-cc-btn primary" data-cc="modal-save">' + esc(t.save) + '</button>' +
        '</div>' +
      '</div>';
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) { hideModal(); return; }
      var action = e.target && e.target.getAttribute && e.target.getAttribute('data-cc');
      if (!action) return;
      var anaEl = modalEl.querySelector('input[data-cc-group="analytics"]');
      var mktEl = modalEl.querySelector('input[data-cc-group="marketing"]');
      if (action === 'modal-accept') {
        if (anaEl) anaEl.checked = true;
        if (mktEl) mktEl.checked = true;
        saveConsent({ analytics: true, marketing: true });
        hideModal(); hideBanner();
      } else if (action === 'modal-reject') {
        if (anaEl) anaEl.checked = false;
        if (mktEl) mktEl.checked = false;
        saveConsent({ analytics: false, marketing: false });
        hideModal(); hideBanner();
      } else if (action === 'modal-save') {
        saveConsent({ analytics: !!(anaEl && anaEl.checked), marketing: !!(mktEl && mktEl.checked) });
        hideModal(); hideBanner();
      }
    });
    return modalEl;
  }
  function group(key, title, desc, checked, locked) {
    return '<label class="empire-cc-group">' +
      '<div><h4>' + esc(title) + '</h4><p>' + esc(desc) + '</p></div>' +
      '<input class="empire-cc-toggle" type="checkbox" data-cc-group="' + esc(key) + '"' +
        (checked ? ' checked' : '') + (locked ? ' disabled' : '') + ' />' +
    '</label>';
  }
  function showBanner() {
    if (isAdmin) return;
    injectStyles();
    var b = buildBanner();
    if (!b.parentNode) document.body.appendChild(b);
    b.style.display = 'block';
  }
  function hideBanner() {
    if (bannerEl) bannerEl.style.display = 'none';
  }
  function showModal() {
    injectStyles();
    buildModal();
    if (!backdropEl.parentNode) document.body.appendChild(backdropEl);
    if (!modalEl.parentNode) document.body.appendChild(modalEl);
    var existing = loadConsent();
    var anaEl = modalEl.querySelector('input[data-cc-group="analytics"]');
    var mktEl = modalEl.querySelector('input[data-cc-group="marketing"]');
    if (anaEl) anaEl.checked = !!(existing && existing.analytics);
    if (mktEl) mktEl.checked = !!(existing && existing.marketing);
    backdropEl.classList.add('is-open');
    modalEl.classList.add('is-open');
  }
  function hideModal() {
    if (modalEl) modalEl.classList.remove('is-open');
    if (backdropEl) backdropEl.classList.remove('is-open');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  // ---- Footer policy links injector ----
  function injectFooterLinks() {
    var footers = document.querySelectorAll('footer.site-footer, footer');
    if (!footers.length) return;
    footers.forEach(function (footer) {
      if (footer.querySelector('.empire-cc-footer-links')) return; // already injected
      var nav = document.createElement('p');
      nav.className = 'empire-cc-footer-links';
      nav.innerHTML =
        '<a href="/privacy.html">' + esc(t.footerPolicy) + '</a>' +
        ' <span aria-hidden="true">|</span> ' +
        '<a href="/cookies-policy.html">' + esc(t.footerCookies) + '</a>' +
        ' <span aria-hidden="true">|</span> ' +
        '<a href="/terms.html">' + esc(t.footerTerms) + '</a>' +
        ' <span aria-hidden="true">|</span> ' +
        '<button type="button" data-cc="reopen">' + esc(t.footerManage) + '</button>';
      nav.addEventListener('click', function (e) {
        var action = e.target && e.target.getAttribute && e.target.getAttribute('data-cc');
        if (action === 'reopen') { e.preventDefault(); showModal(); }
      });
      footer.appendChild(nav);
    });
  }

  // ---- Public API ----
  window.empireCookies = {
    open: showModal,
    get: loadConsent,
    set: saveConsent,
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      showBanner();
    }
  };

  // ---- Boot ----
  function boot() {
    injectFooterLinks();
    var existing = loadConsent();
    if (existing) { applyConsent(existing); return; }
    showBanner();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
