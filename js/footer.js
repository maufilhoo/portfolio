export function initFooterMeta() {
  updateDatetime();
  setInterval(updateDatetime, 1_000);
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
