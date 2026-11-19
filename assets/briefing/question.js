/* ─── Pergunta genérica ──────────────────────────────────────────────
   Uma pergunta por tela. Renderiza qualquer tipo do schema:
   text, textarea, single, multi, contact. Nenhum texto fixo aqui:
   pergunta e opções vêm do config; botões e dicas, de ui.            */
import { h, uid, isCoarse, primaryButton, textButton } from './dom.js';
import { formatPhoneBR, LIMITS } from './logic.js';

const clone = v => (v == null ? v : JSON.parse(JSON.stringify(v)));

export function Question(q, ctx) {
  const { ui, step, isLast, onNext, onBack, setAnswer } = ctx;
  let answer = clone(ctx.answer);
  const commit = () => setAnswer(clone(answer));

  const titleId = uid('bf-q');
  const helpId = uid('bf-help');
  const describedBy = [];

  // Perguntas longas ganham corpo menor para não pesar na tela.
  const len = q.label.length;
  const size = len > 140 ? ' bf-q--xlong' : len > 70 ? ' bf-q--long' : '';
  const title = h('h1', { class: `bf-q${size}`, id: titleId, tabindex: '-1' }, q.label);
  const head = [
    h('p', { class: 'bf-eyebrow' },
      h('span', { class: 'bf-num' }, step.number), step.title,
      ui.optional && !q.required && q.type !== 'contact'
        ? [h('span', { class: 'bf-dot', 'aria-hidden': 'true' }, '·'), ui.optional]
        : null),
    title,
  ];
  const helpText = q.help || (q.type === 'multi' ? ui.multiHint : '');
  if (helpText) {
    head.push(h('p', { class: 'bf-help', id: helpId }, helpText));
    describedBy.push(helpId);
  }

  /* Erros inline: cada slot sabe onde inserir a mensagem e qual campo marcar. */
  const slots = {};
  const shown = [];
  const slot = (key, anchor, input) => { slots[key] = { anchor, input }; };

  let body;
  let onMount = () => {};
  let focusFirst = () => title.focus({ preventScroll: true });

  const onEnter = e => {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); onNext(); }
  };

  switch (q.type) {
    case 'text': {
      const input = h('input', {
        class: 'bf-input', type: 'text', value: answer || '',
        placeholder: q.placeholder || ui.textPlaceholder,
        maxlength: q.maxLength || LIMITS.text,
        'aria-labelledby': titleId, 'aria-describedby': describedBy.join(' ') || null,
        'aria-required': q.required ? 'true' : null,
        autocomplete: 'off', enterkeyhint: 'next',
        oninput: () => { answer = input.value; commit(); },
        onkeydown: onEnter,
      });
      body = h('div', { class: 'bf-field' }, input);
      slot('_', body, input);
      focusFirst = () => input.focus({ preventScroll: true });
      break;
    }

    case 'textarea': {
      const input = h('textarea', {
        class: q.default ? 'bf-input bf-textarea bf-textarea--summary' : 'bf-input bf-textarea', rows: '2',
        placeholder: q.placeholder || ui.textPlaceholder,
        maxlength: q.maxLength || LIMITS.textarea,
        'aria-labelledby': titleId, 'aria-describedby': describedBy.join(' ') || null,
        'aria-required': q.required ? 'true' : null,
        oninput: () => { answer = input.value; commit(); grow(); },
        // Enter avança; Shift+Enter quebra linha. No toque, Enter só quebra linha.
        onkeydown: e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isCoarse()) { e.preventDefault(); onNext(); }
        },
      });
      input.value = answer || '';
      const grow = () => { input.style.height = 'auto'; input.style.height = `${input.scrollHeight}px`; };
      onMount = grow; // só mede depois que a tela entra no DOM
      body = h('div', { class: 'bf-field' }, input);
      slot('_', body, input);
      focusFirst = () => {
        input.focus({ preventScroll: true });
        input.setSelectionRange(input.value.length, input.value.length);
      };
      break;
    }

    case 'single':
    case 'multi': {
      const multi = q.type === 'multi';
      const otherOpt = q.options.find(o => o.other);
      const selected = () => (multi ? (answer && answer.values) || [] : answer && answer.value ? [answer.value] : []);

      const otherInput = otherOpt && h('input', {
        class: 'bf-input bf-input--other', type: 'text',
        value: (answer && answer.other) || '',
        placeholder: ui.otherPlaceholder,
        maxlength: LIMITS.other,
        'aria-label': `${otherOpt.label}: ${ui.otherPlaceholder}`,
        oninput: () => { answer = { ...(answer || {}), other: otherInput.value }; commit(); },
        onkeydown: onEnter,
      });
      const otherWrap = otherOpt && h('div', { class: 'bf-other' }, otherInput);

      const buttons = q.options.map((o, i) => h('button', {
        type: 'button', class: 'bf-opt', role: multi ? 'checkbox' : 'radio',
        'data-value': o.value,
        onclick: e => (multi ? toggle(i, e.detail > 0) : choose(i, e.detail > 0)),
      },
        h('span', { class: multi ? 'bf-mark bf-mark--box' : 'bf-mark', 'aria-hidden': 'true' }),
        h('span', { class: 'bf-opt-label' }, o.label)));

      const group = h('div', {
        class: 'bf-opts', role: multi ? 'group' : 'radiogroup',
        'aria-labelledby': titleId, 'aria-describedby': describedBy.join(' ') || null,
        'aria-required': !multi && q.required ? 'true' : null,
        onkeydown: e => keys(e),
      }, buttons);

      let focusIndex = 0;

      const sync = () => {
        const sel = selected();
        buttons.forEach((b, i) => {
          b.setAttribute('aria-checked', String(sel.includes(q.options[i].value)));
          b.tabIndex = i === focusIndex ? 0 : -1;
        });
        if (otherWrap) {
          const open = sel.includes(otherOpt.value);
          otherWrap.hidden = !open;
          otherWrap.classList.toggle('is-open', open);
        }
      };

      const keepOther = values => (otherOpt && values.includes(otherOpt.value) && answer && answer.other ? { other: answer.other } : {});

      const choose = (i, viaPointer) => {
        const o = q.options[i];
        focusIndex = i;
        answer = { value: o.value, ...keepOther([o.value]) };
        commit(); sync(); clearErrors();
        if (o.other) { if (viaPointer) otherInput.focus(); }
        else if (viaPointer) {
          // Escolha única por clique/toque avança sozinha, como numa conversa.
          const id = ctx.screenId();
          setTimeout(() => { if (ctx.screenId() === id) onNext(); }, 280);
        }
      };

      const toggle = i => {
        const o = q.options[i];
        focusIndex = i;
        let vs = selected().slice();
        if (vs.includes(o.value)) vs = vs.filter(v => v !== o.value);
        else if (o.exclusive) vs = [o.value];
        else vs = vs.filter(v => !q.options.find(x => x.value === v).exclusive).concat(o.value);
        // Mantém a ordem das opções no arquivo.
        vs = q.options.map(x => x.value).filter(v => vs.includes(v));
        answer = vs.length ? { values: vs, ...keepOther(vs) } : null;
        commit(); sync(); clearErrors();
        if (o.other && vs.includes(o.value)) otherInput.focus();
      };

      const move = (to, select) => {
        focusIndex = (to + buttons.length) % buttons.length;
        if (select) choose(focusIndex, false); else sync();
        buttons[focusIndex].focus();
      };

      const keys = e => {
        if (!buttons.includes(e.target)) return;
        const i = buttons.indexOf(e.target);
        switch (e.key) {
          case 'ArrowDown': case 'ArrowRight': e.preventDefault(); move(i + 1, !multi); break;
          case 'ArrowUp': case 'ArrowLeft': e.preventDefault(); move(i - 1, !multi); break;
          case 'Home': e.preventDefault(); move(0, !multi); break;
          case 'End': e.preventDefault(); move(buttons.length - 1, !multi); break;
          case ' ':
            e.preventDefault();
            if (multi) toggle(i); else choose(i, false);
            if (q.options[i].other && selected().includes(q.options[i].value)) otherInput.focus();
            break;
          case 'Enter':
            e.preventDefault();
            if (!selected().length) { if (multi) toggle(i); else choose(i, false); }
            onNext();
            break;
        }
      };

      const sel0 = selected();
      focusIndex = Math.max(0, q.options.findIndex(o => sel0.includes(o.value)));
      sync();

      body = h('div', { class: 'bf-field' }, group, otherWrap);
      slot('_', group, null);
      if (otherWrap) slot('other', otherWrap, otherInput);
      focusFirst = () => buttons[focusIndex].focus({ preventScroll: true });
      break;
    }

    case 'contact': {
      answer = answer || {};
      const inputs = [];
      const rows = q.fields.map((f, i) => {
        const id = uid('bf-f');
        const tel = f.type === 'tel';
        const input = h('input', {
          class: 'bf-input bf-input--field', id,
          type: f.type === 'email' ? 'email' : tel ? 'tel' : 'text',
          inputmode: tel ? 'tel' : f.type === 'email' ? 'email' : null,
          autocomplete: f.autocomplete || null,
          value: answer[f.id] || '',
          maxlength: f.maxLength || LIMITS.field,
          'aria-required': f.required ? 'true' : null,
          enterkeyhint: i === q.fields.length - 1 ? 'next' : 'next',
          oninput: () => {
            if (f.mask === 'phone-br') input.value = formatPhoneBR(input.value);
            answer = { ...answer, [f.id]: input.value };
            commit();
          },
          onkeydown: e => {
            if (e.key !== 'Enter' || e.isComposing) return;
            e.preventDefault();
            if (i < inputs.length - 1) inputs[i + 1].focus(); else onNext();
          },
        });
        inputs.push(input);
        const row = h('div', { class: 'bf-row' },
          h('label', { class: 'bf-label', for: id }, f.label,
            f.required || !ui.optional ? null : h('span', { class: 'bf-label-opt' }, ui.optional.toLowerCase())),
          input);
        slot(f.id, row, input);
        return row;
      });
      body = h('div', { class: 'bf-field bf-field--contact', role: 'group', 'aria-labelledby': titleId }, rows);
      focusFirst = () => inputs[0].focus({ preventScroll: true });
      break;
    }
  }

  const hint = q.type === 'textarea' ? ui.shiftEnterHint : ui.enterHint;
  const actions = h('div', { class: 'bf-actions' },
    primaryButton(isLast ? ui.toReview : ui.next, { onclick: () => onNext() }),
    textButton(ui.back, { onclick: () => onBack() }),
    h('span', { class: 'bf-hint', 'aria-hidden': 'true' }, hint));

  const el = h('section', { class: `bf-screen bf-screen--${q.type}` }, head, body, actions);

  function clearErrors() {
    while (shown.length) {
      const { msg, input } = shown.pop();
      msg.remove();
      if (input) {
        input.removeAttribute('aria-invalid');
        const ids = (input.getAttribute('aria-describedby') || '').split(' ').filter(x => x && x !== msg.id);
        if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
      }
    }
    el.querySelectorAll('.bf-opts[aria-invalid]').forEach(g => g.removeAttribute('aria-invalid'));
  }

  function showErrors(errs) {
    clearErrors();
    let first = null;
    for (const [key, text] of Object.entries(errs)) {
      const s = slots[key] || slots._;
      if (!s) continue;
      const msg = h('p', { class: 'bf-error', id: uid('bf-err'), role: 'alert' }, text);
      s.anchor.after(msg);
      const target = s.input || s.anchor;
      target.setAttribute('aria-invalid', 'true');
      const ids = (target.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      target.setAttribute('aria-describedby', ids.concat(msg.id).join(' '));
      shown.push({ msg, input: target });
      if (!first) first = s.input || (s.anchor.querySelector('[tabindex="0"]') || s.anchor);
    }
    if (first) first.focus();
  }

  // Digitar limpa o erro do campo.
  el.addEventListener('input', () => { if (shown.length) clearErrors(); });

  return { el, onMount: () => onMount(), focus: () => (isCoarse() ? title.focus({ preventScroll: true }) : focusFirst()), showErrors };
}
