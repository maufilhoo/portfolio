/* ─── Briefing · utilitários do servidor (Cloudflare Pages Functions) ── */
import { checkConfig } from '../../assets/briefing/logic.js';

export const SLUG_RE = /^[a-z0-9_-]{1,64}$/;

/* ─── Config ──────────────────────────────────────────────────────────
   Lê /briefings/[slug].json direto dos arquivos do deploy (env.ASSETS).
   Acesso público a /briefings/* é bloqueado em functions/briefings/.  */
export async function loadConfig(context, slug) {
  if (!SLUG_RE.test(slug || '')) return null;
  const url = new URL(`/briefings/${slug}.json`, context.request.url);
  let res;
  try { res = await context.env.ASSETS.fetch(url); } catch { return null; }
  if (!res.ok) return null;
  // Sem 404.html, o Pages devolve index.html para qualquer arquivo
  // inexistente — então só aceita se for JSON válido e do slug certo.
  let config;
  try { config = JSON.parse(await res.text()); } catch { return null; }
  if (!config || config.slug !== slug) return null;
  const problems = checkConfig(config);
  if (problems.length) {
    console.error(`[briefing] ${slug}.json inválido:`, problems.join('; '));
    return null;
  }
  return config;
}

/* ─── Crypto ──────────────────────────────────────────────────────── */
const enc = new TextEncoder();

function b64url(buf) {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export async function sha256(data) {
  return b64url(await crypto.subtle.digest('SHA-256', enc.encode(data)));
}

/* Comparação em tempo constante: compara os HMACs, não as strings. */
export async function safeEqual(secret, a, b) {
  const [x, y] = await Promise.all([hmac(secret, `cmp:${a}`), hmac(secret, `cmp:${b}`)]);
  let r = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return r === 0;
}

/* Token de início: prova que a página foi aberta em `ts`.
   Serve para o tempo mínimo de preenchimento sem confiar no cliente. */
export async function startToken(secret, slug) {
  const ts = Date.now();
  return `${ts}.${await hmac(secret, `start:${slug}:${ts}`)}`;
}

export async function readStartToken(secret, slug, token) {
  if (typeof token !== 'string') return null;
  const [ts, sig] = token.split('.');
  if (!/^\d{10,16}$/.test(ts || '') || !sig) return null;
  const ok = await safeEqual(secret, sig, await hmac(secret, `start:${slug}:${ts}`));
  return ok ? Number(ts) : null;
}

/* ─── Senha ───────────────────────────────────────────────────────── */
export const cookieName = slug => `bf_${slug.replace(/-/g, '_')}`;

/* null = briefing sem senha; undefined = senha exigida mas env ausente */
export function passwordFor(config, env) {
  if (!config.password) return null;
  const p = env[config.password];
  return typeof p === 'string' && p.length ? p : undefined;
}

/* O valor do cookie inclui o hash da senha: trocar a senha derruba sessões. */
export async function sessionValue(secret, slug, password) {
  return hmac(secret, `pass:${slug}:${await sha256(password)}`);
}

export function readCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

export async function hasSession(request, env, config) {
  const password = passwordFor(config, env);
  if (password === null) return true;
  if (password === undefined) return false;
  const got = readCookie(request, cookieName(config.slug));
  if (!got) return false;
  return safeEqual(env.BRIEFING_SECRET, got, await sessionValue(env.BRIEFING_SECRET, config.slug, password));
}

/* ─── Rate limit ──────────────────────────────────────────────────────
   Com binding KV (BRIEFING_KV): contador por IP e janela de tempo.
   Sem KV: memória do isolate — mais fraco, mas melhor que nada.       */
const memory = new Map();

export async function rateLimit(env, key, limit, windowSec) {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const k = `rl:${key}:${bucket}`;
  if (env.BRIEFING_KV) {
    const n = parseInt((await env.BRIEFING_KV.get(k)) || '0', 10);
    if (n >= limit) return false;
    await env.BRIEFING_KV.put(k, String(n + 1), { expirationTtl: Math.max(60, windowSec * 2) });
    return true;
  }
  if (memory.size > 5000) memory.clear();
  const n = memory.get(k) || 0;
  if (n >= limit) return false;
  memory.set(k, n + 1);
  return true;
}

export const clientIp = request =>
  request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'local';

/* ─── Respostas ───────────────────────────────────────────────────── */
export const BASE_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function html(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: { ...BASE_HEADERS, 'Content-Type': 'text/html; charset=utf-8', ...extra },
  });
}
