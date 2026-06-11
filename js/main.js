import { initI18n, getTranslation } from './i18n.js';

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
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText('talkmauriciof@gmail.com')
        .then(() => {
          btn.textContent = getTranslation('nav_copied');
          const key = btn.dataset.i18n;
          setTimeout(() => {
            btn.textContent = key ? getTranslation(key) : btn.dataset.origText;
          }, 2000);
        })
        .catch(() => { window.location.href = 'mailto:talkmauriciof@gmail.com'; });
    });
    if (!btn.dataset.i18n) btn.dataset.origText = btn.textContent;
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
const TRACKS = [
  'assets/audio/Os-Tincoas---Deixa-A-Gira-Girar-j-g-b-edit---millemon---electronic-_-world-music-youtube.mp3',
  'assets/audio/Tom Misch - It Runs Through Me  INSTRUMENTAL - Shai Town (youtube).mp3'
];

function initAudio() {
  const btn     = document.getElementById('audio-btn');
  const audio   = document.getElementById('bg-audio');
  const popover = document.getElementById('audio-track-popover');
  if (!btn || !audio || !popover) return;

  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => btn.classList.add('playing')).catch(() => {});
    } else {
      audio.pause();
      btn.classList.remove('playing');
    }
  });

  popover.querySelectorAll('.track-opt').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      const idx = parseInt(opt.dataset.track);
      const wasPlaying = !audio.paused;
      const currentTime = 0;

      popover.querySelectorAll('.track-opt').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      audio.pause();
      audio.src = TRACKS[idx];
      audio.currentTime = currentTime;

      if (wasPlaying) {
        audio.play().then(() => btn.classList.add('playing')).catch(() => {});
      } else {
        btn.classList.remove('playing');
      }
    });
  });
}

/* ─── Header scroll — transparent + auto-hide over showcase ─────── */
function initHeaderScroll() {
  const header   = document.querySelector('.site-header');
  const showcase = document.getElementById('work');
  if (!header) return;

  let hideTimer   = null;
  let lastScrollY = window.scrollY;

  function showHeader() {
    clearTimeout(hideTimer);
    header.classList.remove('is-hidden');
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => header.classList.add('is-hidden'), 2000);
  }

  function isOverShowcase() {
    if (!showcase) return false;
    const rect = showcase.getBoundingClientRect();
    return rect.top <= 72 && rect.bottom > 0;
  }

  function update() {
    const scrolled = window.scrollY > 50;
    header.classList.toggle('is-scrolled', scrolled);

    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;

    if (!scrolled) {
      showHeader();
      return;
    }

    if (dy < 0) {
      showHeader();
      return;
    }

    if (isOverShowcase()) scheduleHide();
  }

  window.addEventListener('scroll', update, { passive: true });

  document.addEventListener('mousemove', e => {
    if (e.clientY < 80) showHeader();
  });

  update();
}

/* ─── Bio fade on scroll ─────────────────────────────────────────── */
function initBioFade() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  const update = () => {
    const bottom = hero.getBoundingClientRect().bottom;
    const height = hero.offsetHeight;
    const fadeStart = height * 0.5;
    const fadeEnd   = height * 0.1;
    const progress  = Math.min(1, Math.max(0, (bottom - fadeEnd) / (fadeStart - fadeEnd)));
    hero.style.opacity = progress;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─── Feed items ─────────────────────────────────────────────────── */
const FEED_ITEMS = [
  'assets/images/feed/1.png',
  'assets/images/feed/2.png',
  'assets/images/feed/3.png',
  'assets/images/feed/4.png',
  'assets/images/feed/5.png',
  'assets/images/feed/6.gif',
  'assets/images/feed/7.png',
  'assets/images/feed/8.gif',
  'assets/images/feed/9.png',
  'assets/images/feed/10.mp4',
  'assets/images/feed/11.png',
  'assets/images/feed/12.gif',
  'assets/images/feed/13.png',
  'assets/images/feed/14.png',
  'assets/images/feed/15.jpg',
  'assets/images/feed/16.png',
  'assets/images/feed/17.jpg',
  'assets/images/feed/18.png',
  'assets/images/feed/19.png',
  'assets/images/feed/20.png',
  'assets/images/feed/21.gif',
  'assets/images/feed/22.png',
  'assets/images/feed/23.png',
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ─── Feed showcase (random auto-play) ──────────────────────────── */
function initFeedShowcase() {
  const section = document.getElementById('work');
  if (!section) return;

  const items = [...FEED_ITEMS];
  let idx = 0;
  let current = null;
  let timer = null;

  function next() {
    if (idx >= items.length) { idx = 0; }
    const src = items[idx++];
    const isVideo = src.endsWith('.mp4');

    let el;
    if (isVideo) {
      el = document.createElement('video');
      el.autoplay = true;
      el.muted = true;
      el.playsInline = true;
      el.loop = false;
      el.src = src;
      el.addEventListener('ended', () => { clearTimeout(timer); next(); });
    } else {
      el = document.createElement('img');
      el.src = src;
      el.alt = '';
    }
    el.className = 'feed-media';
    section.appendChild(el);

    const old = current;
    current = el;

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));

    if (old) {
      old.classList.remove('visible');
      setTimeout(() => { if (old.parentNode) old.remove(); }, 750);
    }

    if (!isVideo) {
      clearTimeout(timer);
      timer = setTimeout(next, 4500);
    }
  }

  next();
}

