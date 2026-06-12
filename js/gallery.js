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

/* ─── Case image lists (mirrors index.html data-images) ──────────── */
const CASE_IMAGES = {
  enjoei:       ['assets/images/cases/enjoei/1.png','assets/images/cases/enjoei/2.jpg','assets/images/cases/enjoei/3.jpg','assets/images/cases/enjoei/4.jpg','assets/images/cases/enjoei/5.gif','assets/images/cases/enjoei/6.png','assets/images/cases/enjoei/7.png','assets/images/cases/enjoei/8b.png','assets/images/cases/enjoei/9.jpg','assets/images/cases/enjoei/10.png','assets/images/cases/enjoei/10 1.gif','assets/images/cases/enjoei/11.jpg','assets/images/cases/enjoei/12.png','assets/images/cases/enjoei/14.png','assets/images/cases/enjoei/15.png','assets/images/cases/enjoei/16.jpg','assets/images/cases/enjoei/17.jpg','assets/images/cases/enjoei/18.jpg','assets/images/cases/enjoei/20.png','assets/images/cases/enjoei/21.png','assets/images/cases/enjoei/22.png'],
  justos:       ['assets/images/cases/justos/1.png','assets/images/cases/justos/3.png','assets/images/cases/justos/6.png','assets/images/cases/justos/7.png','assets/images/cases/justos/9.png','assets/images/cases/justos/10.png','assets/images/cases/justos/11.png','assets/images/cases/justos/13.png','assets/images/cases/justos/15.png'],
  phlor:        ['assets/images/cases/phlor/1.png','assets/images/cases/phlor/2.png','assets/images/cases/phlor/3.png','assets/images/cases/phlor/4.png','assets/images/cases/phlor/5.png','assets/images/cases/phlor/6.png','assets/images/cases/phlor/7.png','assets/images/cases/phlor/8.png','assets/images/cases/phlor/9.png','assets/images/cases/phlor/10.png','assets/images/cases/phlor/11.png','assets/images/cases/phlor/12.png','assets/images/cases/phlor/13.png','assets/images/cases/phlor/14.png','assets/images/cases/phlor/15.png'],
  '99':         ['assets/images/cases/99/imageye___-_6924204799d08a071d58f46b_tatil-99-nova-linguagem-visual-escalator-advertisement.webp','assets/images/cases/99/imageye___-_69242056d05392e7c6377003_tatil-99-nova-linguagem-visual-bold-yellow-text.webp','assets/images/cases/99/imageye___-_6924205a73c8da16db0f5660_tatil-99-nova-linguagem-visual-smartphone-displaying-app.webp','assets/images/cases/99/imageye___-_6924205edf44a64f77a34a72_tatil-99-nova-linguagem-visual-framed-posters-gallery.webp','assets/images/cases/99/imageye___-_69242084e72288e44cd8981f_tatil-99-nova-linguagem-visual-notebook-with-yellow-design.webp','assets/images/cases/99/imageye___-_692420acdb6ccb7c5603d7ff_tatil-99-nova-linguagem-visual-open-book-with-yellow-pages.webp','assets/images/cases/99/imageye___-_692420b0ceb4d12ea2ac9faa_tatil-99-nova-linguagem-visual-map-of-sao-paulo.webp','assets/images/cases/99/imageye___-_692420b5b54d651606e73bfa_tatil-99-nova-linguagem-visual-collage-of-graphics-and-photos.webp','assets/images/cases/99/imageye___-_692420bf6219eca972b28b79_tatil-99-nova-linguagem-visual-yellow-graphic-design.webp','assets/images/cases/99/imageye___-_692420c563bdeb9ba92f8b11_tatil-99-nova-linguagem-visual-car-ride-experience.webp','assets/images/cases/99/imageye___-_692420cb09c8c9bc1c417079_tatil-99-nova-linguagem-visual-app-interface-for-women-drivers.webp','assets/images/cases/99/imageye___-_69331acb62c25635edf11e0b_tatil-99-nova-linguagem-visual-aerial-parking-lot.webp'],
  martorelli:   ['assets/images/cases/martorelli/1.png','assets/images/cases/martorelli/3.png','assets/images/cases/martorelli/4.png','assets/images/cases/martorelli/5.png','assets/images/cases/martorelli/9.png','assets/images/cases/martorelli/10.png','assets/images/cases/martorelli/11.png','assets/images/cases/martorelli/12.png','assets/images/cases/martorelli/13.png','assets/images/cases/martorelli/14.png','assets/images/cases/martorelli/15.png','assets/images/cases/martorelli/16.png'],
  metallo:      ['assets/images/cases/metallo/1.png','assets/images/cases/metallo/2.png','assets/images/cases/metallo/3.png','assets/images/cases/metallo/4.png','assets/images/cases/metallo/5.png','assets/images/cases/metallo/6.png'],
  papeltec:     ['assets/images/cases/papeltec/1.png','assets/images/cases/papeltec/2.png','assets/images/cases/papeltec/3.png','assets/images/cases/papeltec/4.png','assets/images/cases/papeltec/5.png','assets/images/cases/papeltec/6.png','assets/images/cases/papeltec/7.png','assets/images/cases/papeltec/Frame 2629.png','assets/images/cases/papeltec/Frame 2630.png'],
  caixa:        ['assets/images/cases/caixa/1.png','assets/images/cases/caixa/2.png','assets/images/cases/caixa/3.png','assets/images/cases/caixa/4.png','assets/images/cases/caixa/5.png','assets/images/cases/caixa/6.png','assets/images/cases/caixa/7.png'],
  'natura-homem':['assets/images/cases/natura-homem/1.png','assets/images/cases/natura-homem/2.png','assets/images/cases/natura-homem/3.png','assets/images/cases/natura-homem/4.png','assets/images/cases/natura-homem/5.png','assets/images/cases/natura-homem/6.png'],
  'natura-pais': ['assets/images/cases/natura-pais/1.png','assets/images/cases/natura-pais/2.png','assets/images/cases/natura-pais/3.png','assets/images/cases/natura-pais/4.png','assets/images/cases/natura-pais/5.png'],
  ativa:        ['assets/images/cases/ativa/1.png','assets/images/cases/ativa/2.png','assets/images/cases/ativa/3.png','assets/images/cases/ativa/4.png','assets/images/cases/ativa/5.png','assets/images/cases/ativa/6.png'],
  vibra:        ['assets/images/cases/vibra/1.png','assets/images/cases/vibra/2.png','assets/images/cases/vibra/3.png','assets/images/cases/vibra/4.png','assets/images/cases/vibra/5.png','assets/images/cases/vibra/6.png','assets/images/cases/vibra/7.png'],
  mdesign:      ['assets/images/cases/mdesign/1.gif','assets/images/cases/mdesign/571399534.png','assets/images/cases/mdesign/571399535.png','assets/images/cases/mdesign/Envelope.png','assets/images/cases/mdesign/Frame 2.png','assets/images/cases/mdesign/Frame 3.png','assets/images/cases/mdesign/Frame 84.png'],
};

