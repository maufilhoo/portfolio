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
    if (translations[key] !== undefined) {
      el.textContent = translations[key];
    }
  });

  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const key = el.dataset.i18nHref;
    if (translations[key] !== undefined) {
      el.href = translations[key];
    }
  });

  document.documentElement.lang = currentLang;

  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = currentLang === 'pt' ? 'EN' : 'PT';
}

async function toggleLang() {
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  localStorage.setItem(STORAGE_KEY, currentLang);
  await loadTranslations(currentLang);
  applyTranslations();
}

async function initI18n() {
  await loadTranslations(currentLang);
  applyTranslations();

  const btn = document.getElementById('lang-toggle');
  if (btn) btn.addEventListener('click', toggleLang);
}

export { initI18n };
