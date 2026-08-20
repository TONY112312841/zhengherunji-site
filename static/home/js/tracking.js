(function () {
  'use strict';

  var STORAGE_KEY = 'zhrj_analytics_consent';
  var analyticsLoaded = false;

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'AW-777621748', { allow_google_signals: false });
    window.gtag('config', 'G-8B696YTE56', { anonymize_ip: true });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-8B696YTE56';
    document.head.appendChild(script);

    document.addEventListener('click', function (event) {
      var whatsapp = event.target.closest('[href*="whatsapp.com"], [href*="wa.me"]');
      var email = event.target.closest('[href^="mailto:"]');
      if (whatsapp) window.gtag('event', 'contact_whatsapp');
      if (email) window.gtag('event', 'contact_email');
    });
  }

  function saveChoice(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* Storage may be unavailable. */ }
    if (value === 'accepted') loadAnalytics();
  }

  function readChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (error) { return null; }
  }

  function openPreferences() {
    var existing = document.querySelector('.site-consent');
    if (existing) {
      existing.hidden = false;
      existing.querySelector('.site-consent__accept').focus();
      return;
    }

    var banner = document.createElement('aside');
    banner.className = 'site-consent';
    banner.setAttribute('aria-label', 'Analytics preferences');
    banner.innerHTML =
      '<div class="site-consent__copy"><strong>Your privacy choices</strong>' +
      '<span>We use optional, privacy-conscious analytics to improve this international website. Essential contact features work without analytics.</span></div>' +
      '<div class="site-consent__actions"><button type="button" class="site-consent__decline">Decline</button>' +
      '<button type="button" class="site-consent__accept">Allow analytics</button></div>';
    document.body.appendChild(banner);

    banner.querySelector('.site-consent__decline').addEventListener('click', function () {
      saveChoice('declined');
      banner.hidden = true;
    });
    banner.querySelector('.site-consent__accept').addEventListener('click', function () {
      saveChoice('accepted');
      banner.hidden = true;
    });
  }

  function addPreferencesLink() {
    if (document.querySelector('.site-cookie-preferences')) return;
    var footer = document.querySelector('.md-footer .foot-2 .tx, .md-footer .copyright');
    if (!footer) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'site-cookie-preferences';
    button.textContent = 'Cookie preferences';
    button.addEventListener('click', openPreferences);
    footer.appendChild(document.createTextNode(' · '));
    footer.appendChild(button);
  }

  function init() {
    var choice = readChoice();
    if (choice === 'accepted') loadAnalytics();
    if (!choice) openPreferences();
    addPreferencesLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
