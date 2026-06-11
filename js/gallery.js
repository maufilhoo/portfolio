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
  'assets/audio/Os-Tincoas---Deixa-A-Gira-Girar-j-g-b-edit---millemon---electronic-_-world-music-youtube.mp3',
  'assets/audio/Tom Misch - It Runs Through Me  INSTRUMENTAL - Shai Town (youtube).mp3'
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
  const countEl   = document.getElementById('gallery-count');

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
  const FLOAT_ANIMS = ['float-a', 'float-b', 'float-c', 'float-d'];

  function doScatter() {
    const W      = window.innerWidth - 80;
    const H_STEP = 190;                              // tighter vertical step
    const SIZES  = [180, 220, 280, 340, 400, 460];  // bigger images

    const order = allItems.map((_, i) => i).sort(() => Math.random() - 0.5);
    canvas.style.height = (order.length * H_STEP + 300) + 'px';

    order.forEach((srcIdx, plotIdx) => {
      const item = allItems[srcIdx];
      const w    = SIZES[Math.floor(Math.random() * SIZES.length)];
      const x    = Math.round(Math.random() * Math.max(0, W - w * 0.7));
      const y    = Math.round(plotIdx * H_STEP + Math.random() * 100);

      item.style.position = 'absolute';
      item.style.width    = w + 'px';
      item.style.left     = x + 'px';
      item.style.top      = y + 'px';
      // ~40% of items go behind GALLERY word (z-index < 2), rest in front
      item.style.zIndex   = Math.random() > 0.4 ? '3' : '1';

      const anim = FLOAT_ANIMS[plotIdx % FLOAT_ANIMS.length];
      const dur  = (12 + Math.random() * 10).toFixed(1);
      const del  = (-(Math.random() * 14)).toFixed(1);
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
  }
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
});