/* ─── Project data ───────────────────────────────────────────────── */
const PROJECT_DATA = {
  enjoei: {
    client: 'Enjoei',
    detail: 'Enjoei came to us at a turning point. Born from internet culture, the brand had accumulated multiple references, codes, and personalities, but needed clearer structure and maturity to evolve alongside a growing audience. Our role was to organize this abundance without losing its irreverence, shaping a flexible, contemporary, and living identity system.\n\nWe redesigned the logo, developed proprietary assets, and created Enjoei Display, a custom typeface built to support multiple moods and expressions. Technology extended the craft through a creative platform that turns letters into patterns, prints, and infinite compositions for everyday use.\n\nAs a Senior Designer, I was deeply involved across all aspects of the project, from visual identity and typography to the creative platform, case development, and visual assets. Developed at Tátil Design.',
    credits: [
      [{ pt: 'Design',     en: 'Design' },     'Eduardo França, Gustavo André, Mauricio Filho e Mariana Hermeto', { pt: 'Direção: Dandara Almeida', en: 'Direction: Dandara Almeida' }],
      [{ pt: 'Estratégia', en: 'Strategy' },   'Anna Carla, Carol Polli e Sarah Stutz', { pt: 'Direção: Paula Marchiori', en: 'Direction: Paula Marchiori' }],
      [{ pt: 'Verbal',     en: 'Copywriting' },'Elen Campos e Vallécia Carvalho'],
      [{ pt: 'Parceiros',  en: 'Partners' },   'Tipografia Enjoei Display: Blackletra', 'Programação criativa: André Burnier', 'Identidade sonora: Consoante'],
    ]
  },
  justos:        { client: 'Justos' },
  phlor:         { client: 'Phlor' },
  metallo:       { client: 'Metallo' },
  papeltec:      { client: 'Papeltec' },
  caixa:         { client: 'Caixa' },
  'natura-homem':{ client: 'Natura' },
  'natura-pais': { client: 'Natura' },
  ativa:         { client: 'Ativa' },
  vibra:         { client: 'Vibra' },
  mdesign:       { client: 'MDesign' },
};

