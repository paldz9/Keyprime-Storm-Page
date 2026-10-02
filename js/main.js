/* =============================================
   KEYPRIME STORM PAGE — JS
   Fixed hero · Weather API · Storm FX
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll: transparent → solid ── */
  const navbar   = document.getElementById('navbar');
  const topBar   = document.getElementById('topBar');
  const heroEl   = document.getElementById('hero');
  const triggerY = window.innerHeight * 0.6;

  function onScroll() {
    const past = window.scrollY > triggerY;
    navbar.classList.toggle('navbar--hero', !past);
    navbar.classList.toggle('navbar--scrolled', past);
    topBar.classList.toggle('top-bar--solid', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* (divider removed — red bar is now a CSS left-border on .hero__body) */

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
  const animEls = document.querySelectorAll('.anim-in, .anim-slide-right');
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

  /* ── Hero entry animations (triggered on load) ── */
  const heroAnims = document.querySelectorAll('.hero-anim');
  heroAnims.forEach(el => {
    const d = parseInt(el.dataset.delay) || 0;
    setTimeout(() => el.classList.add('visible'), 300 + d);
  });

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) {
        e.preventDefault();
        const navH = navbar.offsetHeight + topBar.offsetHeight;
        const y = t.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════
     REAL-TIME WEATHER (Open-Meteo, no API key)
     ═══════════════════════════════════════════ */
  const WMO = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };

  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function setDate() {
    const now = new Date();
    const el = document.getElementById('weatherDate');
    if (el) el.textContent = `(${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()})`;
  }
  setDate();

  async function loadWeather() {
    let lat = 45.084, lon = -93.264;
    let city = 'Fridley', state = 'Minnesota';

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
      });
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const geo = await geoRes.json();
        city = geo.address.city || geo.address.town || geo.address.village || geo.address.county || city;
        state = geo.address.state || state;
      } catch (_) {}
    } catch (_) {}

    document.getElementById('weatherCity').textContent = `${city}, ${state}`;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
        + `&current=temperature_2m,weather_code`
        + `&daily=temperature_2m_max,temperature_2m_min`
        + `&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`;
      const res = await fetch(url);
      const data = await res.json();

      const temp = Math.round(data.current.temperature_2m);
      const code = data.current.weather_code;
      const hi = Math.round(data.daily.temperature_2m_max[0]);
      const lo = Math.round(data.daily.temperature_2m_min[0]);
      const cond = WMO[code] || 'Partly cloudy';

      document.getElementById('weatherTemp').textContent = temp;
      document.getElementById('weatherHi').textContent = hi;
      document.getElementById('weatherLo').textContent = lo;
      document.getElementById('weatherCond').textContent = cond;
    } catch (_) {
      document.getElementById('weatherCond').textContent = 'Weather unavailable';
    }
  }
  loadWeather();

  /* ═══════════════════════════════════════════
     STORM RAIN + LIGHTNING
     ═══════════════════════════════════════════ */
  const canvas = document.getElementById('stormCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let drops = [], raf = null, rainActive = false;
  const N = 70;

  function resize() { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
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

  function startRain() {
    if (rainActive) return;
    rainActive = true;
    canvas.classList.add('active');
    drops = Array.from({ length: N }, mkDrop);
    draw();
  }
  function stopRain() {
    if (!rainActive) return;
    rainActive = false;
    canvas.classList.remove('active');
    cancelAnimationFrame(raf);
  }

  startRain();

  // Fade rain based on scroll (stop once content covers hero)
  function rainCheck() {
    if (window.scrollY < window.innerHeight * 0.85) {
      startRain();
    } else {
      stopRain();
    }
  }
  window.addEventListener('scroll', rainCheck, { passive: true });

  /* Lightning */
  function flash() {
    if (!rainActive) {
      setTimeout(flash, 5000 + Math.random() * 5000);
      return;
    }
    if (Math.random() > .18) {
      setTimeout(flash, 4000 + Math.random() * 5000);
      return;
    }
    const ov = document.querySelector('.hero__overlay');
    if (!ov) return;
    ov.style.transition = 'box-shadow .04s';
    ov.style.boxShadow = 'inset 0 0 120px 60px rgba(200,210,230,.06)';
    setTimeout(() => {
      ov.style.transition = 'box-shadow .6s ease';
      ov.style.boxShadow = 'none';
    }, 70);
    setTimeout(flash, 5000 + Math.random() * 6000);
  }
  setTimeout(flash, 3500);

  /* ═══════════════════════════════════════════
     COMPARISON — paired hover across columns
     ═══════════════════════════════════════════ */
  const kpItems = document.querySelectorAll('.comparison__col--kp .comparison__list li');
  const otherItems = document.querySelectorAll('.comparison__col--others .comparison__list li');

  kpItems.forEach((li, i) => {
    li.addEventListener('mouseenter', () => {
      li.classList.add('hover-active');
      if (otherItems[i]) otherItems[i].classList.add('hover-active');
    });
    li.addEventListener('mouseleave', () => {
      li.classList.remove('hover-active');
      if (otherItems[i]) otherItems[i].classList.remove('hover-active');
    });
  });
  otherItems.forEach((li, i) => {
    li.addEventListener('mouseenter', () => {
      li.classList.add('hover-active');
      if (kpItems[i]) kpItems[i].classList.add('hover-active');
    });
    li.addEventListener('mouseleave', () => {
      li.classList.remove('hover-active');
      if (kpItems[i]) kpItems[i].classList.remove('hover-active');
    });
  });

  /* ═══════════════════════════════════════════
     FAQ ACCORDION — auto-close + char reveal
     ═══════════════════════════════════════════ */
  const faqItems = document.querySelectorAll('.faq__item');

  function wrapChars(answerEl) {
    const p = answerEl.querySelector('p');
    if (!p || p.querySelector('.char')) return;
    const text = p.textContent;
    p.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i] === ' ' ? ' ' : text[i];
      span.style.animationDelay = `${i * 4}ms`;
      p.appendChild(span);
    }
  }

  faqItems.forEach(item => {
    item.querySelector('summary').addEventListener('click', e => {
      e.preventDefault();
      const wasOpen = item.hasAttribute('open');

      faqItems.forEach(other => {
        if (other !== item && other.hasAttribute('open')) {
          other.removeAttribute('open');
          const op = other.querySelector('.faq__answer p');
          if (op && op.querySelector('.char')) op.innerHTML = op.textContent;
        }
      });

      if (!wasOpen) {
        item.setAttribute('open', '');
        wrapChars(item.querySelector('.faq__answer'));
      } else {
        item.removeAttribute('open');
        const p = item.querySelector('.faq__answer p');
        if (p && p.querySelector('.char')) p.innerHTML = p.textContent;
      }
    });
  });

  // Apply char reveal to initially-open FAQ
  const openFaq = document.querySelector('.faq__item[open] .faq__answer');
  if (openFaq) wrapChars(openFaq);
});
