/* ─── Briefing · HTML renderizado no servidor ─────────────────────────
   Reaproveita css/style.css e css/responsive.css do site (tokens,
   fontes, reset, cursor) e soma assets/briefing/briefing.css.         */

export const ASSET_VERSION = '20261119b';

export const esc = s =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* JSON seguro dentro de <script type="application/json"> */
const LS = new RegExp('[\\u2028\\u2029]', 'g');
const safeJson = data => JSON.stringify(data).replace(/</g, '\\u003c').replace(LS, c => (c === '\u2028' ? '\\u2028' : '\\u2029'));

function layout({ title, lang = 'pt', body, scripts = '' }) {
  return `<!DOCTYPE html>
<html lang="${esc(lang)}" class="bf-html">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="referrer" content="same-origin" />
  <title>${esc(title)}</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐡</text></svg>">
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="stylesheet" href="/css/responsive.css" />
  <link rel="stylesheet" href="/assets/briefing/briefing.css?v=${ASSET_VERSION}" />
</head>
<body class="bf-page">
  <header class="bf-top">
    <span class="bf-brand">Mauricio Filho</span>
    <span class="bf-count" id="bf-count" aria-hidden="true"></span>
  </header>
  <div class="bf-bar" id="bf-bar" aria-hidden="true"></div>
${body}
${scripts}
</body>
</html>`;
}

export function briefingPage(pub, token) {
  return layout({
    title: pub.title,
    lang: pub.lang,
    body: `  <main class="bf" id="bf">
    <noscript><p class="bf-lede">Este briefing precisa de JavaScript ativado no navegador.</p></noscript>
  </main>
  <p class="bf-sr" id="bf-live" aria-live="polite" aria-atomic="true"></p>
  <script type="application/json" id="bf-data">${safeJson({ config: pub, token })}</script>`,
    scripts: `  <script type="module" src="/assets/briefing/engine.js?v=${ASSET_VERSION}"></script>
  <script type="module">import { initCursor } from '/js/cursor.js'; initCursor();</script>`,
  });
}

export function passwordPage(pub, { error = false } = {}) {
  const err = error
    ? `<p class="bf-error" id="bf-pass-error" role="alert">Senha incorreta. Tente de novo.</p>`
    : '';
  return layout({
    title: pub.title,
    lang: pub.lang,
    body: `  <main class="bf" id="bf">
    <section class="bf-screen">
      <p class="bf-eyebrow">Acesso restrito</p>
      <h1 class="bf-q" id="bf-pass-title">${esc(pub.title)}</h1>
      <p class="bf-help">Digite a senha que você recebeu para abrir o briefing.</p>
      <form class="bf-form" method="post" action="/b/${esc(pub.slug)}" novalidate>
        <label class="bf-sr" for="bf-pass">Senha</label>
        <input class="bf-input" id="bf-pass" name="password" type="password" autocomplete="current-password"
          required autofocus ${error ? 'aria-invalid="true" aria-describedby="bf-pass-error"' : ''} />
        ${err}
        <div class="bf-hp" aria-hidden="true">
          <label>Não preencha <input name="website" tabindex="-1" autocomplete="off" /></label>
        </div>
        <div class="bf-actions">
          <button class="bf-btn" type="submit">Entrar <span class="bf-arrow" aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>
  </main>`,
    scripts: `  <script type="module">import { initCursor } from '/js/cursor.js'; initCursor();</script>`,
  });
}

/* 404 neutro: igual para slug inexistente, arquivo inválido ou senha
   sem variável configurada. Não revela nada sobre outros briefings.  */
export function notFoundPage() {
  return layout({
    title: 'Página não encontrada',
    body: `  <main class="bf" id="bf">
    <section class="bf-screen">
      <p class="bf-eyebrow">404</p>
      <h1 class="bf-q">Página não encontrada.</h1>
    </section>
  </main>`,
  });
}

export function errorPage(message) {
  return layout({
    title: 'Indisponível',
    body: `  <main class="bf" id="bf">
    <section class="bf-screen">
      <p class="bf-eyebrow">Indisponível</p>
      <h1 class="bf-q">${esc(message)}</h1>
    </section>
  </main>`,
  });
}
