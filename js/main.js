/* =============================================
   KEYPRIME STORM PAGE — MAIN JS
   Parallax · Scroll animations · Storm rain
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Navbar scroll ─── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ─── Mobile nav ─── */
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');

  // Create overlay element for mobile nav
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function toggleNav() {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  navToggle.addEventListener('click', toggleNav);
  overlay.addEventListener('click', toggleNav);
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) toggleNav();
  }));

  /* ─── Parallax ─── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  function updateParallax() {
    const scrollY = window.scrollY;
    const wh = window.innerHeight;

    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallax) || 0.15;

      // Only apply when element is near viewport
      if (rect.bottom < -200 || rect.top > wh + 200) return;

      const offset = (scrollY - (el.offsetTop - wh)) * speed;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }
  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();

  /* ─── Scroll-in animations ─── */
  const animEls = document.querySelectorAll('.anim-in');

  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        animObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  animEls.forEach(el => animObserver.observe(el));

  /* ─── Smooth anchor scroll ─── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 20;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ─────────────────────────────────────────
     SUBTLE STORM RAIN EFFECT
     Draws very thin, semi-transparent diagonal
     lines on a fixed canvas — only while the
     hero is in view. Fades out as you scroll.
     ───────────────────────────────────────── */
  const canvas = document.getElementById('stormCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let drops = [];
  const DROP_COUNT = 80;
  let animId = null;
  let isActive = false;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function initDrops() {
    drops = [];
    for (let i = 0; i < DROP_COUNT; i++) {
      drops.push(makeDrop());
    }
  }

  function makeDrop() {
    return {
      x: Math.random() * (canvas.width + 200) - 100,
      y: Math.random() * canvas.height - canvas.height,
      len: 18 + Math.random() * 30,
      speed: 8 + Math.random() * 8,
      opacity: 0.04 + Math.random() * 0.08,
      wind: 2 + Math.random() * 2
    };
  }

  function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.wind * 2, d.y + d.len);
      ctx.strokeStyle = `rgba(180,200,220,${d.opacity})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      d.x += d.wind;
      d.y += d.speed;

      if (d.y > canvas.height + 40) {
        Object.assign(d, makeDrop());
        d.y = -d.len;
      }
    });
    animId = requestAnimationFrame(drawRain);
  }

  // Only show rain while hero is visible
  const hero = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !isActive) {
      isActive = true;
      canvas.classList.add('active');
      initDrops();
      drawRain();
    } else if (!entry.isIntersecting && isActive) {
      isActive = false;
      canvas.classList.remove('active');
      cancelAnimationFrame(animId);
    }
  }, { threshold: 0.05 });
  heroObserver.observe(hero);

  // Occasional lightning flash (very subtle)
  function lightningFlash() {
    if (!isActive) return;

    // 15% chance every 4-8 seconds
    if (Math.random() > 0.15) {
      setTimeout(lightningFlash, 4000 + Math.random() * 4000);
      return;
    }

    const heroOverlay = document.querySelector('.hero__overlay');
    if (!heroOverlay) return;

    heroOverlay.style.transition = 'background 0.05s';
    heroOverlay.style.background = `
      radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.2) 0%, transparent 70%),
      linear-gradient(180deg, rgba(180,190,210,0.08) 0%, rgba(0,0,0,0.5) 100%)
    `;

    setTimeout(() => {
      heroOverlay.style.transition = 'background 0.8s ease';
      heroOverlay.style.background = `
        radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.4) 0%, transparent 70%),
        linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)
      `;
    }, 80);

    setTimeout(lightningFlash, 4000 + Math.random() * 6000);
  }

  // Start lightning loop after a delay
  setTimeout(lightningFlash, 3000);
});
