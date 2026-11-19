/* Helpers mínimos de DOM. Todo texto entra via textContent, nunca HTML. */

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'value') el.value = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : String(c));
  }
  return el;
}

let n = 0;
export const uid = prefix => `${prefix}-${++n}`;

export const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));

/* Botão primário no estilo pill do site + seta. */
export const primaryButton = (label, attrs = {}) =>
  h('button', { type: 'button', class: 'bf-btn', ...attrs },
    h('span', { class: 'bf-btn-label' }, label),
    h('span', { class: 'bf-arrow', 'aria-hidden': 'true' }, '→'));

export const textButton = (label, attrs = {}) =>
  h('button', { type: 'button', class: 'bf-link', ...attrs }, label);