/* ─── Work table ─────────────────────────────────────────────────── */
function initWorkTable() {
  const wrap = document.querySelector('.work-table-wrap');
  if (!wrap) return;

  const rows = wrap.querySelectorAll('.wt-row');
  const preview = document.getElementById('wt-hover-preview');
  const previewImg = preview ? preview.querySelector('img') : null;
  let activeRow = null;

  if (preview && previewImg) {
    document.addEventListener('mousemove', e => {
      preview.style.left = e.clientX + 'px';
      preview.style.top  = e.clientY + 'px';
    });

    rows.forEach(row => {
      const head = row.querySelector('.wt-row-head');
      head.addEventListener('mouseenter', () => {
        if (row.classList.contains('is-open')) return;
        try {
          const imgs = JSON.parse(row.dataset.images || '[]');
          if (imgs.length) { previewImg.src = imgs[0]; preview.classList.add('visible'); }
        } catch(e) {}
      });
      head.addEventListener('mouseleave', () => preview.classList.remove('visible'));
    });
  }

  rows.forEach(row => {
    row.querySelector('.wt-row-head').addEventListener('click', () => {
      const isOpen = row.classList.contains('is-open');
      if (activeRow && activeRow !== row) closeRow(activeRow);
      isOpen ? (() => { closeRow(row); activeRow = null; })()
             : (() => { openRow(row);  activeRow = row;  })();
    });
  });

  document.getElementById('lang-round')?.addEventListener('click', () => {
    if (activeRow) { closeRow(activeRow); activeRow = null; }
    wrap.querySelectorAll('.wt-expand-inner[data-built]').forEach(el => delete el.dataset.built);
  });

  function openRow(row) {
    if (preview) preview.classList.remove('visible');
    row.classList.add('is-open');
    buildExpand(row);
    requestAnimationFrame(() => row.querySelector('.wt-expand').classList.add('is-open'));
  }

  function closeRow(row) {
    row.classList.remove('is-open');
    row.querySelector('.wt-expand').classList.remove('is-open');
  }

  function buildExpand(row) {
    const inner = row.querySelector('.wt-expand-inner');
    if (inner.dataset.built) return;
    inner.dataset.built = '1';

    const project  = row.dataset.project;
    const data     = PROJECT_DATA[project] || {};
    const name     = row.querySelector('.wt-name')?.textContent || '';
    const sector   = row.querySelector('.wt-sector')?.textContent || '';
    const services = row.querySelector('.wt-services')?.textContent || '';

    let imgs = [];
    try { imgs = JSON.parse(row.dataset.images || '[]'); } catch(e) {}

    // ── Info panel (col 1) ───────────────────────────────────────
    const info = document.createElement('div');
    info.className = 'wt-info-panel';

    const titleEl = document.createElement('h2');
    titleEl.className = 'wt-expand-title';
    titleEl.textContent = name;
    info.appendChild(titleEl);

    const meta = document.createElement('div');
    meta.className = 'wt-expand-meta';
    const svcEl = document.createElement('span');
    svcEl.className = 'wt-expand-svc';
    svcEl.textContent = services;
    meta.appendChild(svcEl);
    info.appendChild(meta);

    if (data.detail) {
      const desc = document.createElement('div');
      desc.className = 'wt-expand-desc';
      desc.innerHTML = data.detail.split('\n\n').map(p =>
        `<p>${p.replace(/\n/g, '<br>')}</p>`
      ).join('');
      info.appendChild(desc);
    }

    if (data.credits && data.credits.length) {
      const isEN = document.documentElement.lang === 'en';
      const credWrap = document.createElement('div');
      credWrap.className = 'wt-credits';

      const credToggle = document.createElement('button');
      credToggle.className = 'wt-credits-toggle';
      const credLabel = document.createElement('span');
      credLabel.className = 'wt-credits-label';
      credLabel.textContent = isEN ? 'Technical Sheet' : 'Ficha Técnica';
      const credIcon = document.createElement('span');
      credIcon.className = 'wt-credits-icon';
      credIcon.textContent = '+';
      credToggle.appendChild(credLabel);
      credToggle.appendChild(credIcon);

      const credBody = document.createElement('div');
      credBody.className = 'wt-credits-body';

      data.credits.forEach(([labelObj, ...values]) => {
        const label = typeof labelObj === 'object' ? (isEN ? labelObj.en : labelObj.pt) : labelObj;
        const credRow = document.createElement('div');
        credRow.className = 'wt-credits-row';
        const keyEl = document.createElement('span');
        keyEl.className = 'wt-credits-key';
        keyEl.textContent = label;
        credRow.appendChild(keyEl);
        values.forEach(v => {
          const resolved = typeof v === 'object' ? (isEN ? v.en : v.pt) : v;
          const valEl = document.createElement('span');
          valEl.className = 'wt-credits-val';
          valEl.textContent = resolved;
          credRow.appendChild(valEl);
        });
        credBody.appendChild(credRow);
      });

      credToggle.addEventListener('click', () => {
        const open = credWrap.classList.toggle('is-open');
        credIcon.textContent = open ? '−' : '+';
      });

      credWrap.appendChild(credToggle);
      credWrap.appendChild(credBody);
      info.appendChild(credWrap);
    }

    inner.appendChild(info);

    // ── Carousel wrap (cols 2–3, aligned to services col) ────────
    const carouselWrap = document.createElement('div');
    carouselWrap.className = 'wt-carousel-wrap';

    const carouselOuter = document.createElement('div');
    carouselOuter.className = 'wt-carousel-outer';

    const carousel = document.createElement('div');
    carousel.className = 'wt-carousel';

    imgs.forEach(src => {
      let el;
      if (src.endsWith('.mp4')) {
        el = document.createElement('video');
        el.src      = src;
        el.autoplay = true;
        el.muted    = true;
        el.loop     = true;
        el.playsInline = true;
        el.style.height = '100%';
        el.style.width  = 'auto';
        el.style.borderRadius = '6px';
        el.style.flexShrink = '0';
        el.style.display = 'block';
      } else {
        el = document.createElement('img');
        el.src     = src;
        el.alt     = '';
        el.loading = 'lazy';
      }
      carousel.appendChild(el);
    });
    carouselOuter.appendChild(carousel);
    carouselWrap.appendChild(carouselOuter);

    // Dots
    if (imgs.length > 1) {
      const dotsEl = document.createElement('div');
      dotsEl.className = 'wt-dots';

      const dots = imgs.map((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'wt-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Image ${i + 1}`);
        dot.addEventListener('click', e => {
          e.preventDefault();
          dot.blur();
          const imgEl = carousel.children[i];
          if (imgEl) carouselOuter.scrollTo({ left: imgEl.offsetLeft, behavior: 'smooth' });
        });
        dotsEl.appendChild(dot);
        return dot;
      });

      carouselOuter.addEventListener('scroll', () => {
        const mid = carouselOuter.scrollLeft + carouselOuter.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        Array.from(carousel.children).forEach((img, i) => {
          const dist = Math.abs(img.offsetLeft + img.offsetWidth / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === best));
      }, { passive: true });

      carouselWrap.appendChild(dotsEl);
    }

    inner.appendChild(carouselWrap);
  }
}

/* ─── Gallery ────────────────────────────────────────────────────── */
const GALLERY_DATA = [
  { project: 'enjoei',   label: 'Enjoei',
    picks: ['assets/images/cases/enjoei/1.png','assets/images/cases/enjoei/5.png','assets/images/cases/enjoei/12.png'],
    all:   ['assets/images/cases/enjoei/1.png','assets/images/cases/enjoei/2.jpg','assets/images/cases/enjoei/3.jpg','assets/images/cases/enjoei/4.jpg','assets/images/cases/enjoei/5.png','assets/images/cases/enjoei/6.jpg','assets/images/cases/enjoei/7.png','assets/images/cases/enjoei/8.png','assets/images/cases/enjoei/10.png','assets/images/cases/enjoei/11.jpg','assets/images/cases/enjoei/12.png','assets/images/cases/enjoei/14.png','assets/images/cases/enjoei/15.png','assets/images/cases/enjoei/16.jpg','assets/images/cases/enjoei/17.jpg','assets/images/cases/enjoei/18.jpg','assets/images/cases/enjoei/20.png','assets/images/cases/enjoei/21.png','assets/images/cases/enjoei/22.png'] },
  { project: 'justos',   label: 'Justos',
    picks: ['assets/images/cases/justos/1.png','assets/images/cases/justos/6.png','assets/images/cases/justos/11.png'],
    all:   ['assets/images/cases/justos/1.png','assets/images/cases/justos/3.png','assets/images/cases/justos/6.png','assets/images/cases/justos/7.png','assets/images/cases/justos/9.png','assets/images/cases/justos/10.png','assets/images/cases/justos/11.png','assets/images/cases/justos/13.png','assets/images/cases/justos/15.png'] },
  { project: 'phlor',    label: 'Phlor',
    picks: ['assets/images/cases/phlor/1.png','assets/images/cases/phlor/5.png','assets/images/cases/phlor/10.png'],
    all:   ['assets/images/cases/phlor/1.png','assets/images/cases/phlor/2.png','assets/images/cases/phlor/3.png','assets/images/cases/phlor/4.png','assets/images/cases/phlor/5.png','assets/images/cases/phlor/6.png','assets/images/cases/phlor/7.png','assets/images/cases/phlor/8.png','assets/images/cases/phlor/9.png','assets/images/cases/phlor/10.png','assets/images/cases/phlor/11.png','assets/images/cases/phlor/12.png','assets/images/cases/phlor/13.png','assets/images/cases/phlor/14.png','assets/images/cases/phlor/15.png'] },
  { project: 'metallo',  label: 'Metallo',
    picks: ['assets/images/cases/metallo/1.png','assets/images/cases/metallo/3.png','assets/images/cases/metallo/5.png'],
    all:   ['assets/images/cases/metallo/1.png','assets/images/cases/metallo/2.png','assets/images/cases/metallo/3.png','assets/images/cases/metallo/4.png','assets/images/cases/metallo/5.png','assets/images/cases/metallo/6.png'] },
  { project: 'papeltec', label: 'Papeltec',
    picks: ['assets/images/cases/papeltec/1.png','assets/images/cases/papeltec/4.png','assets/images/cases/papeltec/7.png'],
    all:   ['assets/images/cases/papeltec/1.png','assets/images/cases/papeltec/2.png','assets/images/cases/papeltec/3.png','assets/images/cases/papeltec/4.png','assets/images/cases/papeltec/5.png','assets/images/cases/papeltec/6.png','assets/images/cases/papeltec/7.png','assets/images/cases/papeltec/Frame 2629.png','assets/images/cases/papeltec/Frame 2630.png'] },
  { project: 'caixa',    label: 'Caixa',
    picks: ['assets/images/cases/caixa.png'],
    all:   ['assets/images/cases/caixa.png'] },
  { project: 'natura',   label: 'Natura',
    picks: ['assets/images/cases/natura.png'],
    all:   ['assets/images/cases/natura.png'] },
  { project: 'ativa',    label: 'Ativa',
    picks: ['assets/images/cases/ativa/1.png','assets/images/cases/ativa/3.png','assets/images/cases/ativa/5.png'],
    all:   ['assets/images/cases/ativa/1.png','assets/images/cases/ativa/2.png','assets/images/cases/ativa/3.png','assets/images/cases/ativa/4.png','assets/images/cases/ativa/5.png','assets/images/cases/ativa/6.png'] },
  { project: 'vibra',    label: 'Vibra Picto',
    picks: ['assets/images/cases/vibra/1.png','assets/images/cases/vibra/3.png','assets/images/cases/vibra/5.png'],
    all:   ['assets/images/cases/vibra/1.png','assets/images/cases/vibra/2.png','assets/images/cases/vibra/3.png','assets/images/cases/vibra/4.png','assets/images/cases/vibra/5.png','assets/images/cases/vibra/6.png','assets/images/cases/vibra/7.png'] },
  { project: 'mdesign',  label: 'MDesign',
    picks: ['assets/images/cases/mdesign/1.gif','assets/images/cases/mdesign/571399534.png','assets/images/cases/mdesign/Frame 84.png'],
    all:   ['assets/images/cases/mdesign/1.gif','assets/images/cases/mdesign/571399534.png','assets/images/cases/mdesign/571399535.png','assets/images/cases/mdesign/Envelope.png','assets/images/cases/mdesign/Frame 2.png','assets/images/cases/mdesign/Frame 3.png','assets/images/cases/mdesign/Frame 84.png'] },
];

function initGallery() {
  const section = document.getElementById('gallery');
  if (!section) return;

  // Label
  const label = document.createElement('p');
  label.className = 'gallery-label';
  label.textContent = 'Gallery';
  section.appendChild(label);

  // Flat list of gallery items (shuffled)
  const flat = [];
  GALLERY_DATA.forEach(({ project, label: proj, picks, all }) => {
    picks.forEach(src => flat.push({ src, project, label: proj, all }));
  });
  shuffle(flat);

  // Scatter layout: 5 x-zones
  const zones   = [3, 19, 38, 57, 73]; // % from left
  const zoneY   = zones.map(() => 0);
  const IMG_H   = 200; // fixed image height (px)
  const CAP_H   = 24;
  const GAP_MIN = 70;
  const GAP_RND = 140;

  const canvas = document.createElement('div');
  canvas.className = 'gallery-canvas';
  section.appendChild(canvas);

  flat.forEach(item => {
    // Place in shortest zone, with slight randomness to avoid strict ordering
    const candidates = zoneY.map((y, i) => ({ i, y })).sort((a, b) => a.y - b.y).slice(0, 3);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const zoneIdx = chosen.i;

    const topGap  = GAP_MIN + Math.floor(Math.random() * GAP_RND);
    const top     = zoneY[zoneIdx] + (zoneY[zoneIdx] === 0 ? Math.floor(Math.random() * 80) : topGap);

    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.style.left = zones[zoneIdx] + '%';
    el.style.top  = top + 'px';
    el.dataset.project = item.project;

    const img = document.createElement('img');
    img.src     = item.src;
    img.alt     = '';
    img.loading = 'lazy';

    const cap = document.createElement('p');
    cap.className   = 'gallery-item-caption';
    cap.textContent = item.label;

    el.appendChild(img);
    el.appendChild(cap);
    canvas.appendChild(el);

    el.addEventListener('click', () => openLightbox(item.all, item.all.indexOf(item.src), item.label));

    zoneY[zoneIdx] = top + IMG_H + CAP_H + GAP_MIN;
  });

  canvas.style.height = Math.max(...zoneY) + 80 + 'px';

  // ── Lightbox ────────────────────────────────────────────────────
  const lb      = document.createElement('div');
  lb.className  = 'gallery-lightbox';
  lb.innerHTML  = `
    <button class="gallery-lb-close" aria-label="Close">✕</button>
    <button class="gallery-lb-prev"  aria-label="Previous">←</button>
    <img class="gallery-lightbox-img" src="" alt="" />
    <button class="gallery-lb-next"  aria-label="Next">→</button>
    <span class="gallery-lb-project"></span>
    <span class="gallery-lb-counter"></span>
  `;
  document.body.appendChild(lb);

  const lbImg     = lb.querySelector('.gallery-lightbox-img');
  const lbCounter = lb.querySelector('.gallery-lb-counter');
  const lbProject = lb.querySelector('.gallery-lb-project');
  let lbImgs = [], lbIdx = 0;

  function openLightbox(imgs, startIdx, projectLabel) {
    lbImgs = imgs;
    lbIdx  = Math.max(0, startIdx);
    lbProject.textContent = projectLabel;
    showLbSlide(lbIdx);
    lb.classList.add('visible');
  }

  function showLbSlide(idx) {
    lbImg.classList.add('fading');
    setTimeout(() => {
      lbImg.src = lbImgs[idx];
      lbCounter.textContent = (idx + 1) + ' / ' + lbImgs.length;
      lbImg.classList.remove('fading');
    }, 160);
  }

  lb.querySelector('.gallery-lb-close').addEventListener('click', () => lb.classList.remove('visible'));
  lb.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('visible'); });

  lb.querySelector('.gallery-lb-prev').addEventListener('click', e => {
    e.stopPropagation();
    lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length;
    showLbSlide(lbIdx);
  });
  lb.querySelector('.gallery-lb-next').addEventListener('click', e => {
    e.stopPropagation();
    lbIdx = (lbIdx + 1) % lbImgs.length;
    showLbSlide(lbIdx);
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('visible')) return;
    if (e.key === 'Escape')      lb.classList.remove('visible');
    if (e.key === 'ArrowLeft')   { lbIdx = (lbIdx - 1 + lbImgs.length) % lbImgs.length; showLbSlide(lbIdx); }
    if (e.key === 'ArrowRight')  { lbIdx = (lbIdx + 1) % lbImgs.length; showLbSlide(lbIdx); }
  });
}

