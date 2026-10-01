/* =============================================
   KEYPRIME STORM PAGE — MAIN JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- Current Year ---
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Floating CTA on mobile ---
  const floatingCta = document.getElementById('floatingCta');
  const hero = document.getElementById('hero');

  const floatingObserver = new IntersectionObserver(
    ([entry]) => {
      if (window.innerWidth <= 768) {
        floatingCta.classList.toggle('visible', !entry.isIntersecting);
      }
    },
    { threshold: 0.1 }
  );
  floatingObserver.observe(hero);

  // --- Scroll reveal animations ---
  const revealTargets = document.querySelectorAll(
    '.intro__text, .intro__image, .damage-card, .process__step, .faq__item, .comparison__col, .testimonial__card, .cta-section__content'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger animation for sibling elements
          const siblings = entry.target.parentElement.querySelectorAll('.reveal');
          const index = Array.from(siblings).indexOf(entry.target);
          const delay = index * 100;

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealTargets.forEach(el => revealObserver.observe(el));

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 20;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
});
