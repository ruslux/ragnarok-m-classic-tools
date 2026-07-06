# Ragnarok Tools

Static SPA built with **Vite + React + TypeScript**, styled with **Tailwind CSS v4**, routed with **React Router**.

## UI framework recommendation

For components on top of Tailwind, use **[shadcn/ui](https://ui.shadcn.com/)** — copy-paste Radix-based components with full control over styling. Alternatives: **Mantine** (batteries included) or **Radix UI** directly (headless primitives).

## Development

```bash
npm install
npm run dev
```

Local preview with GitHub Pages base path:

```bash
npm run preview:pages
```

## GitHub Pages

1. Push this repo to GitHub (default branch: `main`).
2. In repo **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` — workflow `.github/workflows/deploy.yml` builds and publishes.

Site URL: `https://ruslux.github.io/ragnarok-m-classic-tools/`

If the repo name changes, update `preview:pages` script and ensure `VITE_BASE_PATH` in the workflow matches `/<repo-name>/`.
