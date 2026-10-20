// Portfolio behavior: footer year and nav highlighting while scrolling.
(function () {
  'use strict';

  // 1. Keep the footer year current.
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // 2. Highlight the nav link for the section currently on screen.
  var links = document.querySelectorAll('nav a[href^="#"]');
  var sections = [];
  links.forEach(function (link) {
    var target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ link: link, el: target });
  });
  if (!sections.length || !('IntersectionObserver' in window)) return;

  function setActive(id) {
    sections.forEach(function (s) {
      var on = s.el.id === id;
      s.link.classList.toggle('active', on);
      if (on) s.link.setAttribute('aria-current', 'true');
      else s.link.removeAttribute('aria-current');
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(function (s) { observer.observe(s.el); });
})();