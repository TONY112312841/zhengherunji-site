/**
 * Google Analytics + Tawk.to 跟踪代码
 * 统一管理，避免在每个页面中重复内联
 */
window.addEventListener('load', function () {
  setTimeout(function () {

    var gtagScript1 = document.createElement('script');
    gtagScript1.async = true;
    gtagScript1.src = 'https://www.googletagmanager.com/gtag/js?id=AW-777621748';
    document.head.appendChild(gtagScript1);

    var gtagScript2 = document.createElement('script');
    gtagScript2.async = true;
    gtagScript2.src = 'https://www.googletagmanager.com/gtag/js?id=G-8B696YTE56';
    document.head.appendChild(gtagScript2);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'AW-777621748');
    gtag('config', 'G-8B696YTE56');

    if (window.location.pathname.includes('contact.html')) {
      gtag('event', 'conversion', { 'send_to': 'AW-777621748/lpY2CIyFt9sBEPSh5vIC' });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[href*="whatsapp.com/send"]');
      if (btn === null) return;
      gtag('event', 'whatsapp点击');
    });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[href*="mailto:"]');
      if (btn === null) return;
      gtag('event', '邮箱点击');
    });

    if (window.location.pathname.includes('contact.html')) {
      document.querySelectorAll('[type="button"]').forEach(function (b) {
        b.addEventListener('click', function () {
          var form = b.closest('form');
          if (form.checkValidity() === false) return;
          var email = form.querySelector('[name="email"]').value.trim().toLowerCase();
          if (email === '') return;
          var name = form.querySelector('[name="contact_name"]').value.trim();
          if (name === '') return;
          var quantity = form.querySelector('[name="job_name"]').value.trim();
          if (quantity === '') return;
          gtag('set', 'user_data', { "email": email });
          gtag('event', '联系我们页面表单');
        });
      });
    }

    if (window.location.pathname.includes('contact.html')) {
      document.querySelectorAll('[type="button"]').forEach(function (b) {
        b.addEventListener('click', function () {
          var form = b.closest('form');
          if (form.checkValidity() === false) return;
          var email = form.querySelector('[name="email"]').value.trim().toLowerCase();
          if (email === '') return;
          var name = form.querySelector('[name="contact_name"]').value.trim();
          if (name === '') return;
          var quantity = form.querySelector('[name="job_name"]').value.trim();
          if (quantity === '') return;
          gtag('set', 'user_data', { "email": email });
          gtag('event', '产品页面表单');
        });
      });
    }

    document.addEventListener("click", function (e) {
      var button = e.target.closest('[type="button"]');
      if (button === null) return;
      var quantityEl = document.querySelector('[name="job_name"]');
      var messageEl = document.querySelector('[name="content"]');
      var emailEl = document.querySelector('[name="email"]');
      if (!quantityEl || !messageEl || !emailEl) return;
      var quantity = quantityEl.value;
      var message = messageEl.value;
      var email = emailEl.value.trim().toLowerCase();
      if (email != "" && quantity != '' && message != '') {
        gtag("set", "user_data", { email: email });
        gtag('event', 'conversion', { 'send_to': 'AW-777621748/HAwICK-b_J8cEPSh5vIC' });
        gtag('event', '联系我们页面表单2', { 'send_to': 'G-8B696YTE56' });
      }
    });

  }, 3000);
});