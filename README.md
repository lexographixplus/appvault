# AppVault

Application, resource, and infrastructure relationship manager. Catalogue your apps,
the databases and services they depend on, the links between them, their dependencies
and deployment targets — with an optional Google Sheet as the shared backing store.

Built with React 19, TypeScript, Vite 6 and Tailwind CSS 4. Ships as a fully static
site (hash-based routing, no server required).

## Running locally

**Prerequisites:** Node.js 20+

```bash
npm install
```

```bash
npm run dev
```

That starts an Express server on <http://localhost:3000> with Vite in middleware mode.
It also exposes `GET /api/health` and a `POST /api/sheets/proxy` helper for calling
Apps Script from a server context. Neither is required by the UI — the browser talks to
Apps Script directly — and neither exists on GitHub Pages.

To run Vite alone, without Express:

```bash
npm run dev:vite
```

## Data storage

All state lives in `localStorage` under the `appvault_v2_` prefix. Nothing is sent
anywhere unless a Google Apps Script Web App URL is configured.

With a URL configured, the app polls that endpoint (default every 15s), pulls remote
changes into local state, and pushes local edits back after a 2s debounce.

> **Note on conflicts:** sync is last-writer-wins over the whole dataset. Two people
> editing different records at the same time can overwrite each other. It is well
> suited to a single user across devices, less so to concurrent editing.

## Connecting a Google Sheet

1. Open the **Google Sheets Sync** tab in the app.
2. Follow the four setup steps and copy the generated Apps Script into your sheet
   (Extensions → Apps Script).
3. Deploy it as a Web App with *Execute as: Me* and *Who has access: Anyone*, then
   paste the resulting `/exec` URL into the app and hit **Save URL**.

⚠️ **A Web App deployed with "Anyone" access is unauthenticated.** Anyone who learns
the URL can read and overwrite the whole spreadsheet. Since a static site necessarily
ships its endpoint in the client bundle, treat any sheet you connect to a public
deployment as public data. For anything sensitive, keep the URL out of the build and
let each user paste their own.

## Deploying to GitHub Pages

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml),
which typechecks, builds, and publishes `dist/` to Pages.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow sets `BASE_PATH` from the repository name, so assets resolve under
`/<repo>/`. To pre-configure the sync endpoint for the deployed site, add a repository
*variable* named `VITE_SHEETS_WEB_APP_URL` under **Settings → Secrets and variables →
Actions → Variables**. Left unset, the site starts in local-only mode and users supply
their own URL.

Building for a root domain instead:

```bash
BASE_PATH=/ npm run build
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Express + Vite dev server on port 3000 |
| `npm run dev:vite` | Vite dev server only |
| `npm run build` | Static production build into `dist/` |
| `npm run preview` | Serve the built bundle at the production base path |
| `npm run build:server` | Bundle the Express server to `dist-server/` |
| `npm start` | Run the bundled Express server |
| `npm run lint` | TypeScript typecheck (`tsc --noEmit`) |