/* ─── Gallery: scatter + float + lightbox ────────────────────────── */
function initGalleryPage() {
  const lb      = document.getElementById('case-lightbox');
  const lbImg   = document.getElementById('lb-img');
  const lbDots  = document.getElementById('lb-dots');
  const lbClose = document.getElementById('lb-close');
  const lbPrev  = document.getElementById('lb-prev');
  const lbNext  = document.getElementById('lb-next');

  const allItems    = [];
  const allProjects = [];
  const allLabels   = [];

  // Collect items + add captions
  document.querySelectorAll('.gallery-group').forEach(group => {
    const label   = group.querySelector('.gallery-group-label')?.textContent.trim() || '';
    const project = group.dataset.project || '';
    group.querySelectorAll('.gallery-item').forEach(item => {
      allItems.push(item);
      allProjects.push(project);
      allLabels.push(label);

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
    item.addEventListener('click', () => openCaseLightbox(allProjects[i]));
  });

  document.querySelectorAll('.gallery-group').forEach(g => g.remove());

  // ── Scatter + float ──────────────────────────────────────────────
  const FLOAT_ANIMS = ['float-a', 'float-b', 'float-c', 'float-d', 'float-e', 'float-f', 'float-g', 'float-h'];

  function doScatter() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      canvas.style.position = 'relative';
      canvas.style.display  = 'grid';
      canvas.style.gridTemplateColumns = '1fr';
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

    // Use actual canvas width (respects max-width + padding)
    const W      = canvas.offsetWidth || (window.innerWidth - 80);
    const H_STEP = 210;
    const SIZES  = [
      Math.round(W * 0.30),
      Math.round(W * 0.65),
      Math.round(W * 1.00),
    ];

    const order = allItems.map((_, i) => i).sort(() => Math.random() - 0.5);
    canvas.style.height = (order.length * H_STEP + 600) + 'px';

    order.forEach((srcIdx, plotIdx) => {
      const item = allItems[srcIdx];
      const w    = SIZES[Math.floor(Math.random() * SIZES.length)];
      const maxX = Math.max(0, W - w);
      const x    = Math.round(Math.random() * maxX);
      const y    = Math.round(plotIdx * H_STEP + Math.random() * 140);

      item.style.position = 'absolute';
      item.style.width    = w + 'px';
      item.style.height   = 'auto';
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

  // ── Case lightbox ───────────────────────────────────────────────
  let lbSrcs = [];
  let lbIdx  = 0;

  function openCaseLightbox(project) {
    lbSrcs = (CASE_IMAGES[project] || []).filter(s => !/\.(mp4|mov)$/i.test(s));
    if (!lbSrcs.length) return;
    lbIdx = 0;
    buildDots();
    showSlide(0);
    lb.classList.add('visible');
  }

  function buildDots() {
    lbDots.innerHTML = '';
    lbSrcs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'case-lb-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { lbIdx = i; showSlide(i); });
      lbDots.appendChild(dot);
    });
  }

  function showSlide(idx) {
    lbImg.classList.add('fading');
    setTimeout(() => {
      lbImg.src = lbSrcs[idx];
      lbImg.classList.remove('fading');
      lbDots.querySelectorAll('.case-lb-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    }, 180);
  }

  function closeLightbox() { lb.classList.remove('visible'); }

  if (lb) {
    lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    lbPrev.addEventListener('click', e => {
      e.stopPropagation();
      lbIdx = (lbIdx - 1 + lbSrcs.length) % lbSrcs.length;
      showSlide(lbIdx);
    });
    lbNext.addEventListener('click', e => {
      e.stopPropagation();
      lbIdx = (lbIdx + 1) % lbSrcs.length;
      showSlide(lbIdx);
    });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('visible')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + lbSrcs.length) % lbSrcs.length; showSlide(lbIdx); }
      if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % lbSrcs.length; showSlide(lbIdx); }
    });
    let touchX = 0;
    lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) {
        lbIdx = dx < 0 ? (lbIdx + 1) % lbSrcs.length : (lbIdx - 1 + lbSrcs.length) % lbSrcs.length;
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
