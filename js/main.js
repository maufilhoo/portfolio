import { initI18n } from './i18n.js';
import { initHeroMotion } from './hero-motion.js';

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

/* ─── Parallax on project images ────────────────────────────────── */
function initParallax() {
  const images = document.querySelectorAll('[data-parallax] img, [data-parallax] video');
  if (!images.length) return;

  function onScroll() {
    images.forEach(img => {
      const wrap = img.closest('[data-parallax]');
      const rect = wrap.getBoundingClientRect();
      const vh   = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      const progress = (vh - rect.top) / (vh + rect.height); // 0 → 1
      const shift    = (progress - 0.5) * 40;                // ±20px
      img.style.transform = `translateY(${shift}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Audio player ───────────────────────────────────────────────── */
function initAudio() {
  const btn   = document.getElementById('audio-btn');
  const audio = document.getElementById('bg-audio');
  if (!btn || !audio) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        btn.textContent = '⏸';
        btn.classList.add('playing');
      }).catch(() => {});
    } else {
      audio.pause();
      btn.textContent = '▶';
      btn.classList.remove('playing');
    }
  });
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initOverlay();
  initScrollTop();
  initParallax();
  initHeroMotion();
  initAudio();
  await initI18n();
});
