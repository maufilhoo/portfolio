/* Revisão: todas as respostas visíveis, agrupadas por etapa, com Editar. */
import { h, uid, primaryButton, textButton } from './dom.js';
import { formatAnswer, isAnswered } from './logic.js';

export function Review({ ui, steps, questions, answers, onEdit, onSubmit, onBack }) {
  const title = h('h1', { class: 'bf-title bf-title--review', tabindex: '-1' }, ui.reviewTitle);

  const groups = steps.map(s => {
    const items = questions.filter(q => q.step === s.id).map(q => {
      const a = answers[q.id];
      const text = isAnswered(q, a) ? formatAnswer(q, a) : ui.empty;
      return h('div', { class: 'bf-rv-item' },
        h('dt', { class: 'bf-rv-q' }, q.label),
        h('dd', { class: isAnswered(q, a) ? 'bf-rv-a' : 'bf-rv-a is-empty' }, text),
        h('dd', { class: 'bf-rv-edit' },
          textButton(ui.edit, { 'aria-label': `${ui.edit}: ${q.label}`, onclick: () => onEdit(q.id) })));
    });
    const headId = uid('bf-rv');
    return h('section', { class: 'bf-rv-step', 'aria-labelledby': headId },
      h('h2', { class: 'bf-eyebrow', id: headId }, h('span', { class: 'bf-num' }, s.number), s.title),
      h('dl', { class: 'bf-rv-list' }, items));
  });

  // Honeypot: invisível para pessoas, preenchido por robôs.
  const hp = h('input', { name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' });
  const status = h('div', { class: 'bf-status', 'aria-live': 'assertive' });
  const send = primaryButton(ui.submit, { onclick: () => onSubmit() });

  const el = h('section', { class: 'bf-screen bf-screen--review' },
    h('p', { class: 'bf-eyebrow' }, ui.reviewEyebrow),
    title,
    h('p', { class: 'bf-lede' }, ui.reviewIntro),
    groups,
    h('div', { class: 'bf-hp', 'aria-hidden': 'true' }, h('label', null, 'Não preencha', hp)),
    status,
    h('div', { class: 'bf-actions' }, send, textButton(ui.back, { onclick: () => onBack() })));

  return {
    el,
    focus: () => title.focus({ preventScroll: true }),
    honeypot: () => hp.value,
    setSending(on) {
      send.disabled = on;
      send.setAttribute('aria-busy', String(on));
      send.querySelector('.bf-btn-label').textContent = on ? ui.sending : ui.submit;
      if (on) status.replaceChildren();
    },
    showError(text) {
      status.replaceChildren(h('p', { class: 'bf-error bf-error--send' }, text));
    },
  };
}
