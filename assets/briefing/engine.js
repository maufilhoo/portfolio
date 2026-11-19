/* ─── Briefing · motor ───────────────────────────────────────────────
   Lê o config injetado pelo servidor (#bf-data), controla telas,
   navegação, persistência por slug e envio. Os componentes (Intro,
   Question, Review, Success) são genéricos: todo conteúdo vem do config. */
import { reducedMotion } from './dom.js';
import { visibleQuestions, visibleSteps, validate, prune, isAnswered, MESSAGES } from './logic.js';
import { setProgress, announceLive } from './progress.js';
import { Intro } from './intro.js';
import { Question } from './question.js';
import { Review } from './review.js';
import { Success } from './success.js';

/* Textos da interface. Um briefing pode sobrescrever qualquer um em "ui". */
export const UI = {
  briefing: 'Briefing',
  start: 'Começar',
  resume: 'Continuar de onde parei',
  restart: 'Começar de novo',
  next: 'Continuar',
  back: 'Voltar',
  toReview: 'Revisar respostas',
  optional: 'Opcional',
  multiHint: 'Escolha quantas opções quiser.',
  enterHint: 'ou pressione Enter ↵',
  shiftEnterHint: 'Enter continua · Shift + Enter quebra linha',
  otherPlaceholder: 'Qual?',
  textPlaceholder: 'Digite aqui',
  reviewEyebrow: 'Revisão',
  reviewTitle: 'Confira suas respostas.',
  reviewIntro: 'Se algo mudou, é só editar antes de enviar.',
  edit: 'Editar',
  empty: 'Sem resposta',
  submit: 'Enviar briefing',
  sending: 'Enviando…',
  sentEyebrow: 'Enviado',
  progress: 'Pergunta {n} de {total}',
  stepProgress: '{n} de {total}',
  messages: {},
  errors: {
    network: 'Não foi possível enviar. Confira sua conexão e tente de novo. Suas respostas continuam salvas.',
    server: 'O envio falhou agora. Tente de novo em instantes. Suas respostas continuam salvas.',
    rateLimited: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
    tooFast: 'Aguarde alguns segundos e envie de novo.',
    expired: 'A página expirou. Recarregue e envie de novo. Suas respostas continuam salvas.',
  },
};

const VERSION = 1;
const MAX_AGE = 30 * 24 * 3600 * 1000;
const LEAVE_MS = 180;

const data = JSON.parse(document.getElementById('bf-data').textContent);
const config = data.config;
const ui = { ...UI, ...config.ui, errors: { ...UI.errors, ...(config.ui && config.ui.errors) } };
const messages = { ...MESSAGES, ...ui.messages };
const byId = Object.fromEntries(config.questions.map(q => [q.id, q]));
const root = document.getElementById('bf');
const KEY = `bf:${config.slug}`;

/* ─── Estado + localStorage ──────────────────────────────────────── */
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

/* Perguntas de texto com "default" começam preenchidas (ex.: resumo do que já se sabe). */
const defaults = () => Object.fromEntries(
  config.questions
    .filter(q => (q.type === 'text' || q.type === 'textarea') && typeof q.default === 'string' && q.default)
    .map(q => [q.id, q.default]));

const fresh = () => ({ v: VERSION, answers: defaults(), visited: [], screen: 'intro', current: null, editing: false, token: data.token, id: newId(), savedAt: Date.now() });

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (!s || s.v !== VERSION || Date.now() - s.savedAt > MAX_AGE || typeof s.answers !== 'object') return null;
    return { ...fresh(), ...s, token: s.token || data.token };
  } catch { return null; }
}

function save() {
  state.savedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* modo privado, cota cheia: segue sem salvar */ }
}

function clear() {
  try { localStorage.removeItem(KEY); } catch { /* idem */ }
}

let state = load() || fresh();

/* ─── Navegação ──────────────────────────────────────────────────── */
const visible = () => visibleQuestions(config, state.answers);
// Progresso = já passou por alguma pergunta (respostas pré-preenchidas não contam).
const hasProgress = () => state.visited.length > 0 || (state.screen !== 'intro' && Object.keys(state.answers).some(k => byId[k] && isAnswered(byId[k], state.answers[k])));

let screen = null;   // componente atual
let screenId = 0;
let busy = false;    // trava durante a troca de tela
let pendingErrors = null;
let sending = false;

function go(name, qid = null) {
  state.screen = name;
  state.current = qid;
  if (name !== 'success') save();
  render();
}

function start() {
  state.editing = false;
  go('q', visible()[0].id);
}

function restart() {
  const keepToken = state.token;
  clear();
  state = { ...fresh(), token: keepToken };
  start();
}

function firstInvalid(list) {
  for (const q of list) {
    const e = validate(q, state.answers[q.id], messages);
    if (e) return { q, e };
  }
  return null;
}

function next() {
  if (busy || state.screen !== 'q') return;
  const q = byId[state.current];
  const errs = validate(q, state.answers[q.id], messages);
  if (errs) { screen.showErrors(errs); return; }
  if (!state.visited.includes(q.id)) state.visited.push(q.id);

  const list = visible();
  const i = list.findIndex(x => x.id === q.id);
  const rest = list.slice(i + 1);
  // Editando a partir da revisão: pula o que já foi visto (exceto perguntas
  // que passaram a aparecer por causa da edição) e volta para a revisão.
  const target = state.editing ? rest.find(x => !state.visited.includes(x.id)) : rest[0];
  if (target) return go('q', target.id);
  toReview();
}

