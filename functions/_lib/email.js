/* ─── Briefing · e-mail via Resend ───────────────────────────────────
   Sem SDK: uma chamada fetch para a API REST do Resend.               */
import { visibleQuestions, visibleSteps, formatAnswer, isAnswered } from '../../assets/briefing/logic.js';
import { esc } from './pages.js';

const oneLine = s => String(s ?? '').replace(/\s+/g, ' ').trim();

function subjectFrom(config, answers) {
  const byId = Object.fromEntries(config.questions.map(q => [q.id, q]));
  const out = config.emailSubject.replace(/\{([a-z0-9_.-]+)\}/gi, (_, key) => {
    if (key === 'name') return config.name;
    if (key === 'title') return config.title;
    if (key === 'slug') return config.slug;
    const [qid, field] = key.split('.');
    const q = byId[qid];
    const a = answers[qid];
    if (!q || a == null) return '—';
    if (field) return oneLine(a[field]) || '—';
    return oneLine(formatAnswer(q, a)) || '—';
  });
  return oneLine(out).slice(0, 200);
}

/* Reply-to: primeiro campo de e-mail de uma pergunta "contact". */
function replyToFrom(config, answers) {
  for (const q of config.questions) {
    if (q.type !== 'contact' || !answers[q.id]) continue;
    const f = (q.fields || []).find(x => x.type === 'email');
    if (f && answers[q.id][f.id]) return answers[q.id][f.id];
  }
  return null;
}

export function buildEmail(config, answers, meta) {
  const visible = visibleQuestions(config, answers);
  const steps = visibleSteps(config, visible);
  const subject = subjectFrom(config, answers);
  const when = new Date(meta.at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'long', timeStyle: 'short' });

  const text = [
    subject,
    `Briefing: /b/${config.slug}`,
    `Enviado em ${when}`,
    '',
  ];
  const htmlParts = [];

  for (const s of steps) {
    text.push(`${s.number}  ${s.title.toUpperCase()}`, '');
    const rows = [];
    for (const q of visible.filter(x => x.step === s.id)) {
      const a = answers[q.id];
      let value = isAnswered(q, a) ? formatAnswer(q, a) : '—';
      if (typeof q.default === 'string' && typeof a === 'string' && a.trim() === q.default.trim()) value += '\n(sem alterações)';
      text.push(q.label, value, '');
      rows.push(`
        <tr><td style="padding:0 0 4px;color:#6B6B6B;font-size:13px;line-height:1.4;">${esc(q.label)}</td></tr>
        <tr><td style="padding:0 0 18px;color:#111;font-size:16px;line-height:1.5;white-space:pre-wrap;">${esc(value)}</td></tr>`);
    }
    htmlParts.push(`
      <tr><td style="padding:28px 0 12px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#111;font-weight:600;">${s.number}&nbsp;&nbsp;${esc(s.title)}</td></tr>
      ${rows.join('')}`);
  }

  const html = `<!DOCTYPE html><html lang="pt"><body style="margin:0;padding:0;background:#FFFFFE;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFE;">
<tr><td align="center" style="padding:32px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <tr><td style="font-size:24px;line-height:1.2;font-weight:600;letter-spacing:-.02em;color:#111;padding:0 0 8px;">${esc(subject)}</td></tr>
  <tr><td style="font-size:13px;color:#6B6B6B;padding:0 0 8px;">/b/${esc(config.slug)} · ${esc(when)}</td></tr>
  ${htmlParts.join('')}
</table>
</td></tr></table>
</body></html>`;

  return { subject, text: text.join('\n'), html, replyTo: replyToFrom(config, answers) };
}

export async function sendEmail(env, config, mail, idempotencyKey) {
  const body = {
    from: env.BRIEFING_FROM,
    to: [config.recipientEmail],
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  };
  if (mail.replyTo) body.reply_to = mail.replyTo;

  const headers = {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  };
  // Evita e-mail duplicado se o cliente reenviar depois de um timeout.
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}
