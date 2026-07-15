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

  // Skip on hash navigation or mobile
  if (window.location.hash || window.innerWidth <= 768) {
    screen.remove();
    if (armGather) armGather();
    document.dispatchEvent(new CustomEvent('welcome-done'));
    return;
  }

  const safetyTimer = setTimeout(revealHome, 8000);

  // Inject styles
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
    .wl-logo-wrap {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }
    .wl-logo-img {
      width: 100%;
      height: auto;
      display: block;
      -webkit-mask-image: linear-gradient(to bottom, black 20%, black 55%, transparent 95%);
      mask-image: linear-gradient(to bottom, black 20%, black 55%, transparent 95%);
    }
    .wl-fish {
      position: absolute;
      width: 160px;
      height: auto;
      top: 38%;
      left: 50%;
      animation: wl-swim 5s ease-in-out infinite;
    }
    @keyframes wl-swim {
      0%   { transform: translateX(calc(-50vw - 110px)) scaleX(1); }
      47%  { transform: translateX(calc(50vw - 70px))  scaleX(1); }
      50%  { transform: translateX(calc(50vw - 70px))  scaleX(-1); }
      97%  { transform: translateX(calc(-50vw - 110px)) scaleX(-1); }
      100% { transform: translateX(calc(-50vw - 110px)) scaleX(1); }
    }
    #wl-screen.is-done {
      transition: opacity 0.6s ease;
      opacity: 0;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Build content
  const pctEl = document.createElement('div');
  pctEl.className = 'wl-pct';
  pctEl.textContent = '0%';

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
  screen.appendChild(logoWrap);
  screen.appendChild(fish);

  // Count percentage over 2.5s
  const DURATION = 2500;
  let startTime = null;

  requestAnimationFrame(function tick(ts) {
    if (!startTime) startTime = ts;
    const pct = Math.min(100, Math.round(((ts - startTime) / DURATION) * 100));
    pctEl.textContent = pct + '%';
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
