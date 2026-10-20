// Portfolio behavior: live network hero, nav highlighting, footer year.
(function () {
  'use strict';

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Nav link highlight for the section on screen.
  var links = document.querySelectorAll('nav a[href^="#"]');
  var sections = [];
  links.forEach(function (link) {
    var el = document.querySelector(link.getAttribute('href'));
    if (el) sections.push({ link: link, el: el });
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        sections.forEach(function (s) {
          var on = s.el === e.target;
          s.link.classList.toggle('active', on);
          if (on) s.link.setAttribute('aria-current', 'true'); else s.link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s.el); });
  }

  // Hero: a small network of the tools I work with. Packets travel the links,
  // and nodes light up near the cursor.
  var c = document.getElementById('net');
  if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var hero = c.parentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var names = ['Proxmox', 'AWS', 'Linux', 'Windows Server', 'Python', 'C++', 'Networking', 'Home Assistant',
               'CloudFront', 'Lambda', 'DynamoDB', 'VPC', 'S3', 'Hardware', 'NPI', 'Diagnostics'];
  var W, H, nodes = [], edges = [], packets = [], mouse = { x: -999, y: -999 }, running = true, tick = 0;

  function build() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = names.map(function (n) {
      return { n: n, x: 40 + Math.random() * (W - 80), y: 30 + Math.random() * (H - 60),
               vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 };
    });
    edges = [];
    nodes.forEach(function (a, i) {
      nodes.map(function (b, j) { return { j: j, d: Math.hypot(a.x - b.x, a.y - b.y) }; })
        .filter(function (o) { return o.j !== i; })
        .sort(function (p, q) { return p.d - q.d; })
        .slice(0, 2)
        .forEach(function (o) {
          var dup = edges.some(function (e) { return (e[0] === i && e[1] === o.j) || (e[0] === o.j && e[1] === i); });
          if (!dup) edges.push([i, o.j]);
        });
    });
    packets = [];
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    edges.forEach(function (e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      ctx.strokeStyle = 'rgba(92,225,255,.18)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    packets.forEach(function (p) {
      var a = nodes[p.e[0]], b = nodes[p.e[1]], t = p.dir ? p.t : 1 - p.t;
      ctx.fillStyle = '#ffb347'; ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2.5, 0, 6.3); ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.font = '12px "JetBrains Mono", monospace';
    nodes.forEach(function (n) {
      var near = Math.max(0, 1 - Math.hypot(n.x - mouse.x, n.y - mouse.y) / 150);
      ctx.fillStyle = near > 0 ? 'rgba(92,225,255,' + (.5 + near * .5) + ')' : 'rgba(228,232,255,.45)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 3 + near * 4, 0, 6.3); ctx.fill();
      ctx.fillStyle = 'rgba(228,232,255,' + (.35 + near * .65) + ')';
      ctx.fillText(n.n, n.x + 9, n.y + 4);
    });
  }

  function step() {
    if (running) {
      tick++;
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 30 || n.x > W - 90) n.vx *= -1;
        if (n.y < 20 || n.y > H - 20) n.vy *= -1;
      });
      if (tick % 35 === 0 && packets.length < 14 && edges.length) {
        packets.push({ e: edges[Math.floor(Math.random() * edges.length)], t: 0, dir: Math.random() < .5, s: .006 + Math.random() * .008 });
      }
      packets.forEach(function (p) { p.t += p.s; });
      packets = packets.filter(function (p) { return p.t < 1; });
      draw();
    }
    requestAnimationFrame(step);
  }

  hero.addEventListener('mousemove', function (e) {
    var r = c.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    if (reduce) draw();
  });
  hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; if (reduce) draw(); });
  window.addEventListener('resize', build);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(hero);
  }
  build();
  if (!reduce) requestAnimationFrame(step);
})();