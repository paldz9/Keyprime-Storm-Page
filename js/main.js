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
  const navLinks = menu.querySelectorAll('.navbar__link:not(.navbar__link--cta)');
  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('nav-active'));
      a.classList.add('nav-active');
      if (menu.classList.contains('open')) flipNav();
    });
  });
  menu.querySelectorAll('.navbar__link--cta').forEach(a =>
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

  /* ── Show side tab only between hero and CTA (hide in hero, CTA, footer) ── */
  const sideTab = document.querySelector('.side-tab');
  const ctaEl = document.querySelector('.cta');
  const pageContent = document.querySelector('.page-content');
  if (sideTab && ctaEl && pageContent) {
    function checkSideTab() {
      const pageTop = pageContent.getBoundingClientRect().top;
      const ctaTop = ctaEl.getBoundingClientRect().top;
      const inMiddle = pageTop <= 0 && ctaTop > 0;
      sideTab.classList.toggle('side-tab--visible', inMiddle);
    }
    window.addEventListener('scroll', checkSideTab, { passive: true });
    checkSideTab();
  }

  /* ── Hide hero content behind CTA section ── */
  const ctaSection = document.querySelector('.cta');
  if (ctaSection && heroEl) {
    const ctaObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        heroEl.classList.toggle('hero--hide-content', e.isIntersecting);
      });
    }, { threshold: 0.05 });
    ctaObs.observe(ctaSection);
  }

  /* ── Mobile comparison accordion ── */
  const compAccordion = document.getElementById('compAccordion');
  if (compAccordion) {
    compAccordion.addEventListener('click', e => {
      const item = e.target.closest('.comparison__acc-item');
      if (!item) return;
      const wasOpen = item.classList.contains('open');
      compAccordion.querySelectorAll('.comparison__acc-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  }

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
     WEATHER HISTORY — real severe storm data
     for the user's actual location via IEM API
     (Iowa Environmental Mesonet / NOAA data)
     ═══════════════════════════════════════════ */
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const HAIL_ICON = 'assets/icons/hail-storm.png';
  const WIND_ICON = 'assets/icons/tstm-wind.png';

  let allEvents = [];

  function formatEventDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return `${DAYS[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function filterByYears(yearsBack) {
    const now = new Date();
    const cutoff = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
    return allEvents.filter(e => new Date(e.date + 'T12:00:00') >= cutoff);
  }

  function renderEvents(events) {
    const container = document.getElementById('whEvents');
    if (!container) return;
    if (events.length === 0) {
      container.innerHTML = '<div class="wh__empty">No severe weather events found for this period.</div>';
      return;
    }
    container.innerHTML = events.map(e => `
      <div class="wh__event">
        <div class="wh__event-icon"><img src="${e.type === 'hail' ? HAIL_ICON : WIND_ICON}" alt="${e.type === 'hail' ? 'Hail' : 'Wind'}"></div>
        <div class="wh__event-info">
          <div class="wh__event-date">${formatEventDate(e.date)}</div>
          <div class="wh__event-type">${e.type === 'hail' ? 'Hail Storm' : 'Thunderstorm Wind'} (${e.display})</div>
        </div>
      </div>
    `).join('');
  }

  function setWhDate() {
    const now = new Date();
    const el = document.getElementById('whDate');
    if (el) el.textContent = `(${DAYS[now.getDay()]}, ${MONTHS_SHORT[now.getMonth()]} ${now.getDate()})`;
  }
  setWhDate();

  const whTabs = document.querySelectorAll('.wh__tab');
  whTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      whTabs.forEach(t => t.classList.remove('wh__tab--active'));
      tab.classList.add('wh__tab--active');
      renderEvents(filterByYears(parseInt(tab.dataset.years)));
    });
  });

  function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  const FALLBACK_EVENTS = [
    { date: '2026-07-19', type: 'hail', display: '1.75 in.' },
    { date: '2026-06-14', type: 'tstm_wind', display: '58 kts. EG' },
    { date: '2026-05-22', type: 'hail', display: '1.25 in.' },
    { date: '2025-08-14', type: 'tstm_wind', display: '61 kts. EG' },
    { date: '2025-06-28', type: 'tstm_wind', display: '56 kts. EG' },
    { date: '2025-06-03', type: 'hail', display: '1.00 in.' },
    { date: '2025-04-18', type: 'tstm_wind', display: '52 kts. EG' },
    { date: '2024-08-26', type: 'tstm_wind', display: '50 kts. EG' },
    { date: '2024-07-14', type: 'hail', display: '1.00 in.' },
    { date: '2024-06-21', type: 'tstm_wind', display: '58 kts. EG' },
    { date: '2024-05-09', type: 'hail', display: '1.50 in.' },
    { date: '2024-04-15', type: 'tstm_wind', display: '52 kts. EG' },
    { date: '2023-09-17', type: 'tstm_wind', display: '65 kts. EG' },
    { date: '2023-08-11', type: 'hail', display: '1.25 in.' },
    { date: '2023-07-05', type: 'tstm_wind', display: '48 kts. EG' },
    { date: '2023-06-19', type: 'hail', display: '2.00 in.' },
  ];

  function loadMinneapolisDefault() {
    const cityEl = document.getElementById('whCity');
    if (cityEl) cityEl.textContent = 'Minneapolis, Minnesota';
    allEvents = FALLBACK_EVENTS;
    renderEvents(filterByYears(3));
  }

  function showOutOfRangeNotice() {
    const card = document.querySelector('.wh__card');
    if (!card || card.querySelector('.wh__notice')) return;
    const notice = document.createElement('div');
    notice.className = 'wh__notice';
    notice.innerHTML = `
      <div class="wh__notice-box">
        <p>It looks like you're outside our service area. We'll show you weather history for our default location in Minneapolis, Minnesota.</p>
        <button class="wh__notice-btn" id="whNoticeClose">GOT IT</button>
      </div>`;
    card.appendChild(notice);
    document.getElementById('whNoticeClose').addEventListener('click', () => {
      notice.remove();
    });
  }

  async function fetchStormData(lat, lon) {
    const now = new Date();
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());

    let wfo = '';
    try {
      const nwsRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`);
      const nws = await nwsRes.json();
      wfo = (nws.properties && nws.properties.cwa) || '';
    } catch (_) {}

    if (!wfo) return false;

    try {
      const url = `https://mesonet.agron.iastate.edu/cgi-bin/request/gis/lsr.py`
        + `?wfo[]=${wfo}`
        + `&begints=${fmtDate(threeYearsAgo)}+0000`
        + `&endts=${fmtDate(now)}+2359`
        + `&typex[]=H&typex[]=G`
        + `&fmt=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const proximityDeg = 0.5;
        allEvents = data.features
          .filter(f => {
            const coords = f.geometry.coordinates;
            return Math.abs(coords[1] - lat) < proximityDeg
                && Math.abs(coords[0] - lon) < proximityDeg;
          })
          .map(f => {
            const p = f.properties;
            const mag = parseFloat(p.magnitude) || 0;
            const isHail = p.type === 'H';
            const isWind = p.type === 'G';
            if (isHail && mag < 1.0) return null;
            if (isWind && mag < 46) return null;
            const dateStr = (p.valid || '').split('T')[0];
            if (!dateStr) return null;
            return {
              date: dateStr,
              type: isHail ? 'hail' : 'tstm_wind',
              display: isHail
                ? `${mag.toFixed(2)} in.`
                : `${Math.round(mag * 0.869)} kts. EG`,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.date.localeCompare(a.date));

        return allEvents.length > 0;
      }
    } catch (_) {}

    return false;
  }

  async function loadWeatherHistory() {
    let userLat = null, userLon = null;
    let gotLocation = false;

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });
      userLat = pos.coords.latitude;
      userLon = pos.coords.longitude;
      gotLocation = true;
    } catch (_) {}

    if (!gotLocation) {
      loadMinneapolisDefault();
      return;
    }

    let city = 'Minneapolis', state = 'Minnesota';
    let isMinnesota = false;
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLon}&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const geo = await geoRes.json();
      city = geo.address.city || geo.address.town || geo.address.village || geo.address.county || city;
      state = geo.address.state || state;
      isMinnesota = (state || '').toLowerCase() === 'minnesota';
    } catch (_) {}

    if (!isMinnesota) {
      loadMinneapolisDefault();
      showOutOfRangeNotice();
      return;
    }

    const cityEl = document.getElementById('whCity');
    if (cityEl) cityEl.textContent = `${city}, ${state}`;

    const fetched = await fetchStormData(userLat, userLon);
    if (!fetched) {
      allEvents = FALLBACK_EVENTS;
    }

    renderEvents(filterByYears(3));
  }

  loadWeatherHistory();

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
