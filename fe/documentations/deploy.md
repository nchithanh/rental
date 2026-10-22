# Deploy — Dolphin Rental FE

Repo `nchithanh/rental` · app `fe/`.

| Kênh | Vai trò |
| --- | --- |
| **GitHub Pages** | Static export qua Actions (root — custom domain) |
| **Vercel** (tuỳ chọn) | Next.js server nếu import project riêng |

## GitHub Pages (Actions)

Workflow: `.github/workflows/build.yml` — tên UI **Build and deploy Pages**

| | |
| --- | --- |
| Trigger | `push` → `main` · `workflow_dispatch` · PR chỉ CI `npm run build` |
| Build (main) | `fe/`: `npm ci` · `npm run build:pages` |
| Env | `GITHUB_PAGES=true` (không `basePath` — subdomain phục vụ ở `/`) |
| Output | `fe/out` → Deploy Pages |

Custom domain `rental.dolphin-software.io.vn` map project Pages ở **root**. Không dùng `basePath=/rental` (sẽ 404 `/rental/_next/...`).

### Bật 1 lần trên GitHub

1. **Settings → Pages** → Source: **GitHub Actions** · Custom domain nếu cần
2. (Nếu cần) **Settings → Actions → General** → Allow actions
3. **Actions** → **Build and deploy Pages** → **Run workflow** (nếu push không tự chạy)

### URL

- Production: `https://rental.dolphin-software.io.vn/`
- Fallback: `https://nchithanh.github.io/rental/` (redirect về custom domain nếu đã cấu hình)

## Local

```bash
cd fe
npm run dev                 # :3013
npm run build && npm start  # server
npm run build:pages         # → out/ (static export, root paths)
```

## Push

```bash
GIT_SSH_COMMAND='ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes' git push origin main
```