/* ─── Hero card gather animation ────────────────────────────────── */
function initHeroCards() {
  const cards     = document.querySelectorAll('.hero-card');
  const hero      = document.querySelector('.hero-section');
  const photoCard = hero ? hero.querySelector('.hero-photo-card') : null;
  if (!cards.length) return;

  const UNIT     = 170;
  const HOLD_MS  = 3000; // 3s spread before gathering
  let   autoTimer = null;

  function hidePhotoCard() {
    if (photoCard) { photoCard.style.transition = 'none'; photoCard.style.opacity = '0'; }
  }
  function showPhotoCard() {
    if (photoCard) { photoCard.style.transition = 'opacity 0.4s ease'; photoCard.style.opacity = '1'; }
  }

  // Instant gather (no animation) — used as reset state
  function snapGathered() {
    clearTimeout(autoTimer);
    hidePhotoCard();
    cards.forEach(card => {
      card.style.transition = 'none';
      card.style.transform  = 'translateX(0)';
      card.style.opacity    = '1';
    });
  }

  // Animated spread from center → then auto-gather after HOLD_MS
  function animateSpreadThenGather() {
    clearTimeout(autoTimer);
    hidePhotoCard();

    // Spread: inner cards go first (lower delay), outer arrive last
    cards.forEach(card => {
      const order = parseInt(card.dataset.order);
      const d = (order - 1) * 80; // inner first
      const x = card.dataset.side === 'left' ? -(order * UNIT) : (order * UNIT);
      card.style.transition = `transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94) ${d}ms`;
      card.style.transform  = `translateX(${x}px)`;
      card.style.opacity    = '1';
    });

    // After HOLD_MS, gather back
    autoTimer = setTimeout(() => {
      cards.forEach(card => {
        const order = parseInt(card.dataset.order);
        const d = (order - 1) * 60;
        card.style.transition = `transform 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${d}ms, opacity 0.5s ease ${d}ms`;
        card.style.transform  = 'translateX(0)';
        card.style.opacity    = '1';
      });
      setTimeout(showPhotoCard, 900 + (4 - 1) * 60 + 100);
    }, HOLD_MS);
  }

  // Start gathered (hidden by typewriter on first visit)
  snapGathered();

  // Called by typewriter after stage reveals, or immediately on repeat visits
  function activate() {
    animateSpreadThenGather();
  }

  // Re-trigger when scrolling back to hero (not on initial load)
  if (hero) {
    let heroWasHidden = false;
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        heroWasHidden = true;
        snapGathered();
      } else if (heroWasHidden) {
        heroWasHidden = false;
        setTimeout(activate, 200);
      }
    }, { threshold: 0.4 }).observe(hero);
  }

  // Re-trigger on Home nav click — prevent reload, scroll to top instead
  document.querySelectorAll('a[href="index.html"], a[href="/"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(activate, 600);
    });
  });

  return activate;
}

