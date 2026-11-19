/* ─── /b/* · briefings ───────────────────────────────────────────────
   GET  /b/[slug]          página do briefing (ou tela de senha)
   POST /b/[slug]          envio da senha (form)
   POST /b/[slug]/submit   envio das respostas (JSON)
   Qualquer outra coisa    404 neutro                                  */
import { publicConfig, prune, visibleQuestions, validate } from '../../assets/briefing/logic.js';
import {
  loadConfig, startToken, readStartToken, passwordFor, sessionValue, hasSession,
  cookieName, safeEqual, rateLimit, clientIp, json, html,
} from '../_lib/server.js';
import { briefingPage, passwordPage, notFoundPage, errorPage } from '../_lib/pages.js';
import { buildEmail, sendEmail } from '../_lib/email.js';

const MAX_BODY = 64 * 1024;
const TOKEN_MAX_AGE = 30 * 24 * 3600 * 1000;
const SESSION_MAX_AGE = 7 * 24 * 3600;

const notFound = () => html(notFoundPage(), 404);

export async function onRequest(context) {
  const { request, env, params } = context;
  const parts = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const [slug, action] = parts;

  if (!slug || parts.length > 2 || (action && action !== 'submit')) return notFound();

  const config = await loadConfig(context, slug);
  if (!config) return notFound();

  if (!env.BRIEFING_SECRET) {
    console.error('[briefing] BRIEFING_SECRET não configurado');
    return html(errorPage('Este briefing está temporariamente indisponível.'), 503);
  }
  // Senha exigida mas variável ausente: falha fechada, sem revelar nada.
  if (passwordFor(config, env) === undefined) {
    console.error(`[briefing] ${slug}: variável ${config.password} não configurada`);
    return notFound();
  }

  if (action === 'submit') {
    return request.method === 'POST' ? submit(context, config) : notFound();
  }
  if (request.method === 'POST') return unlock(context, config);
  if (request.method !== 'GET' && request.method !== 'HEAD') return notFound();

  if (!(await hasSession(request, env, config))) {
    return html(passwordPage(publicConfig(config)), 401);
  }
  const token = await startToken(env.BRIEFING_SECRET, slug);
  return html(briefingPage(publicConfig(config), token));
}

/* ─── Senha ───────────────────────────────────────────────────────── */
async function unlock({ request, env }, config) {
  const password = passwordFor(config, env);
  if (password === null) return notFound();

  if (!(await rateLimit(env, `pass:${config.slug}:${clientIp(request)}`, 10, 900))) {
    return html(errorPage('Muitas tentativas. Aguarde alguns minutos.'), 429);
  }
  let form;
  try { form = await request.formData(); } catch { return html(passwordPage(publicConfig(config), { error: true }), 400); }
  if (form.get('website')) return html(passwordPage(publicConfig(config), { error: true }), 401);

  const given = String(form.get('password') || '');
  if (!given || !(await safeEqual(env.BRIEFING_SECRET, given, password))) {
    return html(passwordPage(publicConfig(config), { error: true }), 401);
  }
  const value = await sessionValue(env.BRIEFING_SECRET, config.slug, password);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/b/${config.slug}`,
      'Set-Cookie': `${cookieName(config.slug)}=${value}; Path=/b/${config.slug}; Max-Age=${SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/* ─── Envio ───────────────────────────────────────────────────────── */
async function submit({ request, env }, config) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'forbidden' }, 403);
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) return json({ error: 'bad_request' }, 400);
  if (!(await hasSession(request, env, config))) return json({ error: 'locked' }, 401);

  if (!(await rateLimit(env, `send:${config.slug}:${clientIp(request)}`, 8, 3600))) {
    return json({ error: 'rate_limited' }, 429);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'bad_request' }, 400); }
  if (!body || typeof body !== 'object' || !body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    return json({ error: 'bad_request' }, 400);
  }

  // Honeypot preenchido: responde como sucesso e não envia nada.
  if (body.hp) return json({ ok: true });

  const ts = await readStartToken(env.BRIEFING_SECRET, config.slug, body.token);
  const age = ts ? Date.now() - ts : -1;
  if (!ts || age > TOKEN_MAX_AGE) return json({ error: 'expired' }, 400);
  const minMs = (Number.isInteger(config.minSeconds) ? config.minSeconds : 15) * 1000;
  if (age < minMs) return json({ error: 'too_fast' }, 429);

  // Valida contra o schema do briefing: só perguntas visíveis, só campos conhecidos.
  const answers = prune(config, body.answers);
  const errors = {};
  for (const q of visibleQuestions(config, answers)) {
    const e = validate(q, answers[q.id]);
    if (e) errors[q.id] = e;
  }
  if (Object.keys(errors).length) return json({ error: 'invalid', errors }, 422);

  if (!env.RESEND_API_KEY || !env.BRIEFING_FROM) {
    console.error('[briefing] RESEND_API_KEY ou BRIEFING_FROM não configurados');
    return json({ error: 'not_configured' }, 500);
  }

  const id = typeof body.id === 'string' && /^[a-zA-Z0-9-]{8,64}$/.test(body.id) ? body.id : null;
  // Arquivo das respostas: se houver KV (BRIEFING_KV), guarda cada envio para consulta.
  const at = Date.now();
  if (env.BRIEFING_KV) {
    const key = `sub:${config.slug}:${new Date(at).toISOString()}:${id || 'x'}`;
    try { await env.BRIEFING_KV.put(key, JSON.stringify({ slug: config.slug, at, answers })); }
    catch (err) { console.error('[briefing] falha ao arquivar:', err.message); }
  }

  try {
    await sendEmail(env, config, buildEmail(config, answers, { at }), id && `briefing-${config.slug}-${id}`);
  } catch (err) {
    console.error('[briefing] falha no envio:', err.message);
    return json({ error: 'send_failed' }, 502);
  }
  return json({ ok: true });
}
