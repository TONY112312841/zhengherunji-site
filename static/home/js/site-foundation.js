(function () {
  'use strict';

  var CONTACT_NUMBER = '8618632666061';
  var CONTACT_TEL = '+8618632666061';
  var CONTACT_DISPLAY = '+86 186 3266 6061';

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
      img.fetchPriority = priority ? 'high' : 'low';
      img.src = src;
      img.removeAttribute('data-src');
    });

    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      var priority = isPriorityImage(img);
      img.loading = priority ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.fetchPriority = priority ? 'high' : 'low';
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
    var main = document.querySelector('main, #main, .md-prod-1, .section');
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
        '<div class="site-trust-bar__item"><strong>ISO · NSF · BSCI</strong><span>Documentation available for review</span></div>' +
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
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (/whatsapp\.com|wa\.me/i.test(href)) {
        href = href
          .replace(/(phone=)(?:86)?13802389591/i, '$1' + CONTACT_NUMBER)
          .replace(/(wa\.me\/)(?:86)?13802389591/i, '$1' + CONTACT_NUMBER);
        link.setAttribute('href', href);
      }
      if (/^tel:\+?(?:86)?13802389591$/i.test(href)) {
        link.setAttribute('href', 'tel:' + CONTACT_TEL);
      }
    });

    document.querySelectorAll('[data-contact-phone]').forEach(function (el) {
      el.textContent = CONTACT_DISPLAY;
    });
  }

  function enhanceProductImages() {
    var productName = document.title.replace(/\s+/g, ' ').trim();
    if (!productName) return;

    document.querySelectorAll('.md-prod-2 img, .md-prod-3 img').forEach(function (img, index) {
      if (!img.getAttribute('alt') && !/static\/home\/images/i.test(img.currentSrc || img.src || '')) {
        img.alt = productName + (index ? ' — detail ' + (index + 1) : ' — product view');
      }
    });
  }

  function initCertificateGallery() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.app-case-grid .case_box'));
    if (!cards.length) return;

    var dialog = document.createElement('div');
    dialog.className = 'site-lightbox';
    dialog.hidden = true;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'site-lightbox-title');
    dialog.innerHTML =
      '<div class="site-lightbox__panel" role="document">' +
        '<div class="site-lightbox__toolbar">' +
          '<div><strong id="site-lightbox-title"></strong><span class="site-lightbox__counter" aria-live="polite"></span></div>' +
          '<button type="button" class="site-lightbox__close">Close</button>' +
        '</div>' +
        '<div class="site-lightbox__stage">' +
          '<button type="button" class="site-lightbox__nav site-lightbox__prev">Previous</button>' +
          '<img class="site-lightbox__image" alt="">' +
          '<button type="button" class="site-lightbox__nav site-lightbox__next">Next</button>' +
        '</div>' +
        '<p class="site-lightbox__hint">Use the arrow keys to browse. Press Esc to close.</p>' +
      '</div>';
    document.body.appendChild(dialog);

    var image = dialog.querySelector('.site-lightbox__image');
    var title = dialog.querySelector('#site-lightbox-title');
    var counter = dialog.querySelector('.site-lightbox__counter');
    var closeButton = dialog.querySelector('.site-lightbox__close');
    var previousButton = dialog.querySelector('.site-lightbox__prev');
    var nextButton = dialog.querySelector('.site-lightbox__next');
    var activeIndex = 0;
    var returnFocus = null;

    function render(index) {
      activeIndex = (index + cards.length) % cards.length;
      var source = cards[activeIndex].querySelector('img');
      var label = source.getAttribute('alt') || 'Certification document';
      image.src = source.currentSrc || source.src;
      image.alt = label + ' document preview';
      title.textContent = label;
      counter.textContent = (activeIndex + 1) + ' of ' + cards.length;
    }

    function open(index, trigger) {
      returnFocus = trigger;
      render(index);
      dialog.hidden = false;
      document.body.classList.add('site-lightbox-open');
      closeButton.focus();
    }

    function close() {
      dialog.hidden = true;
      document.body.classList.remove('site-lightbox-open');
      if (returnFocus) returnFocus.focus();
    }

    cards.forEach(function (card, index) {
      var source = card.querySelector('img');
      var label = source ? source.getAttribute('alt') : 'certificate';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'View ' + label + ' document');
      card.addEventListener('click', function () { open(index, card); });
      card.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(index, card);
      });
    });

    closeButton.addEventListener('click', close);
    previousButton.addEventListener('click', function () { render(activeIndex - 1); });
    nextButton.addEventListener('click', function () { render(activeIndex + 1); });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') render(activeIndex - 1);
      if (event.key === 'ArrowRight') render(activeIndex + 1);
      if (event.key === 'Tab') {
        var focusable = [closeButton, previousButton, nextButton];
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function enhanceForms() {
    document.querySelectorAll('form input, form textarea, form select').forEach(function (field, index) {
      if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
      if (!field.id) field.id = 'site-field-' + index;
      var item = field.closest('.form-item');
      var label = item ? item.querySelector('.label') : null;
      if (label) {
        if (label.tagName.toLowerCase() === 'label') label.setAttribute('for', field.id);
        if (!field.getAttribute('aria-label')) {
          field.setAttribute('aria-label', label.textContent.replace('*', '').trim());
        }
      } else if (!field.getAttribute('aria-label')) {
        field.setAttribute('aria-label', field.getAttribute('placeholder') || field.name || 'Form field');
      }
    });
  }

  function init() {
    document.documentElement.classList.add('site-foundation-ready');
    hydrateImages();
    addSkipLink();
    addTrustBar();
    enhanceLinks();
    normalizeContactDetails();
    enhanceProductImages();
    initCertificateGallery();
    enhanceForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
