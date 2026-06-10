import { initI18n } from './i18n.js';

/* ─── Overlay ────────────────────────────────────────────────────── */
function initOverlay() {
  const overlay = document.getElementById('overlay');
  if (!overlay) return;
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 900);
    });
  });
}

/* ─── Scroll to top ──────────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.querySelector('.footer-scroll-top');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── Hero slideshow ─────────────────────────────────────────────── */
function initHeroSlideshow() {
  const container = document.getElementById('hero-bg');
  if (!container) return;

  const srcs = [
    'assets/images/enjoei/cover.png',
    'assets/images/feed/feed-01.png',
    'assets/images/feed/feed-05.png',
    'assets/images/justos/cover.png',
    'assets/images/feed/feed-07.png',
    'assets/images/phlor/cover.png',
    'assets/images/feed/feed-09.png',
    'assets/images/feed/feed-06.png',
    'assets/images/feed/feed-11.png',
    'assets/images/enjoei/cover-2.png',
  ];

  const slides = srcs.map((src, i) => {
    const el = document.createElement('div');
    el.className = 'hero-slide' + (i === 0 ? ' active' : '');
    el.style.backgroundImage = `url(${src})`;
    container.appendChild(el);
    return el;
  });

  let idx = 0;
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 4000);
}

/* ─── Copy email ─────────────────────────────────────────────────── */
function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  const orig = btn.textContent;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText('talkmauriciof@gmail.com')
      .then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = orig), 2000);
      })
      .catch(() => { window.location.href = 'mailto:talkmauriciof@gmail.com'; });
  });
}

/* ─── Project scroll reveal ──────────────────────────────────────── */
function initProjectReveal() {
  const items = document.querySelectorAll('.project-koto');
  if (!items.length) return;

  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
    { threshold: 0.1 }
  );
  items.forEach(el => obs.observe(el));
}

/* ─── Audio player ───────────────────────────────────────────────── */
function initAudio() {
  const btn   = document.getElementById('audio-btn');
  const audio = document.getElementById('bg-audio');
  if (!btn || !audio) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => btn.classList.add('playing')).catch(() => {});
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });
}

/* ─── Transparent header on scroll ──────────────────────────────── */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 40);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initOverlay();
  initHeader();
  initScrollTop();
  initHeroSlideshow();
  initCopyEmail();
  initProjectReveal();
  initAudio();
  await initI18n();
});