/* ─── Bio parallax scale ─────────────────────────────────────────── */
function initBioParallax() {
  const section = document.querySelector('.bio-section');
  if (!section) return;

  section.style.transformOrigin = 'center center';

  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when element top hits bottom of screen, 1 when it reaches 30% from top
    const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.7)));
    const scale = 0.6 + progress * 0.4;
    section.style.transform = `scale(${scale})`;
    section.style.opacity = progress;
  }

  window.addEventListener('scroll', update, { passive: true });
}

/* ─── Hello greeting (first visit only) ─────────────────────────── */
function initHelloGreeting(armGather) {
  const stage   = document.querySelector('.hero-card-stage');
  const tagline = document.querySelector('.welcome-tagline');
  const title   = document.querySelector('.hero-title');
  const FIRST_VISIT_KEY = 'mf-intro-seen';
  const firstVisit = !localStorage.getItem(FIRST_VISIT_KEY);

  if (!firstVisit) {
    if (stage)   stage.style.opacity   = '1';
    if (tagline) tagline.style.opacity = '1';
    if (title)   title.style.opacity   = '1';
    if (armGather) armGather();
    return;
  }

  localStorage.setItem(FIRST_VISIT_KEY, '1');

  [stage, tagline, title].forEach(el => {
    if (el) { el.style.opacity = '0'; el.style.transition = 'none'; }
  });

  const greeting = document.createElement('div');
  greeting.className = 'hello-greeting';
  greeting.textContent = getTranslation('hero_hello');
  document.body.appendChild(greeting);

  requestAnimationFrame(() => requestAnimationFrame(() => greeting.classList.add('visible')));

  setTimeout(() => {
    greeting.style.transition = 'opacity 0.5s ease';
    greeting.style.opacity = '0';
    setTimeout(() => {
      greeting.remove();
      [title, stage, tagline].forEach(el => {
        if (!el) return;
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '1';
      });
      if (armGather) armGather();
    }, 500);
  }, 1800);
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  window.scrollTo(0, 0);
  initOverlay();
  const armGather = initHeroCards();
  initScrollTop();
  initWorkReveal();
  initAudio();
  initHeaderScroll();
  initBioFade();
  initBioParallax();
  initFeedShowcase();
  initWorkTable();
  await initI18n();
  initHelloGreeting(armGather);
  initCopyEmail();
});
