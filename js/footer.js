export function initFooterMeta() {
  updateDatetime();
  setInterval(updateDatetime, 60_000);
  fetchLocation();
}

function updateDatetime() {
  const els = document.querySelectorAll('.footer-datetime');
  if (!els.length) return;
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  els.forEach(el => { el.textContent = `${date} — ${time}`; });
}

function fetchLocation() {
  const els = document.querySelectorAll('.footer-location');
  if (!els.length) return;
  fetch('https://ipapi.co/json/')
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      if (!d) return;
      const loc = [d.city, d.country_name].filter(Boolean).join(', ');
      if (loc) els.forEach(el => { el.textContent = loc; });
    })
    .catch(() => {});
}
