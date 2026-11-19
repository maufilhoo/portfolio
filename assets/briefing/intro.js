import { h, primaryButton, textButton } from './dom.js';

/* Tela inicial. Todos os textos vêm do arquivo do briefing. */
export function Intro({ config, ui, hasProgress, onStart, onResume, onRestart }) {
  const title = h('h1', { class: 'bf-title', tabindex: '-1' }, config.title);

  const actions = hasProgress
    ? [primaryButton(ui.resume, { onclick: onResume }), textButton(ui.restart, { onclick: onRestart })]
    : [primaryButton(ui.start, { onclick: onStart })];

  const el = h('section', { class: 'bf-screen bf-screen--intro' },
    h('p', { class: 'bf-eyebrow' }, ui.briefing, h('span', { class: 'bf-dot', 'aria-hidden': 'true' }, '·'), config.duration),
    title,
    h('p', { class: 'bf-lede' }, config.intro),
    h('div', { class: 'bf-actions' }, actions));

  return { el, focus: () => title.focus({ preventScroll: true }) };
}
