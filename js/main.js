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

/* ─── Dock magnification for thumbnail strip ────────────────────── */
function initDockEffect(showcase) {
  const BASE_H   = 44;
  const MAX_H    = 90;
  const RADIUS   = 130;

  function applyDock(mouseX) {
    const strip = showcase.querySelector('.showcase-thumbs');
    if (!strip) return;
    strip.querySelectorAll('.showcase-thumb-item').forEach(item => {
      const r    = item.getBoundingClientRect();
      const cx   = r.left + r.width / 2;
      const dist = Math.abs(mouseX - cx);
      const t    = Math.max(0, 1 - dist / RADIUS);
      const h    = BASE_H + (MAX_H - BASE_H) * Math.pow(t, 1.5);
      item.style.height = h + 'px';
    });
  }

  function resetDock() {
    const strip = showcase.querySelector('.showcase-thumbs');
    if (!strip) return;
    strip.querySelectorAll('.showcase-thumb-item').forEach(item => {
      item.style.height = BASE_H + 'px';
    });
  }

  showcase.addEventListener('mousemove', e => {
    if (e.target.closest('.showcase-thumbs')) applyDock(e.clientX);
    else resetDock();
  });
  showcase.addEventListener('mouseleave', resetDock);
}

/* ─── Project data ───────────────────────────────────────────────── */
const PROJECT_DATA = {
  enjoei: {
    detail: 'Enjoei came to us at a turning point. Born from internet culture, the brand had accumulated multiple references, codes, and personalities, but needed clearer structure and maturity to evolve alongside a growing audience. Our role was to organize this abundance without losing its irreverence, shaping a flexible, contemporary, and living identity system.\n\nWe redesigned the logo, developed proprietary assets, and created Enjoei Display, a custom typeface built to support multiple moods and expressions. Technology extended the craft through a creative platform that turns letters into patterns, prints, and infinite compositions for everyday use.\n\nAs a Senior Designer, I was deeply involved across all aspects of the project, from visual identity and typography to the creative platform, case development, and visual assets. Projeto desenvolvido na Tátil Design.',
    credits: [
      ['Eduardo França, Gustavo André, Mauricio Filho e Mariana Hermeto', 'Direção: Dandara Almeida'],
      ['Estratégia', 'Anna Carla, Carol Polli e Sarah Stutz', 'Direção: Paula Marchiori'],
      ['Verbal', 'Elen Campos e Vallécia Carvalho'],
      ['Parceiros', 'Tipografia Enjoei Display: Blackletra', 'Programação criativa: André Burnier', 'Identidade sonora: Consoante'],
    ]
  }
};

/* ─── Work showcase ──────────────────────────────────────────────── */
function initWorkShowcase() {
  const track    = document.getElementById('work-showcase-track');
  const rows     = document.querySelectorAll('.work-list-row');

  if (!track || !rows.length) return;

  let images   = [];
  let cur      = 0;
  let activeIdx = 0;

  function buildThumbs(imgs) {
    const showcase = track.parentElement;
    const existing = showcase.querySelector('.showcase-thumbs');
    if (existing) existing.remove();
    if (!imgs.length) return;

    const strip = document.createElement('div');
    strip.className = 'showcase-thumbs';

    imgs.forEach((src, i) => {
      const item = document.createElement('div');
      item.className = 'showcase-thumb-item' + (i === 0 ? ' active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      item.appendChild(img);
      item.addEventListener('click', () => showSlide(i));
      strip.appendChild(item);
    });

    showcase.appendChild(strip);
  }

  function buildSlides(imgs) {
    track.innerHTML = '';
    imgs.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.className = 'work-showcase-img' + (i === 0 ? ' active' : '');
      img.loading = i === 0 ? 'eager' : 'lazy';
      track.appendChild(img);
    });
    cur = 0;
    buildThumbs(imgs);
  }

  function showSlide(n) {
    const slides     = track.querySelectorAll('.work-showcase-img');
    const thumbItems = track.parentElement.querySelectorAll('.showcase-thumb-item');
    if (!slides.length) return;
    slides[cur].classList.remove('active');
    if (thumbItems[cur]) thumbItems[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    if (thumbItems[cur]) {
      thumbItems[cur].classList.add('active');
      thumbItems[cur].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  function buildDetail(row) {
    let detail = row.querySelector('.work-list-detail');
    if (detail) { detail.remove(); return; }

    const data = PROJECT_DATA[row.dataset.project];
    if (!data || !data.detail) return;

    detail = document.createElement('div');
    detail.className = 'work-list-detail';
    detail.innerHTML = data.detail.split('\n\n').map(p =>
      `<p>${p.replace(/\n/g, '<br>')}</p>`
    ).join('');
    row.appendChild(detail);
  }

  function selectProject(row, idx) {
    activeIdx = idx;
    rows.forEach(r => {
      r.classList.remove('active');
      const d = r.querySelector('.work-list-detail');
      if (d) d.remove();
    });
    row.classList.add('active');
    buildDetail(row);

    try { images = JSON.parse(row.dataset.images || '[]'); } catch(e) { images = []; }
    buildSlides(images);

    document.getElementById('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  rows.forEach((row, i) => row.addEventListener('click', () => selectProject(row, i)));

  const firstIdx = Array.from(rows).findIndex(r => r.classList.contains('active'));
  const startRow = rows[firstIdx >= 0 ? firstIdx : 0];
  try { images = JSON.parse(startRow.dataset.images || '[]'); } catch(e) { images = []; }
  buildSlides(images);

  initDockEffect(track.parentElement);
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
  initWorkShowcase();
  await initI18n();
  initHelloGreeting(armGather);
  initCopyEmail();
});
