const STORAGE_KEY = 'mf-lang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'pt';
let translations = {};

async function loadTranslations(lang) {
  const res = await fetch(`/lang/${lang}.json`);
  translations = await res.json();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key] !== undefined) el.textContent = translations[key];
  });

  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const key = el.dataset.i18nHref;
    if (translations[key] !== undefined) el.href = translations[key];
  });

  document.documentElement.lang = currentLang;

  /* Round lang button shows the OTHER language (what you'd switch to) */
  const langRound = document.getElementById('lang-round');
  if (langRound) langRound.textContent = currentLang === 'en' ? 'PT' : 'EN';

  /* Pill support (about.html) */
  document.querySelectorAll('.lang-pill-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === currentLang);
  });
}

async function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  await loadTranslations(lang);
  applyTranslations();
}

async function initI18n() {
  await loadTranslations(currentLang);
  applyTranslations();

  const langRound = document.getElementById('lang-round');
  if (langRound) {
    langRound.addEventListener('click', () =>
      setLang(currentLang === 'en' ? 'pt' : 'en')
    );
  }

  document.querySelectorAll('.lang-pill-opt').forEach(opt => {
    opt.addEventListener('click', () => setLang(opt.dataset.lang));
  });
}

export { initI18n };
