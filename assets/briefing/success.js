import { h } from './dom.js';

/* Só aceita link interno ("/...") ou https. */
const safeHref = href => (typeof href === 'string' && (/^\/(?!\/)/.test(href) || /^https:\/\//.test(href)) ? href : null);

/* Tela final. Textos e link opcional vêm de config.success. */
export function Success({ config, ui }) {
  const { title: titleText, text, link } = config.success;
  const title = h('h1', { class: 'bf-title', tabindex: '-1' }, titleText);
  const href = link && safeHref(link.href);

  const el = h('section', { class: 'bf-screen bf-screen--success' },
    h('p', { class: 'bf-eyebrow' }, ui.sentEyebrow),
    title,
    h('p', { class: 'bf-lede' }, text),
    href && h('div', { class: 'bf-actions' },
      h('a', { class: 'bf-btn', href },
        h('span', { class: 'bf-btn-label' }, link.label),
        h('span', { class: 'bf-arrow', 'aria-hidden': 'true' }, '→'))));

  return { el, focus: () => title.focus({ preventScroll: true }) };
}
