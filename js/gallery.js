import { initI18n, getTranslation } from './i18n.js';

/* ─── Overlay ─────────────────────────────────────────────────────── */
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

/* ─── Header scroll ───────────────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ─── Copy email ──────────────────────────────────────────────────── */
function initCopyEmail() {
  const btns = document.querySelectorAll('#copy-email, [data-copy-email]');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText('talkmauriciof@gmail.com')
        .then(() => {
          btn.textContent = getTranslation('nav_copied');
          const key = btn.dataset.i18n;
          setTimeout(() => { btn.textContent = key ? getTranslation(key) : btn.dataset.origText; }, 2000);
        })
        .catch(() => { window.location.href = 'mailto:talkmauriciof@gmail.com'; });
    });
    if (!btn.dataset.i18n) btn.dataset.origText = btn.textContent;
  });
}

/* ─── Audio ───────────────────────────────────────────────────────── */
const TRACKS = [
  'assets/audio/tincoas.mp3',
  'assets/audio/tom-misch.mp3'
];
function initAudio() {
  const btn = document.getElementById('audio-btn');
  const audio = document.getElementById('bg-audio');
  const popover = document.getElementById('audio-track-popover');
  if (!btn || !audio || !popover) return;
  btn.addEventListener('click', () => {
    if (audio.paused) audio.play().then(() => btn.classList.add('playing')).catch(() => {});
    else { audio.pause(); btn.classList.remove('playing'); }
  });
  popover.querySelectorAll('.track-opt').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      const wasPlaying = !audio.paused;
      popover.querySelectorAll('.track-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      audio.pause();
      audio.src = TRACKS[parseInt(opt.dataset.track)];
      audio.currentTime = 0;
      if (wasPlaying) audio.play().then(() => btn.classList.add('playing')).catch(() => {});
      else btn.classList.remove('playing');
    });
  });
}

