(function () {
  'use strict';

  function cleanAssetUrl(value) {
    return (value || '').trim().replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  function isPriorityImage(img) {
    return Boolean(
      img.closest('.banner, .md-ban') ||
      img.matches('.md-prod-2 .big .swiper-slide:first-child img')
    );
  }

  function hydrateImages() {
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      var src = cleanAssetUrl(img.getAttribute('data-src'));
      if (!src) return;

      var priority = isPriorityImage(img);
      img.loading = priority ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (priority) img.fetchPriority = 'high';
      img.src = src;
      img.removeAttribute('data-src');
    });

    var backgrounds = Array.prototype.slice.call(
      document.querySelectorAll('[data-src]:not(img)')
    );

    function revealBackground(el) {
      var src = cleanAssetUrl(el.getAttribute('data-src'));
      if (src) el.style.backgroundImage = 'url("' + src + '")';
      el.removeAttribute('data-src');
    }

    if (!('IntersectionObserver' in window)) {
      backgrounds.forEach(revealBackground);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        revealBackground(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '900px 0px' });

    backgrounds.forEach(function (el) {
      observer.observe(el);
    });
  }

  function addSkipLink() {
    var main = document.querySelector('main, #main, .md-prod-1');
    if (!main || document.querySelector('.site-skip-link')) return;
    if (!main.id) main.id = 'main-content';

    var link = document.createElement('a');
    link.className = 'site-skip-link';
    link.href = '#' + main.id;
    link.textContent = 'Skip to main content';
    document.body.insertBefore(link, document.body.firstChild);
  }

  function addTrustBar() {
    if (document.body.classList.contains('home-page')) return;
    if (location.pathname === '/' || /\/index\.html$/.test(location.pathname)) return;
    if (document.querySelector('.site-trust-bar')) return;

    var anchor = document.querySelector('.md-ban');
    var fallback = document.querySelector('.md-prod-1, main, #main');
    if (!anchor && !fallback) return;

    var bar = document.createElement('aside');
    bar.className = 'site-trust-bar';
    bar.setAttribute('aria-label', 'Manufacturer credentials');
    bar.innerHTML =
      '<div class="site-trust-bar__inner">' +
        '<div class="site-trust-bar__item"><strong>Established 1999</strong><span>Wire shelving specialist</span></div>' +
        '<div class="site-trust-bar__item"><strong>80+ Export Markets</strong><span>Global OEM supply experience</span></div>' +
        '<div class="site-trust-bar__item"><strong>ISO · NSF · BSCI</strong><span>Audited manufacturing systems</span></div>' +
        '<div class="site-trust-bar__item"><strong>OEM / ODM Support</strong><span>Design, sampling and production</span></div>' +
        '<a class="site-trust-bar__cta" href="' + getRootPrefix() + 'contact.html">Request a Quote →</a>' +
      '</div>';

    if (anchor) {
      anchor.insertAdjacentElement('afterend', bar);
    } else {
      bar.classList.add('site-trust-bar--under-header');
      fallback.parentNode.insertBefore(bar, fallback);
    }
  }

  function getRootPrefix() {
    var path = location.pathname.replace(/^\//, '');
    if (!path || path === 'index.html') return '';
    var depth = path.split('/').length - 1;
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  function enhanceLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      link.setAttribute('rel', Array.from(rel).join(' '));
    });

    var current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.md-header .nav a[href]').forEach(function (link) {
      var href = (link.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop();
      if (href === current) link.setAttribute('aria-current', 'page');
    });
  }

  function normalizeContactDetails() {
    document.querySelectorAll('a[href*="phone=13802389591"]').forEach(function (link) {
      link.href = link.href.replace('phone=13802389591', 'phone=8613802389591');
    });
    document.querySelectorAll('a[href="tel:+13802389591"]').forEach(function (link) {
      link.href = 'tel:+8613802389591';
    });
  }

  function init() {
    document.documentElement.classList.add('site-foundation-ready');
    hydrateImages();
    addSkipLink();
    addTrustBar();
    enhanceLinks();
    normalizeContactDetails();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
