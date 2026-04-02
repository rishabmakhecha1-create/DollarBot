# DollarBot

DollarBot is a lightweight youth finance assistant app for teens and young adults.

This version is set up for a Cloudflare-native beta stack:

- Cloudflare Pages for hosting
- Cloudflare Pages Functions for `/api/chat` and `/api/health`
- Cloudflare Workers AI for live chat replies
- built-in guidance and calculators as a graceful fallback when live AI is unavailable

## Files

- `public/index.html` - app structure
- `public/styles.css` - visual design and responsive layout
- `public/app.js` - frontend chat behavior
- `functions/api/chat.js` - Cloudflare Pages Function for live chat
- `functions/api/health.js` - lightweight Cloudflare health check
- `dollarbot-config.mjs` - shared AI behavior and model settings
- `wrangler.jsonc` - Cloudflare Pages and Workers AI config
- `.nvmrc` - recommended Node version
- `package.json` - local Cloudflare dev scripts
- `DEPLOYMENT.md` - plain-English Cloudflare deployment steps

## Run locally

This version needs Node.js installed.

1. Install Node.js 20 or newer.
2. In this project folder, install dependencies:

```bash
npm install
```

3. Log into Cloudflare with Wrangler:

```bash
npx wrangler login
```

4. Start local development with the Workers AI binding:

```bash
npm start
```

5. Open the local URL shown by Wrangler.

Important:
- Cloudflare says Workers AI local development still uses your Cloudflare account usage.
- No browser-side AI key is required for this setup.

## Beta Hosting Direction

The intended beta path is Cloudflare Pages:

1. Upload this project to GitHub
2. Create a Cloudflare Pages project
3. Connect the GitHub repository
4. Set the output directory to `public`
5. Add a Workers AI binding named `AI`
6. Deploy

After that, you can open a normal web URL and use DollarBot like a normal app.

For the full plain-English version, see `DEPLOYMENT.md`.

## Notes

- The current Cloudflare Workers AI model is `@cf/meta/llama-3.1-8b-instruct-fast`.
- If live AI is not available, DollarBot falls back to built-in finance guidance instead of breaking.
- The frontend request shape is still `POST /api/chat` with `{ message, history }`.
- No extra AI provider setup is required in the main beta path anymore.

## Next upgrades

- add user accounts and saved chats
- create topic-specific lesson flows
- add calculators for budgeting, savings, and paychecks
