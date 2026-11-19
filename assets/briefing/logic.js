/* ─── Briefing · lógica compartilhada ────────────────────────────────
   Usada no navegador (engine.js) e na Cloudflare Function
   (functions/b/[[path]].js). Sem DOM e sem APIs de Node: só JS puro.

   Formato das respostas, por tipo de pergunta:
     text, textarea  → "texto"
     single          → { value: "id-da-opcao", other?: "texto do Outro" }
     multi           → { values: ["id", ...],  other?: "texto do Outro" }
     contact         → { campoId: "texto", ... }                        */

export const LIMITS = { text: 300, textarea: 5000, other: 300, field: 300 };

export const MESSAGES = {
  required: 'Esta resposta é obrigatória.',
  requiredChoice: 'Escolha uma opção para continuar.',
  otherRequired: 'Conte qual é a outra opção.',
  fieldRequired: 'Campo obrigatório.',
  email: 'Confira o e-mail. Ex.: nome@empresa.com',
  tel: 'Confira o número, com DDD. Ex.: (11) 91234-5678',
  tooLong: 'Texto longo demais.',
  invalid: 'Resposta inválida.',
};

const EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;

const str = v => (typeof v === 'string' ? v : '');

/* Valor usado pelas condições showIf. */
export function answerValue(q, a) {
  if (a == null) return undefined;
  if (q.type === 'single') return a.value;
  if (q.type === 'multi') return a.values;
  return a;
}

/* Condições:
     { "q": "id", "equals": "valor" }
     { "q": "id", "in": ["a", "b"] }        qualquer um dos valores
     { "q": "id", "notIn": ["a"] }          respondida e diferente de todos
     { "q": "id", "filled": true }
     { "all": [...] }  { "any": [...] }  { "not": {...} }
   Uma condição só enxerga perguntas anteriores e visíveis: se a pergunta
   referenciada some, as que dependem dela somem junto.               */
export function checkCondition(c, vals) {
  if (!c || typeof c !== 'object') return true;
  if (Array.isArray(c.all)) return c.all.every(x => checkCondition(x, vals));
  if (Array.isArray(c.any)) return c.any.some(x => checkCondition(x, vals));
  if (c.not) return !checkCondition(c.not, vals);
  const v = vals[c.q];
  const arr = v == null || v === '' ? [] : Array.isArray(v) ? v : [v];
  if ('equals' in c) return arr.includes(c.equals);
  if (Array.isArray(c.in)) return c.in.some(x => arr.includes(x));
  if (Array.isArray(c.notIn)) return arr.length > 0 && !c.notIn.some(x => arr.includes(x));
  if ('filled' in c) return (arr.length > 0) === Boolean(c.filled);
  return false;
}

export function visibleQuestions(config, answers = {}) {
  const vals = {};
  const out = [];
  for (const q of config.questions) {
    if (q.showIf && !checkCondition(q.showIf, vals)) continue;
    out.push(q);
    vals[q.id] = answerValue(q, answers[q.id]);
  }
  return out;
}

/* Etapas que têm ao menos uma pergunta visível, já numeradas. */
export function visibleSteps(config, visible) {
  const ids = new Set(visible.map(q => q.step));
  return config.steps
    .filter(s => ids.has(s.id))
    .map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') }));
}

export function isAnswered(q, a) {
  if (a == null) return false;
  switch (q.type) {
    case 'text':
    case 'textarea': return str(a).trim() !== '';
    case 'single': return Boolean(a.value);
    case 'multi': return Array.isArray(a.values) && a.values.length > 0;
    case 'contact': return (q.fields || []).some(f => str(a[f.id]).trim() !== '');
    default: return false;
  }
}

/* Devolve null se estiver tudo certo, ou um mapa de erros:
   { _: "erro geral" , other: "erro do Outro", campoId: "erro do campo" } */
export function validate(q, a, msg = MESSAGES) {
  const e = {};
  const limit = q.maxLength || LIMITS[q.type] || LIMITS.field;
  switch (q.type) {
    case 'text':
    case 'textarea': {
      if (a != null && typeof a !== 'string') { e._ = msg.invalid; break; }
      const s = str(a).trim();
      if (!s) { if (q.required) e._ = msg.required; break; }
      if (s.length > limit) e._ = msg.tooLong;
      break;
    }
    case 'single': {
      const v = a && a.value;
      if (!v) { if (q.required) e._ = msg.requiredChoice; break; }
      const opt = q.options.find(o => o.value === v);
      if (!opt) { e._ = msg.invalid; break; }
      if (opt.other) checkOther(a, e, msg);
      break;
    }
    case 'multi': {
      const vs = a && Array.isArray(a.values) ? a.values : [];
      if (!vs.length) { if (q.required) e._ = msg.requiredChoice; break; }
      const opts = vs.map(v => q.options.find(o => o.value === v));
      if (opts.some(o => !o) || new Set(vs).size !== vs.length) { e._ = msg.invalid; break; }
      if (vs.length > 1 && opts.some(o => o.exclusive)) { e._ = msg.invalid; break; }
      if (opts.some(o => o.other)) checkOther(a, e, msg);
      break;
    }
    case 'contact': {
      if (a != null && typeof a !== 'object') { e._ = msg.invalid; break; }
      for (const f of q.fields || []) {
        const s = str(a && a[f.id]).trim();
        if (!s) { if (f.required) e[f.id] = msg.fieldRequired; continue; }
        if (s.length > (f.maxLength || LIMITS.field)) e[f.id] = msg.tooLong;
        else if (f.type === 'email' && !EMAIL_RE.test(s)) e[f.id] = msg.email;
        else if (f.type === 'tel') {
          const d = s.replace(/\D/g, '');
          if (d.length < 10 || d.length > 13) e[f.id] = msg.tel;
        }
      }
      break;
    }
    default:
      e._ = msg.invalid;
  }
  return Object.keys(e).length ? e : null;
}

