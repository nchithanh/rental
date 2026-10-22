# Deploy — Dolphin POS frontend

**Vercel** (Next.js) · repo `nchithanh/pos` · app directory `fe/`.

Không còn GitHub Pages / static export CI.

## Vercel (1 lần)

1. [vercel.com](https://vercel.com) → **Add New Project** → Import GitHub `nchithanh/pos`
2. **Root Directory:** `fe`
3. Framework Preset: **Next.js** (đọc `fe/vercel.json`)
4. Install / Build: `npm ci` / `npm run build` (mặc định trong `vercel.json`)
5. Deploy → URL dạng `https://<project>.vercel.app/`
6. (Tuỳ chọn) Settings → Domains → gắn custom domain

Push `main` sau đó → Vercel auto-deploy (Git Integration).

## Build env

| Env | Khi nào |
| --- | --- |
| *(trống)* | Production Vercel / `npm run build` — Next.js server, **không** `basePath`, PWA bật (prod) |
| `GITHUB_PAGES=true` + `GITHUB_PAGES_BASE_PATH` | Chỉ local optional (`npm run build:pages`) — static `out/`; **không** dùng cho Vercel |

`next.config.ts`: `output: "export"` + `basePath` chỉ khi `GITHUB_PAGES=true`.

## URL

| Giai đoạn | URL |
| --- | --- |
| Vercel preview / production | `https://<project>.vercel.app/` |
| Custom domain | `https://<domain>/` |

## Local

```bash
cd fe
npm run dev          # :3012
npm run build && npm start
# optional static artifact (không deploy Vercel):
npm run build:pages  # → out/
```

## Push

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push origin main
```

## Tắt GitHub Pages (1 lần trên GitHub)

Repo **Settings → Pages** → Source: **None** (hoặc bỏ GitHub Actions) để không còn URL `*.github.io/pos`.