/* ─── Gallery: scatter + float + lightbox ────────────────────────── */
function initGalleryPage() {
  const lb        = document.getElementById('gallery-lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCounter = document.getElementById('lb-counter');
  const lbProject = document.getElementById('lb-project');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const countEl   = null; // removed

  const allItems  = [];
  const allSrcs   = [];
  const allLabels = [];

  // Collect items + add captions
  document.querySelectorAll('.gallery-group').forEach(group => {
    const label = group.querySelector('.gallery-group-label')?.textContent.trim() || '';
    group.querySelectorAll('.gallery-item').forEach(item => {
      allItems.push(item);
      allSrcs.push(item.dataset.src || item.querySelector('img')?.src || '');
      allLabels.push(label);

      // Small project caption below image
      if (label && !item.querySelector('.gallery-caption')) {
        const cap = document.createElement('span');
        cap.className = 'gallery-caption';
        cap.textContent = label;
        item.appendChild(cap);
      }
    });
  });

  // Single canvas replaces group structure
  const pageEl = document.querySelector('.gallery-page');
  const canvas  = document.createElement('div');
  canvas.className = 'gallery-scatter-canvas';
  pageEl.appendChild(canvas);

  allItems.forEach((item, i) => {
    canvas.appendChild(item);
    item.addEventListener('click', () => openLightbox(i));
  });

  document.querySelectorAll('.gallery-group').forEach(g => g.remove());

  if (countEl) countEl.textContent = allItems.length + ' works';

  // ── Scatter + float ──────────────────────────────────────────────
  const FLOAT_ANIMS = ['float-a', 'float-b', 'float-c', 'float-d', 'float-e', 'float-f', 'float-g', 'float-h'];

  // Zone bands (as fraction of W): alternating to spread items across canvas
  const ZONES = [
    [0.02, 0.44],   // left
    [0.52, 0.94],   // right
    [0.18, 0.60],   // center-left
    [0.38, 0.80],   // center-right
    [0.02, 0.38],   // far-left
    [0.58, 0.94],   // far-right
    [0.24, 0.68],   // center
    [0.06, 0.50],   // mid-left
  ];

  function doScatter() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      canvas.style.position = 'relative';
      canvas.style.display  = 'grid';
      canvas.style.gridTemplateColumns = '1fr 1fr';
      canvas.style.gap      = '12px';
      canvas.style.height   = 'auto';
      allItems.forEach(item => {
        item.style.position  = 'static';
        item.style.left      = 'auto';
        item.style.top       = 'auto';
        item.style.width     = '100%';
        item.style.animation = 'none';
        item.style.zIndex    = '';
      });
      return;
    }

    const W      = window.innerWidth - 80;
    const H_STEP = 400;
    const SIZES  = [300, 380, 460, 540, 620];

    const order = allItems.map((_, i) => i).sort(() => Math.random() - 0.5);
    canvas.style.height = (order.length * H_STEP + 500) + 'px';

    order.forEach((srcIdx, plotIdx) => {
      const item  = allItems[srcIdx];
      const w     = SIZES[Math.floor(Math.random() * SIZES.length)];
      const zone  = ZONES[plotIdx % ZONES.length];
      const xMin  = W * zone[0];
      const xMax  = W * zone[1] - w * 0.5;
      const x     = Math.round(xMin + Math.random() * Math.max(0, xMax - xMin));
      const y     = Math.round(plotIdx * H_STEP + Math.random() * 140);

      item.style.position = 'absolute';
      item.style.width    = w + 'px';
      item.style.left     = x + 'px';
      item.style.top      = y + 'px';
      item.style.zIndex   = plotIdx % 2 === 0 ? '3' : '1';

      const anim = FLOAT_ANIMS[plotIdx % FLOAT_ANIMS.length];
      const dur  = (14 + Math.random() * 14).toFixed(1);
      const del  = (-(Math.random() * 20)).toFixed(1);
      item.style.animation = `${anim} ${dur}s ${del}s ease-in-out infinite`;
    });
  }

  if (document.readyState === 'complete') doScatter();
  else window.addEventListener('load', doScatter);

  // ── Lightbox ────────────────────────────────────────────────────
  let lbIdx = 0;

  function openLightbox(idx) {
    lbIdx = idx;
    showSlide(idx);
    lb.classList.add('visible');
  }

  function showSlide(idx) {
    lbImg.classList.add('fading');
    setTimeout(() => {
      lbImg.src = allSrcs[idx];
      lbCounter.textContent = (idx + 1) + ' / ' + allSrcs.length;
      lbProject.textContent = allLabels[idx] || '';
      lbImg.classList.remove('fading');
    }, 160);
  }

  function closeLightbox() { lb.classList.remove('visible'); }

  if (lb) {
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    lbPrev.addEventListener('click', e => {
      e.stopPropagation();
      lbIdx = (lbIdx - 1 + allSrcs.length) % allSrcs.length;
      showSlide(lbIdx);
    });
    lbNext.addEventListener('click', e => {
      e.stopPropagation();
      lbIdx = (lbIdx + 1) % allSrcs.length;
      showSlide(lbIdx);
    });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('visible')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + allSrcs.length) % allSrcs.length; showSlide(lbIdx); }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % allSrcs.length; showSlide(lbIdx); }
    });

    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) {
        lbIdx = dx < 0 ? (lbIdx + 1) % allSrcs.length : (lbIdx - 1 + allSrcs.length) % allSrcs.length;
        showSlide(lbIdx);
      }
    });
  }
}

/* ─── Mobile nav toggle ───────────────────────────────────────────── */
function initMobileNav() {
  const btn  = document.querySelector('.nav-fish-btn');
  const pill = document.querySelector('.nav-fish-pill');
  if (!btn || !pill) return;

  btn.addEventListener('click', () => {
    if (window.innerWidth > 768) return;
    pill.classList.toggle('is-open');
  });

  pill.querySelectorAll('.nav-fish-link').forEach(link => {
    link.addEventListener('click', () => pill.classList.remove('is-open'));
  });

  document.addEventListener('touchstart', e => {
    if (window.innerWidth > 768) return;
    if (!e.target.closest('.nav-fish-wrap')) pill.classList.remove('is-open');
  }, { passive: true });
}

/* ─── Init ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.scrollTo(0, 0);
  initOverlay();
  initAudio();
  initHeaderScroll();
  initGalleryPage();
  await initI18n();
  initCopyEmail();
  initMobileNav();
});
