/* Sempre abre em inglês. A troca para PT vale só nesta visita (aba),
   para continuar em PT ao navegar entre Home e About.               */
function readLang() {
  try {
    localStorage.removeItem('site-lang'); // escolha antiga, de quando ficava salva
    return sessionStorage.getItem('site-lang') || 'en';
  } catch (e) { return 'en'; }
}
let currentLang = readLang();
let translations = {};

async function loadTranslations(lang) {
  const res = await fetch(`/lang/${lang}.json`, { cache: 'no-cache' });
  translations = await res.json();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key] !== undefined) el.textContent = translations[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (translations[key] !== undefined) el.innerHTML = translations[key];
  });

  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const key = el.dataset.i18nHref;
    if (translations[key] !== undefined) el.href = translations[key];
  });

  document.documentElement.lang = currentLang;

  /* Lang button shows CURRENT language */
  const langRound = document.getElementById('lang-round');
  if (langRound) {
    const isEn = currentLang === 'en';
    /* PT / EN — o idioma ativo fica em destaque */
    langRound.querySelectorAll('.lang-opt').forEach(opt =>
      opt.classList.toggle('is-active', opt.dataset.l === currentLang));
    langRound.dataset.lang = currentLang;
    langRound.setAttribute('title', isEn ? 'Mudar para português' : 'Switch to English');
  }

  /* Pill support (about.html) */
  document.querySelectorAll('.lang-pill-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === currentLang);
  });
}

async function setLang(lang) {
  currentLang = lang;
  try { sessionStorage.setItem('site-lang', lang); } catch (e) {}
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

function getTranslation(key) { return translations[key] ?? key; }
export { initI18n, getTranslation };
