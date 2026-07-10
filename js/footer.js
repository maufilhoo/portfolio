export function initFooterMeta() {
  updateDatetime();
  setInterval(updateDatetime, 1_000);
  initFishSwim();
}

function initFishSwim() {
  const fish = document.querySelector('.footer-fish');
  const band = document.querySelector('.footer-fish-band');
  if (!fish || !band) return;

  let x = -120;
  let frame = 0;
  const speed = 1.5;
  const amplitude = 18;
  const waveFreq = 0.025;

  function tick() {
    const fishW = fish.offsetWidth || 120;
    const bandW = band.offsetWidth;
    x += speed;
    if (x > bandW + fishW) x = -fishW;
    const y = Math.sin(frame * waveFreq) * amplitude;
    fish.style.transform = `translate(${x}px, ${y}px)`;
    frame++;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function updateDatetime() {
  const els = document.querySelectorAll('.footer-datetime');
  if (!els.length) return;
  const now = new Date();
  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
  const tz = new Intl.DateTimeFormat('en', {
    timeZoneName: 'short', timeZone: 'America/Sao_Paulo'
  }).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || 'BRT';
  els.forEach(el => { el.textContent = `${time}  (${tz})`; });
}