function checkOther(a, e, msg) {
  const s = str(a.other).trim();
  if (!s) e.other = msg.otherRequired;
  else if (s.length > LIMITS.other) e.other = msg.tooLong;
}

/* Mantém só as perguntas visíveis e só os campos conhecidos.
   É isso que vai no payload: se uma condição deixou de valer,
   as respostas que dependiam dela ficam de fora.                     */
export function prune(config, answers = {}) {
  const out = {};
  for (const q of visibleQuestions(config, answers)) {
    const a = answers[q.id];
    if (!isAnswered(q, a)) continue;
    switch (q.type) {
      case 'text':
      case 'textarea':
        out[q.id] = str(a).trim();
        break;
      case 'single': {
        const opt = q.options.find(o => o.value === a.value);
        if (!opt) break;
        out[q.id] = opt.other ? { value: opt.value, other: str(a.other).trim() } : { value: opt.value };
        break;
      }
      case 'multi': {
        const vs = [...new Set(a.values)].filter(v => q.options.some(o => o.value === v));
        if (!vs.length) break;
        const hasOther = vs.some(v => q.options.find(o => o.value === v).other);
        out[q.id] = hasOther ? { values: vs, other: str(a.other).trim() } : { values: vs };
        break;
      }
      case 'contact': {
        const c = {};
        for (const f of q.fields || []) {
          const s = str(a[f.id]).trim();
          if (s) c[f.id] = s;
        }
        out[q.id] = c;
        break;
      }
    }
  }
  return out;
}

/* Resposta em texto legível (revisão e e-mail). */
export function formatAnswer(q, a) {
  if (!isAnswered(q, a)) return '';
  const label = v => (q.options.find(o => o.value === v) || {}).label || v;
  const withOther = (v, other) => {
    const o = q.options.find(x => x.value === v);
    return o && o.other && str(other).trim() ? `${o.label}: ${str(other).trim()}` : label(v);
  };
  switch (q.type) {
    case 'text':
    case 'textarea': return str(a).trim();
    case 'single': return withOther(a.value, a.other);
    case 'multi': return a.values.map(v => withOther(v, a.other)).join('\n');
    case 'contact':
      return (q.fields || [])
        .filter(f => str(a[f.id]).trim())
        .map(f => `${f.label}: ${str(a[f.id]).trim()}`)
        .join('\n');
    default: return '';
  }
}

/* Máscara de telefone BR: (11) 91234-5678 ou (11) 1234-5678. */
export function formatPhoneBR(s) {
  const d = str(s).replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (d.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/* O que o navegador recebe: sem destinatário, sem referência de senha. */
export function publicConfig(c) {
  return {
    slug: c.slug,
    lang: c.lang || 'pt',
    title: c.title,
    intro: c.intro,
    duration: c.duration,
    steps: c.steps,
    questions: c.questions,
    success: c.success,
    ui: c.ui || {},
  };
}

/* Checagem estrutural do arquivo de briefing. Devolve lista de problemas. */
export function checkConfig(c) {
  const p = [];
  const TYPES = ['text', 'textarea', 'single', 'multi', 'contact'];
  if (!c || typeof c !== 'object') return ['config não é um objeto'];
  for (const k of ['slug', 'name', 'title', 'recipientEmail', 'emailSubject']) {
    if (typeof c[k] !== 'string' || !c[k]) p.push(`campo "${k}" ausente`);
  }
  if (!Array.isArray(c.steps) || !c.steps.length) p.push('steps vazio');
  if (!Array.isArray(c.questions) || !c.questions.length) p.push('questions vazio');
  if (p.length) return p;
  const steps = new Set(c.steps.map(s => s.id));
  const seen = new Set();
  for (const q of c.questions) {
    if (!q.id || seen.has(q.id)) p.push(`id de pergunta ausente ou repetido: ${q.id}`);
    seen.add(q.id);
    if (!TYPES.includes(q.type)) p.push(`${q.id}: tipo desconhecido "${q.type}"`);
    if (!steps.has(q.step)) p.push(`${q.id}: step "${q.step}" não existe`);
    if ((q.type === 'single' || q.type === 'multi') && !(Array.isArray(q.options) && q.options.length)) p.push(`${q.id}: sem options`);
    if (q.type === 'contact' && !(Array.isArray(q.fields) && q.fields.length)) p.push(`${q.id}: sem fields`);
  }
  return p;
}
