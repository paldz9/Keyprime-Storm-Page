/* =============================================
   KEYPRIME STORM PAGE — JS
   Parallax · Scroll-in · Storm rain/lightning
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 30);
  }, { passive: true });

  /* ── Mobile nav ── */
  const toggle  = document.getElementById('navToggle');
  const menu    = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  function flipNav() {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', flipNav);
  overlay.addEventListener('click', flipNav);
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.contains('open') && flipNav())
  );

  /* ── Parallax ── */
  const pxEls = document.querySelectorAll('[data-parallax]');
  function parallax() {
    const sy = window.scrollY;
    const wh = window.innerHeight;
    pxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > wh + 300) return;
      const speed = parseFloat(el.dataset.parallax) || 0.12;
      const off = (sy - (el.offsetTop - wh)) * speed;
      el.style.transform = `translate3d(0,${off}px,0)`;
    });
  }
  window.addEventListener('scroll', parallax, { passive: true });
  parallax();

  /* ── Scroll-in animations ── */
  const animEls = document.querySelectorAll('.anim-in');
  const animObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const d = parseInt(e.target.dataset.delay) || 0;
        setTimeout(() => e.target.classList.add('visible'), d);
        animObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  animEls.forEach(el => animObs.observe(el));

  /* ── Process timeline fill ── */
  const processLine = document.getElementById('processLine');
  if (processLine) {
    const lineObs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        processLine.classList.add('filled');
        lineObs.unobserve(processLine);
      }
    }, { threshold: 0.3 });
    lineObs.observe(processLine);
  }

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════
     STORM RAIN + LIGHTNING
     ═══════════════════════════════════════════ */
  const canvas = document.getElementById('stormCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drops = [], raf = null, active = false;
  const N = 70;

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  addEventListener('resize', resize);

  function mkDrop() {
    return {
      x: Math.random() * (canvas.width + 200) - 100,
      y: Math.random() * canvas.height * -1,
      len: 16 + Math.random() * 28,
      sp: 9 + Math.random() * 7,
      op: .03 + Math.random() * .07,
      w: 1.8 + Math.random() * 1.4
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of drops) {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.w * 2, d.y + d.len);
      ctx.strokeStyle = `rgba(170,195,215,${d.op})`;
      ctx.lineWidth = .7;
      ctx.stroke();
      d.x += d.w;
      d.y += d.sp;
      if (d.y > canvas.height + 40) Object.assign(d, mkDrop(), { y: -d.len });
    }
    raf = requestAnimationFrame(draw);
  }

  /* Only rain while hero is in view */
  const hero = document.getElementById('hero');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !active) {
      active = true;
      canvas.classList.add('active');
      drops = Array.from({ length: N }, mkDrop);
      draw();
    } else if (!e.isIntersecting && active) {
      active = false;
      canvas.classList.remove('active');
      cancelAnimationFrame(raf);
    }
  }, { threshold: 0.02 }).observe(hero);

  /* Occasional lightning */
  const grad = document.querySelector('.hero__gradient');
  function flash() {
    if (!active || !grad) {
      setTimeout(flash, 5000 + Math.random() * 5000);
      return;
    }
    if (Math.random() > .18) {
      setTimeout(flash, 4000 + Math.random() * 5000);
      return;
    }
    // Flash: brief white overlay
    grad.style.transition = 'box-shadow .04s';
    grad.style.boxShadow = 'inset 0 0 120px 60px rgba(200,210,230,.06)';
    setTimeout(() => {
      grad.style.transition = 'box-shadow .6s ease';
      grad.style.boxShadow = 'none';
    }, 70);
    setTimeout(flash, 5000 + Math.random() * 6000);
  }
  setTimeout(flash, 3500);
});