function back() {
  if (busy) return;
  if (state.screen === 'review') {
    const list = visible();
    return go('q', list[list.length - 1].id);
  }
  const list = visible();
  const i = list.findIndex(x => x.id === state.current);
  if (i <= 0) return go('intro');
  go('q', list[i - 1].id);
}

function toReview() {
  const bad = firstInvalid(visible());
  if (bad) { pendingErrors = bad.e; return go('q', bad.q.id); }
  state.editing = false;
  go('review');
}

function edit(qid) {
  state.editing = true;
  go('q', qid);
}

function setAnswer(qid, a) {
  if (a == null || (typeof a === 'string' && a === '')) delete state.answers[qid];
  else state.answers[qid] = a;
  save();
}

/* ─── Envio ──────────────────────────────────────────────────────── */
async function post(body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`/b/${encodeURIComponent(config.slug)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    let payload = {};
    try { payload = await res.json(); } catch { /* resposta sem JSON */ }
    return { status: res.status, ok: res.ok, data: payload };
  } finally {
    clearTimeout(timer);
  }
}

async function submit() {
  if (sending || busy) return;
  const bad = firstInvalid(visible());
  if (bad) { pendingErrors = bad.e; return go('q', bad.q.id); }

  const view = screen;
  sending = true;
  view.setSending(true);
  announceLive(ui.sending);

  const body = { answers: prune(config, state.answers), token: state.token, hp: view.honeypot(), id: state.id };
  try {
    let res = await post(body);
    // Token salvo pode ter sido assinado com outra chave: tenta com o desta página.
    if (res.status === 400 && res.data.error === 'expired' && state.token !== data.token) {
      state.token = data.token;
      save();
      res = await post({ ...body, token: data.token });
    }
    if (res.ok) {
      clear();
      state = fresh();
      sending = false;
      return go('success');
    }
    if (res.status === 422 && res.data.errors) {
      const qid = visible().map(q => q.id).find(id => res.data.errors[id]);
      if (qid) { sending = false; pendingErrors = res.data.errors[qid]; return go('q', qid); }
    }
    if (res.status === 401) { location.reload(); return; }
    const err = res.status === 429
      ? (res.data.error === 'too_fast' ? ui.errors.tooFast : ui.errors.rateLimited)
      : res.data.error === 'expired' ? ui.errors.expired : ui.errors.server;
    view.showError(err);
  } catch {
    view.showError(ui.errors.network);
  }
  sending = false;
  view.setSending(false);
}

/* ─── Render ─────────────────────────────────────────────────────── */
function build() {
  const list = visible();
  const steps = visibleSteps(config, list);

  if (state.screen === 'intro') {
    setProgress({ ratio: 0, label: '' });
    return Intro({ config, ui, hasProgress: hasProgress(), onStart: start, onResume: resume, onRestart: restart });
  }

  if (state.screen === 'review') {
    setProgress({ ratio: 1, label: ui.reviewEyebrow, announce: `${ui.reviewEyebrow}. ${ui.reviewTitle}` });
    return Review({ ui, steps, questions: list, answers: state.answers, onEdit: edit, onSubmit: submit, onBack: back });
  }

  if (state.screen === 'success') {
    setProgress({ ratio: 1, label: '' });
    return Success({ config, ui });
  }

  const q = byId[state.current];
  const i = list.findIndex(x => x.id === q.id);
  const n = i + 1;
  const total = list.length;
  const step = steps.find(s => s.id === q.step);
  const pad = x => String(x).padStart(2, '0');
  if (config.progress === 'steps') {
    // Progresso por etapa: "1 de 5". A linha avança dentro da etapa também.
    const si = steps.findIndex(s => s.id === q.step);
    const inStep = list.filter(x => x.step === q.step);
    const within = (inStep.findIndex(x => x.id === q.id) + 1) / (inStep.length + 1);
    const label = ui.stepProgress.replace('{n}', si + 1).replace('{total}', steps.length);
    setProgress({ ratio: (si + within) / steps.length, label, announce: `${label}. ${step.title}.` });
  } else {
    setProgress({
      ratio: (i + 1) / (total + 1),
      label: `${pad(n)} / ${pad(total)}`,
      announce: `${ui.progress.replace('{n}', n).replace('{total}', total)}. ${step.title}.`,
    });
  }
  return Question(q, {
    ui, step,
    answer: state.answers[q.id],
    isLast: n === total,
    setAnswer: a => setAnswer(q.id, a),
    onNext: next,
    onBack: back,
    screenId: () => screenId,
  });
}

function render() {
  const id = ++screenId;
  busy = true;
  const view = build();
  const errs = pendingErrors;
  pendingErrors = null;

  const mount = () => {
    if (id !== screenId) return;
    root.replaceChildren(view.el);
    if (view.onMount) view.onMount();
    screen = view;
    window.scrollTo(0, 0);
    busy = false;
    requestAnimationFrame(() => {
      if (errs && view.showErrors) view.showErrors(errs);
      else view.focus();
    });
  };

  const old = root.querySelector('.bf-screen');
  if (old && !reducedMotion()) {
    old.classList.add('is-leaving');
    setTimeout(mount, LEAVE_MS);
  } else {
    mount();
  }
}

function resume() {
  const list = visible();
  const current = list.find(q => q.id === state.current)
    || list.find(q => !state.visited.includes(q.id))
    || null;
  if (current) go('q', current.id); else toReview();
}

/* Restaura onde parou (refresh no meio). */
if (state.screen === 'q' && byId[state.current] && visible().some(q => q.id === state.current)) render();
else if (state.screen === 'review' && hasProgress()) toReview();
else { state.screen = 'intro'; render(); }
