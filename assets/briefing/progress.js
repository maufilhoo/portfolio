/* Progresso: linha fina no topo + contador "04 / 11".
   O anúncio para leitores de tela vai para a região aria-live da página. */

const bar = () => document.getElementById('bf-bar');
const track = () => document.getElementById('bf-track');
const count = () => document.getElementById('bf-count');
const live = () => document.getElementById('bf-live');

export function setProgress({ ratio = 0, label = '', announce = '' } = {}) {
  const b = bar();
  if (b) {
    b.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    b.classList.toggle('is-empty', ratio <= 0);
  }
  // Sem rótulo (abertura e tela final) a barra some.
  const t = track();
  if (t) t.hidden = !label;
  const c = count();
  if (c) c.textContent = label;
  if (announce) announceLive(announce);
}

export function announceLive(text) {
  const l = live();
  if (!l) return;
  // Limpa antes para o mesmo texto ser anunciado de novo.
  l.textContent = '';
  setTimeout(() => { l.textContent = text; }, 60);
}
