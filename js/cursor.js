export function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const el = document.createElement('div');
  el.id = 'custom-cursor';
  document.body.appendChild(el);

  document.addEventListener('mousemove', e => {
    el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });

  document.addEventListener('mouseleave', () => el.classList.add('is-hidden'));
  document.addEventListener('mouseenter', () => el.classList.remove('is-hidden'));

  const hoverSel = 'img, a, button, h1, h2, h3, h4, p, li, figcaption, label';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) el.classList.add('is-hovering');
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) el.classList.remove('is-hovering');
  });
}
