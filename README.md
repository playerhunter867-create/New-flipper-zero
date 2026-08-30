# OSINT Elite v3

GitHub Pages frontend + Cloudflare Worker JSON API.

## Architecture

GitHub Pages (static HTML/CSS/JS)
→ Cloudflare Worker
→ approved public APIs
→ normalized JSON
→ frontend cards.

GitHub Pages is static, so the Worker is the server-side layer.

## 1. Deploy the Worker

Install Node.js, then:

```bash
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

Cloudflare will give you a `workers.dev` URL.

## 2. Connect the frontend

Open:

`pages/assets/app.js`

Change:

```js
const API=(localStorage.getItem('osint_api_url')||'https://YOUR-WORKER.workers.dev')
```

to your real Worker URL.

Alternatively, before analysis run in the browser console:

```js
localStorage.setItem('osint_api_url','https://YOUR-WORKER.workers.dev')
```

## 3. Publish Pages

Upload everything inside `pages/` to the root of your GitHub Pages repository, or configure the repository to publish from that directory using your preferred workflow.

## 4. API keys

Do NOT put API keys in `pages/assets/app.js`.

Use Cloudflare Worker Secrets:

```bash
npx wrangler secret put WEB_SEARCH_API_KEY
```

Then read it as `env.WEB_SEARCH_API_KEY` inside the Worker.

## 5. What this starter does

The Worker has:
- CORS;
- `/health`;
- `/api/analyze`;
- target type validation;
- normalized JSON;
- public search links;
- a clear place for approved API adapters.

It does NOT attempt to access private accounts, closed databases, credentials, or bypass authentication.

## Example JSON

```json
{
  "ok": true,
  "version": "3.0.0",
  "type": "username",
  "target": "@example",
  "results": [
    {
      "title": "Google",
      "source": "Google Search",
      "url": "https://www.google.com/search?q=%40example"
    }
  ]
}
```
