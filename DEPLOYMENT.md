# DollarBot Deployment

## Fastest path: Cloudflare Pages

This project is prepared for Cloudflare Pages hosting with Cloudflare Workers AI.

### What you need

- a GitHub account
- a Cloudflare account
- Node.js 20 or newer

### Steps

1. Put this project in a GitHub repository.
2. Log into Cloudflare and open Workers & Pages.
3. Create a new Pages project.
4. Import the GitHub repository.
5. Set the build output directory to `public`.
6. In the Pages project, go to `Settings` then `Bindings`.
7. Add a Workers AI binding named `AI`.
8. Redeploy the project.
9. Open the generated Cloudflare Pages URL.

## What happens after deployment

- the website serves the frontend
- Cloudflare Pages Functions run `functions/api/chat.js` for live AI replies
- Cloudflare Workers AI handles the model call through the `AI` binding
- if live AI is unavailable, DollarBot falls back to built-in guidance and calculators

## Local testing

If you want to test locally first:

1. Install Node.js 20 or newer
2. Run:

```bash
npm install
```

3. Log into Cloudflare:

```bash
npx wrangler login
```

4. Start the app:

```bash
npm start
```

5. Open the local URL printed by Wrangler.

## Runtime details

- Cloudflare config lives in `wrangler.jsonc`
- Static assets are served from `public/`
- API routes live in `functions/api/`
- The default beta model is `@cf/meta/llama-3.1-8b-instruct-fast`
