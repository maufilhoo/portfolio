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

/* ─── Copy email ─────────────────────────────────────────────────── */
function initCopyEmail() {
  const btns = document.querySelectorAll('#copy-email, [data-copy-email]');
  btns.forEach(btn => {
    const orig = btn.textContent;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText('talkmauriciof@gmail.com')
        .then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = orig), 2000);
        })
        .catch(() => { window.location.href = 'mailto:talkmauriciof@gmail.com'; });
    });
  });
}

/* ─── Work grid reveal ───────────────────────────────────────────── */
function initWorkReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
    { threshold: 0.08 }
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

/* ─── Header scroll — transparent on scroll ─────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 50);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── Work grid image sliders ────────────────────────────────────── */
function initSliders() {
  document.querySelectorAll('.work-item-img').forEach(container => {
    const slides = container.querySelectorAll('.slide-img');
    const nav    = container.querySelector('.slide-nav');
    const idx    = container.querySelector('.slide-idx');
    const prev   = container.querySelector('.slide-btn--prev');
    const next   = container.querySelector('.slide-btn--next');
    if (!slides.length) return;
    if (slides.length <= 1) { if (nav) nav.classList.add('is-single'); return; }
    let cur = 0;
    const show = n => {
      slides[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (idx) idx.textContent = `${cur + 1} / ${slides.length}`;
    };
    if (prev) prev.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show(cur - 1); });
    if (next) next.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); show(cur + 1); });
  });
}

/* ─── Featured slideshow ─────────────────────────────────────────── */
function initFeaturedSlideshow() {
  const media = document.getElementById('featured-media');
  if (!media) return;
  const slides = media.querySelectorAll('.featured-slide');
  if (slides.length <= 1) return;
  let cur = 0;
  let currentScale = 1;

  const applyScale = slide => { slide.style.transform = `scale(${currentScale})`; };

  const show = n => {
    slides[cur].classList.remove('active');
    slides[cur].style.transform = '';
    cur = n;
    slides[cur].classList.add('active');
    applyScale(slides[cur]);
  };

  media.addEventListener('click', () => {
    let next;
    do { next = Math.floor(Math.random() * slides.length); } while (next === cur);
    show(next);
  });
  media.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') media.click(); });

  /* Parallax: grow active slide as section scrolls into view */
  const section = media.closest('.featured-section');
  if (section) {
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));
      currentScale = 1 + progress * 0.05;
      applyScale(slides[cur]);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}

/* ─── Work grid scroll hint ──────────────────────────────────────── */
function initScrollHint() {
  const btn  = document.querySelector('.work-scroll-btn');
  const grid = document.querySelector('.work-grid-section');
  if (!btn || !grid) return;
  btn.addEventListener('click', () => grid.scrollBy({ left: 340, behavior: 'smooth' }));
  const update = () => {
    const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 30;
    btn.style.opacity       = atEnd ? '0' : '0.75';
    btn.style.pointerEvents = atEnd ? 'none' : 'auto';
  };
  grid.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initOverlay();
  initScrollTop();
  initWorkReveal();
  initAudio();
  initHeaderScroll();
  initFeaturedSlideshow();
  initSliders();
  initScrollHint();
  await initI18n();
  initCopyEmail();
});
