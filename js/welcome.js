import { getTranslation } from './i18n.js';

export function initWelcome(armGather) {
  const path   = window.location.pathname;
  const isHome = path === '/' || path.endsWith('index.html') || path === '';
  if (!isHome) { if (armGather) armGather(); return; }

  const header  = document.querySelector('.site-header');
  const stage   = document.querySelector('.hero-card-stage');
  const tagline = document.querySelector('.welcome-tagline');
  const title   = document.querySelector('.hero-title');

  // Skip on hash navigation — reveal immediately
  if (window.location.hash) {
    [header, stage, tagline, title].forEach(el => { if (el) el.style.opacity = '1'; });
    if (armGather) armGather();
    document.dispatchEvent(new CustomEvent('welcome-done'));
    return;
  }

  // Safety fallback — reveal content after 7s if animation fails
  const safetyTimer = setTimeout(() => revealHome(), 7000);

  // Hide header + hero content
  [header, stage, tagline, title].forEach(el => {
    if (el) { el.style.transition = 'none'; el.style.opacity = '0'; }
  });

  // Wrap each hero-title span in overflow:hidden clip for reveal animation
  if (title) {
    Array.from(title.querySelectorAll('span')).forEach(span => {
      const clip = document.createElement('div');
      clip.className = 'wl-clip';
      span.parentNode.insertBefore(clip, span);
      clip.appendChild(span);
      span.style.display    = 'block';
      span.style.transform  = 'translateY(110%)';
      span.style.willChange = 'transform';
    });
  }

  /* ── Build overlay ─────────────────────────────────────────────── */
  const ov = document.createElement('div');
  ov.className = 'wl-overlay';
  document.body.appendChild(ov);

  const fish = document.createElement('div');
  fish.className = 'wl-fish';
  fish.textContent = '🐡';
  ov.appendChild(fish);

  const counter = document.createElement('div');
  counter.className = 'wl-counter';
  counter.textContent = '0%';
  ov.appendChild(counter);

  // Position counter where "Welcome" tagline lives
  if (tagline) {
    const r = tagline.getBoundingClientRect();
    counter.style.top       = (r.top + r.height / 2) + 'px';
    counter.style.transform = 'translate(-50%, -50%)';
  }

  /* ── Phase 1 — fish swims left → center, counter 0 → 100% ─────── */
  const LOAD_MS = 3000;
  let t0 = null;

  function ease(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  // Fish starts just inside the left edge — visible from frame 1
  const startX = Math.max(32, window.innerWidth * 0.04);
  fish.style.left      = startX + 'px';
  fish.style.top       = cy + 'px';
  fish.style.fontSize  = '24px';
  fish.style.transform = 'translate(-50%, -50%) scaleX(-1)';
  fish.style.transition = 'none';

  requestAnimationFrame(function tick(ts) {
    if (!t0) t0 = ts;
    const raw = Math.min((ts - t0) / LOAD_MS, 1);
    const p   = ease(raw);
    counter.textContent = Math.round(p * 100) + '%';

    const gR = Math.round(242 + 13 * p);
    const gG = Math.round(247 + 8  * p);
    const gB = Math.round(181 + 73 * p);
    ov.style.background = `linear-gradient(to bottom, rgb(${gR},${gG},${gB}) 0%, #F2F7B5 100%)`;

    const fX  = startX + (cx - startX) * ease(raw);
    const amp = 24 * (1 - ease(raw) * 0.92);
    const fY  = cy + Math.sin(raw * Math.PI * 2 * 1.6) * amp;
    fish.style.left      = fX + 'px';
    fish.style.top       = fY + 'px';
    fish.style.fontSize  = (24 + 72 * ease(raw)) + 'px';
    fish.style.transform = 'translate(-50%, -50%) scaleX(-1)';

    if (ts - t0 < LOAD_MS) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = '100%';
      fish.style.left = cx + 'px';
      fish.style.top  = cy + 'px';
      fish.style.transition = 'transform 0.4s ease';
      fish.style.transform  = 'translate(-50%, -50%) scaleX(1)';
      setTimeout(phase2, 450);
    }
  });

  /* ── Phase 2 — spiral spin + fly to nav + Hello! + circles + reveal ── */
  function phase2() {
    counter.style.transition = 'opacity 0.3s ease';
    counter.style.opacity    = '0';

    void fish.offsetWidth;
    fish.style.transition = 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    fish.style.transform  = 'translate(-50%, -50%) rotate(720deg) scaleX(1)';

    setTimeout(() => {
      fish.style.transition = 'none';
      fish.style.transform  = 'translate(-50%, -50%) scaleX(1)';
      void fish.offsetWidth;

      const navBtn = document.querySelector('.nav-fish-btn');
      if (navBtn) {
        const r = navBtn.getBoundingClientRect();
        fish.style.transition = [
          'left 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          'top 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          'font-size 0.5s ease',
        ].join(',');
        fish.style.left     = (r.left + r.width  / 2) + 'px';
        fish.style.top      = (r.top  + r.height / 2) + 'px';
        fish.style.fontSize = '1.55rem';
      }

      const hello = document.createElement('div');
      hello.className = 'wl-hello';
      hello.textContent = getTranslation('hero_hello');
      ov.appendChild(hello);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        hello.classList.add('visible');
        ov.style.transition = 'background 0.8s ease';
        ov.style.background = '#FFFFFE';
      }));
      setTimeout(() => {
        hello.style.transition = 'opacity 0.6s ease';
        hello.style.opacity    = '0';
      }, 700);

      setTimeout(() => {
        if (header) { header.style.transition = 'opacity 0.2s ease'; header.style.opacity = '1'; }

        const navFish  = document.querySelector('.nav-fish-btn');
        const audioBtn = document.querySelector('#audio-btn');
        const langBtn  = document.querySelector('.lang-round');
        [navFish, audioBtn, langBtn].forEach((btn, i) => {
          if (btn) setTimeout(() => drawCircle(btn), i * 100);
        });

        setTimeout(() => revealHome(), 700);
      }, 520);

    }, 1100);
  }

  /* ── Draw SVG circle clockwise over a nav button ────────────────── */
  function drawCircle(btn) {
    const rect = btn.getBoundingClientRect();
    const sz   = Math.max(rect.width, rect.height);
    const r    = sz / 2 - 1;
    const circ = 2 * Math.PI * r;
    const ns   = 'http://www.w3.org/2000/svg';

    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', sz);
    svg.setAttribute('height', sz);
    svg.style.position       = 'fixed';
    svg.style.top            = (rect.top  + rect.height / 2 - sz / 2) + 'px';
    svg.style.left           = (rect.left + rect.width  / 2 - sz / 2) + 'px';
    svg.style.pointerEvents  = 'none';
    svg.style.zIndex         = '9995';
    svg.style.overflow       = 'visible';

    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', sz / 2);
    circle.setAttribute('cy', sz / 2);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#DFDEDE');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('stroke-linecap', 'round');
    circle.style.strokeDasharray  = circ;
    circle.style.strokeDashoffset = circ;
    circle.style.transform        = 'rotate(-90deg)';
    circle.style.transformOrigin  = `${sz / 2}px ${sz / 2}px`;

    svg.appendChild(circle);
    document.body.appendChild(svg);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      circle.style.transition       = 'stroke-dashoffset 0.5s ease';
      circle.style.strokeDashoffset = '0';
    }));

    setTimeout(() => svg.remove(), 800);
  }

  /* ── Reveal home content ─────────────────────────────────────────── */
  function revealHome() {
    clearTimeout(safetyTimer);

    ov.style.transition = 'opacity 0.5s ease, background 0s';
    ov.style.opacity    = '0';

    if (title) {
      title.style.opacity = '1';
      Array.from(title.querySelectorAll('span')).forEach((span, i) => {
        setTimeout(() => {
          span.style.transition = 'transform 0.7s cubic-bezier(0.22,1,0.36,1)';
          span.style.transform  = 'translateY(0)';
        }, 80 + i * 130);
      });
    }

    if (tagline) { tagline.style.transition = 'opacity 0.6s ease'; tagline.style.opacity = '1'; }
    if (stage)   { stage.style.transition   = 'opacity 0.6s ease'; stage.style.opacity   = '1'; }

    setTimeout(() => {
      ov.remove();
      if (armGather) armGather();
      document.dispatchEvent(new CustomEvent('welcome-done'));
    }, 700);
  }
}
