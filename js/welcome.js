export function initWelcome(armGather) {
  const path   = window.location.pathname;
  const isHome = path === '/' || path.endsWith('index.html') || path === '';
  const screen = document.getElementById('wl-screen');

  if (!isHome || !screen) {
    if (screen) screen.remove();
    if (armGather) armGather();
    document.dispatchEvent(new CustomEvent('welcome-done'));
    return;
  }

  if (window.location.hash || window.innerWidth <= 768) {
    screen.remove();
    if (armGather) armGather();
    document.dispatchEvent(new CustomEvent('welcome-done'));
    return;
  }

  const safetyTimer = setTimeout(revealHome, 8000);

  const style = document.createElement('style');
  style.textContent = `
    #wl-screen {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: #F2F7B5;
      overflow: hidden;
    }
    .wl-pct {
      position: absolute;
      top: 1.5rem;
      left: 2rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #111;
      font-family: system-ui, sans-serif;
      z-index: 2;
      letter-spacing: 0.04em;
    }
    .wl-cookie {
      position: absolute;
      top: 1.5rem;
      right: 2rem;
      font-size: 0.7rem;
      color: rgba(17,17,17,0.45);
      font-family: system-ui, sans-serif;
      max-width: 200px;
      text-align: right;
      line-height: 1.45;
      z-index: 2;
    }
    .wl-logo-wrap {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }
    .wl-logo-img {
      --wl-p: 0;
      width: 100%;
      height: auto;
      display: block;
      -webkit-mask-image: linear-gradient(
        to top,
        black calc(var(--wl-p) * 80%),
        transparent calc(var(--wl-p) * 100%)
      );
      mask-image: linear-gradient(
        to top,
        black calc(var(--wl-p) * 80%),
        transparent calc(var(--wl-p) * 100%)
      );
    }
    .wl-fish {
      position: absolute;
      width: 140px;
      height: auto;
      top: 38%;
      left: -140px;
      animation: wl-swim 4.5s linear infinite;
    }
    @keyframes wl-swim {
      from { transform: translateX(0) scaleX(-1); }
      to   { transform: translateX(calc(100vw + 140px)) scaleX(-1); }
    }
    #wl-screen.is-done {
      transition: opacity 0.6s ease;
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  const pctEl = document.createElement('div');
  pctEl.className = 'wl-pct';
  pctEl.textContent = '0%';

  const lang = document.documentElement.lang;
  const cookieEl = document.createElement('div');
  cookieEl.className = 'wl-cookie';
  cookieEl.textContent = lang === 'en'
    ? 'This site uses necessary cookies. By browsing, you agree to their use.'
    : 'Este site usa cookies necessários. Ao navegar, você concorda com seu uso.';

  const logoWrap = document.createElement('div');
  logoWrap.className = 'wl-logo-wrap';
  const logoImg = new Image();
  logoImg.src = 'assets/images/logo-mau.svg';
  logoImg.alt = '';
  logoImg.className = 'wl-logo-img';
  logoWrap.appendChild(logoImg);

  const fish = new Image();
  fish.src = 'assets/images/baiacu-3d.png';
  fish.alt = '';
  fish.className = 'wl-fish';

  screen.appendChild(pctEl);
  screen.appendChild(cookieEl);
  screen.appendChild(logoWrap);
  screen.appendChild(fish);

  const DURATION = 2500;
  let startTime = null;

  requestAnimationFrame(function tick(ts) {
    if (!startTime) startTime = ts;
    const pct = Math.min(100, Math.round(((ts - startTime) / DURATION) * 100));
    pctEl.textContent = pct + '%';
    logoImg.style.setProperty('--wl-p', pct / 100);
    if (pct < 100) {
      requestAnimationFrame(tick);
    } else {
      setTimeout(finish, 500);
    }
  });

  function finish() {
    clearTimeout(safetyTimer);
    screen.classList.add('is-done');
    setTimeout(revealHome, 650);
  }

  function revealHome() {
    clearTimeout(safetyTimer);
    screen.remove();
    style.remove();
    if (armGather) armGather();
    document.dispatchEvent(new CustomEvent('welcome-done'));
  }
}
