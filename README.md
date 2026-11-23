# gocthuong.com

Personal site of Thương — Business Analyst (IT & AI), language journey EN / 中文.
Built from the canvas "góc Thương — Homepage Redesign" and the tech plan (Sprint 0–2 scope).

**Stack:** Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS v4 · next/font.
No database or server yet: every page is pre-rendered to plain HTML in `out/`.

## Pages

| URL | Page |
|---|---|
| `/` | Trang chủ (hero with VI / EN / 中文 switch, "Hiện tại", featured projects, languages, latest posts, contact) |
| `/du-an/` | Dự án — filter chips with counts, search, sort, grid/list, empty state |
| `/du-an/<slug>/` | Case study — meta, results, sticky table of contents, BA document gallery, user story, share |
| `/bai-viet/` | Bài viết — 3 views (grid/list/compact), filter, search, sort, filter summary, "Xem thêm" |
| `/bai-viet/<slug>/` | Post — TOC, save, share, "helpful?" feedback, prev/next, related posts |
| `/ket-noi/` | Tài nguyên — search, topic tabs, by topic / flat list, like, copy link |
| `/hanh-trinh-ngon-ngu/` | Language journey — roadmap, level bars, timeline with filter + "xem thêm", side-by-side translation samples |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # writes static HTML to ./out
npm start          # serves ./out locally
```

## Edit content

All text lives in `content/` — no code changes needed:

- `content/site.ts` — name, email, CV link, social links, "Hiện tại" row
- `content/projects.ts` — projects (one object = one page at `/du-an/<slug>/`)
- `content/posts.ts` — posts (one object = one page at `/bai-viet/<slug>/`)
- `content/resources.ts` — links on "Kết nối"
- `content/journey.ts` — HSK / CEFR levels, roadmap, timeline, translation samples

Text in `[brackets]` is a placeholder from the design. Replace it with real content.

## Deploy (static)

Any static host works. Firebase Hosting on the free plan:

```bash
npm run build
npx firebase-tools init hosting   # public dir: out, single-page app: No
npx firebase-tools deploy --only hosting
```

## Not built yet (later sprints)

Admin/CMS, contact + "share a resource" forms (need a small backend), full `/en/` and `/zh/`
pages (needs translated content), real images/PDFs. Likes and saved posts are stored in the
visitor's browser only.
