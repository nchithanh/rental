# Deploy — Dolphin Rental FE

**Vercel** (Next.js) · repo `nchithanh/rental` · app directory `fe/`.

Deploy production: Vercel. CI check: GitHub Actions (build only, không Pages).

## Vercel (1 lần)

1. [vercel.com](https://vercel.com) → **Add New Project** → Import GitHub `nchithanh/rental`
2. **Root Directory:** `fe`
3. Framework Preset: **Next.js** (đọc `fe/vercel.json`)
4. Install / Build: `npm ci` / `npm run build` (mặc định trong `vercel.json`)
5. Deploy → URL dạng `https://<project>.vercel.app/`
6. (Tuỳ chọn) Settings → Domains → gắn custom domain

Push `main` sau đó → Vercel auto-deploy (Git Integration).

## GitHub Actions (CI build)

Workflow: `.github/workflows/build.yml`

| | |
| --- | --- |
| Trigger | `push` / `pull_request` → `main` |
| Working dir | `fe/` |
| Steps | Node 20 · `npm ci` · `npm run build` |

Chỉ kiểm tra build xanh; **không** publish GitHub Pages / artifact static.

## Build env

| Env | Khi nào |
| --- | --- |
| *(trống)* | Production Vercel / `npm run build` — Next.js server, **không** `basePath`, PWA bật (prod) |
| `GITHUB_PAGES=true` + `GITHUB_PAGES_BASE_PATH` | Chỉ local optional (`npm run build:pages`) — static `out/`; **không** dùng cho Vercel / CI |

## Local

```bash
cd fe
npm run dev          # :3013
npm run build && npm start
```

## Push

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push origin main
```

## Tắt GitHub Pages (1 lần trên GitHub)

Repo **Settings → Pages** → Source: **None** để không còn URL `*.github.io/...`.
