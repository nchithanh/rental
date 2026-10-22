# Deploy — Dolphin Rental FE

Repo `nchithanh/rental` · app `fe/`.

| Kênh | Vai trò |
| --- | --- |
| **GitHub Pages** | Static export qua Actions (`/rental` basePath) |
| **Vercel** (tuỳ chọn) | Next.js server nếu import project riêng |

## GitHub Pages (Actions)

Workflow: `.github/workflows/build.yml` — tên UI **Build and deploy Pages**

| | |
| --- | --- |
| Trigger | `push` → `main` · `workflow_dispatch` · PR chỉ CI `npm run build` |
| Build (main) | `fe/`: `npm ci` · `npm run build:pages` |
| Env | `GITHUB_PAGES=true` · `GITHUB_PAGES_BASE_PATH=/rental` |
| Output | `fe/out` → Deploy Pages |

### Bật 1 lần trên GitHub

1. **Settings → Pages** → Source: **GitHub Actions**
2. (Nếu cần) **Settings → Actions → General** → Allow actions
3. **Actions** → **Build and deploy Pages** → **Run workflow** (nếu push không tự chạy)

### URL

`https://nchithanh.github.io/rental/`

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
