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

/* ─── Hero card gather animation ────────────────────────────────── */
function initHeroCards() {
  const cards     = document.querySelectorAll('.hero-card');
  const hero      = document.querySelector('.hero-section');
  const photoCard = hero ? hero.querySelector('.hero-photo-card') : null;
  if (!cards.length) return;

  const UNIT     = 170;
  const HOLD_MS  = 10000; // 10s spread before gathering
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

  // Re-trigger on Home nav click
  document.querySelectorAll('a[href="index.html"], a[href="/"]').forEach(link => {
    link.addEventListener('click', () => setTimeout(activate, 400));
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

/* ─── Hero typewriter ────────────────────────────────────────────── */
function initHeroTypewriter(armGather) {
  const title   = document.querySelector('.hero-title');
  const spans   = title ? title.querySelectorAll('span') : [];
  const stage   = document.querySelector('.hero-card-stage');
  const tagline = document.querySelector('.welcome-tagline');
  if (!spans.length) return;

  const FIRST_VISIT_KEY = 'mf-intro-seen';
  const firstVisit = !localStorage.getItem(FIRST_VISIT_KEY);

  // Subsequent visits — show everything immediately, skip typewriter
  if (!firstVisit) {
    if (stage)   { stage.style.opacity = '1'; }
    if (tagline) { tagline.style.opacity = '1'; }
    if (armGather) armGather();
    return;
  }

  localStorage.setItem(FIRST_VISIT_KEY, '1');

  if (stage)   { stage.style.opacity = '0'; stage.style.transition = 'none'; }
  if (tagline) { tagline.style.opacity = '0'; tagline.style.transition = 'none'; }

  // Center title in viewport via translateY
  const titleTop = title.getBoundingClientRect().top;
  const offset   = window.innerHeight / 2 - titleTop - title.offsetHeight / 2;
  title.style.transition = 'none';
  title.style.transform  = `translateY(${offset}px)`;

  // Store real texts, clear spans
  const texts = Array.from(spans).map(s => {
    const t = s.textContent;
    s.textContent = '';
    return t;
  });

  // 25% faster base speeds
  function charDelay(ch, prev) {
    const base = 32 + Math.random() * 36;            // 32–68ms
    if ('.!?'.includes(ch))  return base + 240;
    if (',;:'.includes(ch))  return base + 120;
    if (ch === ' ' && prev !== ' ') return base + 15;
    if (Math.random() < 0.04) return base + 135;
    return base;
  }

  function settle() {
    setTimeout(() => {
      title.style.transition = 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)';
      title.style.transform  = 'translateY(0)';
      setTimeout(() => {
        if (stage) { stage.style.transition = 'opacity 0.6s ease'; stage.style.opacity = '1'; }
        if (armGather) armGather(); // activate spread→gather after cards reveal
        setTimeout(() => {
          if (tagline) { tagline.style.transition = 'opacity 0.6s ease'; tagline.style.opacity = '1'; }
        }, 600);
      }, 750);
    }, 200);
  }

  // Phase 2: type real content
  function typeLines() {
    let lineIdx = 0, charIdx = 0;
    function next() {
      if (lineIdx >= spans.length) { settle(); return; }
      if (charIdx < texts[lineIdx].length) {
        const ch = texts[lineIdx][charIdx];
        const prev = charIdx > 0 ? texts[lineIdx][charIdx - 1] : '';
        spans[lineIdx].textContent += ch;
        charIdx++;
        setTimeout(next, charDelay(ch, prev));
      } else {
        lineIdx++; charIdx = 0;
        setTimeout(next, 150 + Math.random() * 112);
      }
    }
    next();
  }

  // Phase 1: type "Hello!" / "Olá!" then erase
  const ERASE_MS = 55;
  const helloStr = getTranslation('hero_hello');
  let hiText = '';
  let hiIdx  = 0;

  function typeHello() {
    if (hiIdx < helloStr.length) {
      hiText += helloStr[hiIdx];
      spans[0].textContent = hiText;
      setTimeout(typeHello, charDelay(helloStr[hiIdx++], helloStr[hiIdx - 2] || ''));
    } else {
      setTimeout(eraseHello, 380);
    }
  }

  function eraseHello() {
    if (hiText.length > 0) {
      hiText = hiText.slice(0, -1);
      spans[0].textContent = hiText;
      setTimeout(eraseHello, ERASE_MS);
    } else {
      setTimeout(typeLines, 200);
    }
  }

  setTimeout(typeHello, 300);
}

/* ─── Init ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initOverlay();
  const armGather = initHeroCards();
  initScrollTop();
  initWorkReveal();
  initAudio();
  initHeaderScroll();
  initFeaturedSlideshow();
  initSliders();
  initScrollHint();
  initBioParallax();
  await initI18n();
  initHeroTypewriter(armGather);
  initCopyEmail();
});
