# Deploy — Dolphin Rental FE

Repo `nchithanh/rental` · app `fe/`.

| Kênh | Vai trò |
| --- | --- |
| **GitHub Pages** | Static export qua Actions (`/rental` basePath) |
| **GitHub Actions Build** | CI check `npm run build` (server) — không deploy |
| **Vercel** (tuỳ chọn) | Next.js server nếu import project riêng |

## GitHub Pages (Actions)

Workflow: `.github/workflows/deploy-pages.yml`

| | |
| --- | --- |
| Trigger | `push` → `main` · `workflow_dispatch` |
| Build | `fe/`: `npm ci` · `npm run build:pages` |
| Env | `GITHUB_PAGES=true` · `GITHUB_PAGES_BASE_PATH=/rental` |
| Output | `fe/out` → Deploy Pages |

### Bật 1 lần trên GitHub

1. **Settings → Pages** → Source: **GitHub Actions**
2. (Nếu cần) **Settings → Actions → General** → Allow actions

### URL

`https://nchithanh.github.io/rental/`

## CI build (không Pages)

`.github/workflows/build.yml` — Node 20 · `npm ci` · `npm run build` (push/PR `main` + manual).

## Local

```bash
cd fe
npm run dev                 # :3013
npm run build && npm start  # server
npm run build:pages         # → out/ (static, basePath /rental)
```

## Push

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push origin main
```
