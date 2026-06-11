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
  const track        = document.getElementById('work-showcase-track');
  const counter      = document.querySelector('.showcase-counter');
  const prevBtn      = document.querySelector('.showcase-prev');
  const nextBtn      = document.querySelector('.showcase-next');
  const thumbs       = document.querySelectorAll('.work-thumb');
  const hintBtn      = document.querySelector('.work-gallery-hint');
  const galleryOuter = document.querySelector('.work-gallery-outer');
  const detailPanel  = document.querySelector('.work-project-detail');
  const detailText   = document.querySelector('.work-detail-text');
  const creditsToggle  = document.querySelector('.work-credits-toggle');
  const creditsContent = document.querySelector('.work-credits-content');
  const creditsBody    = document.querySelector('.work-credits-body');
  const toggleIcon     = creditsToggle ? creditsToggle.querySelector('.toggle-icon') : null;

  if (!track || !thumbs.length) return;

  let images = [];
  let cur    = 0;
  let creditsOpen = false;

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
    updateCounter();
  }

  function updateCounter() {
    if (counter) counter.textContent = `${cur + 1} / ${images.length}`;
  }

  function showSlide(n) {
    const slides = track.querySelectorAll('.work-showcase-img');
    if (slides.length <= 1) return;
    slides[cur].classList.remove('active');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('active');
    updateCounter();
  }

  function formatCredits(groups) {
    return groups.map(lines =>
      `<div class="work-credits-section">${lines.map(l => `<p>${l}</p>`).join('')}</div>`
    ).join('');
  }

  function selectProject(thumb) {
    thumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    try { images = JSON.parse(thumb.dataset.images || '[]'); } catch(e) { images = []; }
    buildSlides(images);

    if (detailPanel) {
      const data = PROJECT_DATA[thumb.dataset.project];
      if (data && data.detail) {
        detailText.innerHTML = data.detail.split('\n\n').map(p =>
          `<p>${p.replace(/\n/g, '<br>')}</p>`
        ).join('');

        creditsOpen = false;
        if (creditsContent) creditsContent.classList.remove('is-open');
        if (toggleIcon) toggleIcon.textContent = '+';

        if (data.credits && creditsBody) {
          creditsBody.innerHTML = formatCredits(data.credits);
          if (creditsToggle) creditsToggle.style.display = '';
        } else if (creditsToggle) {
          creditsToggle.style.display = 'none';
        }

        detailPanel.classList.add('is-open');
      } else {
        detailPanel.classList.remove('is-open');
      }
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => showSlide(cur - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showSlide(cur + 1));

  if (creditsToggle) {
    creditsToggle.addEventListener('click', () => {
      creditsOpen = !creditsOpen;
      if (creditsContent) creditsContent.classList.toggle('is-open', creditsOpen);
      if (toggleIcon) toggleIcon.textContent = creditsOpen ? '−' : '+';
    });
  }

  if (hintBtn && galleryOuter) {
    hintBtn.addEventListener('click', () => galleryOuter.scrollBy({ left: 250, behavior: 'smooth' }));
  }

  thumbs.forEach(thumb => thumb.addEventListener('click', () => selectProject(thumb)));

  const firstActive = document.querySelector('.work-thumb.active');
  if (firstActive) selectProject(firstActive);
}

/* ─── Hero card gather animation ────────────────────────────────── */
function initHeroCards() {
  const cards     = document.querySelectorAll('.hero-card');
  const hero      = document.querySelector('.hero-section');
  const photoCard = hero ? hero.querySelector('.hero-photo-card') : null;
  if (!cards.length) return;

  const UNIT     = 170;
  const HOLD_MS  = 4000; // 4s spread before gathering
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
  initOverlay();
  const armGather = initHeroCards();
  initScrollTop();
  initWorkReveal();
  initAudio();
  initHeaderScroll();
  initBioParallax();
  initWorkShowcase();
  await initI18n();
  initHelloGreeting(armGather);
  initCopyEmail();
});
