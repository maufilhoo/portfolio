# Briefings

Interactive briefings live at hidden URLs `mfilho.com/b/[slug]`. Each briefing is a single JSON file in this folder. The engine (`assets/briefing/`) and the server function (`functions/b/`) never need to change.

## How to create a new briefing

1. Duplicate `_exemplo.json` (or `branding.json`) and rename it to `[slug].json`. The slug becomes the URL and may only use `a-z 0-9 _ -`.
2. Set `"slug"` to the same name as the file, then edit `name`, `title`, `intro`, `duration`, `success`, `recipientEmail` and `emailSubject`.
3. Write the `steps` and `questions`. Types are `text`, `textarea`, `single`, `multi` and `contact`. Use `showIf` for conditional questions; a condition can only refer to questions that come earlier. The editor autocompletes and validates the file against `schema.json`.
4. Optional password: add `"password": "BRIEFING_PASS_CLIENT"` to the file. Then create that variable with the actual password in Cloudflare (Settings → Variables and Secrets) and in `.dev.vars` for local work.
5. Test locally with `npx wrangler pages dev .` at `http://localhost:8788/b/[slug]`, then commit and push to `main`.

## Notes

- `/briefings/*` is never served publicly. The function reads these files internally, and the browser never receives `recipientEmail` or `password`.
- Every `/b/*` response sends `noindex, nofollow` as a meta tag and as `X-Robots-Tag`. Do not link to briefings from the site.
- An invalid file (repeated id, missing step, and so on) returns a 404, and the reason is logged by the function (`wrangler pages dev` output or Cloudflare logs).
- Interface strings (buttons, error messages) can be overridden per briefing in `"ui"`. See `UI` in `assets/briefing/engine.js`.
- Answers are saved in the visitor's `localStorage` under `bf:[slug]` and cleared after a successful send.
