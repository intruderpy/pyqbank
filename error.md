# PYQBank — Error Audit Report

> Generated: 2026-05-01 | **TypeScript**: ✅ Clean | **ESLint**: ❌ 42 errors, 10 warnings

---

## Summary

| Category | Count | Severity |
|---|---|---|
| React Hooks — Variable Access Before Declaration | 4 | 🔴 Error |
| React Hooks — setState in Effect | 4 | 🔴 Error |
| React Hooks — Impure Function in Render | 1 | 🔴 Error |
| `<a>` instead of `<Link>` (next/link) | 10 | 🔴 Error |
| `@typescript-eslint/no-explicit-any` | 14 | 🔴 Error |
| Unused Variables / Imports | 10 | 🟡 Warning |
| Security — Hardcoded Fallback Secrets | 2 | 🟠 Design |
| Architecture — Missing `/quiz` Route | 1 | 🟠 Design |
| Architecture — Empty Directories | 3 | 🟡 Cleanup |
| Architecture — Duplicate CSS Definitions | 1 | 🟡 Cleanup |
| Architecture — Tailwind Still in Dependencies | 1 | 🟡 Cleanup |
| Missing `Content-Type` Header on fetch Calls | 9 | 🟠 Design |

---

## 🔴 Critical Errors (ESLint)

### 1. React Hooks — Variables Accessed Before Declaration

Functions defined with `const` after the `useEffect` that calls them trigger `react-hooks/immutability` errors. In React 19 strict mode, this can cause stale closures.

| File | Line | Variable |
|---|---|---|
| `src/app/admin/add/page.js` | 34 | `fetchLookups`, `fetchQuestions` |
| `src/app/admin/exams/page.js` | 21 | `fetchAll` |
| `src/app/admin/subjects/page.js` | 20 | `fetchAll` |

**Fix**: Move function declarations _above_ the `useEffect` that references them, or wrap them in `useCallback`.

---

### 2. React Hooks — `setState` Called Synchronously Inside `useEffect`

Calling `setPage(0)` or similar synchronous state updates directly inside effect bodies causes cascading re-renders.

| File | Line | setState Call |
|---|---|---|
| `src/app/exams/[exam]/[category]/[year]/page.tsx` | 128 | `setPage(0)` |
| `src/app/subjects/[subject]/[topic]/page.tsx` | 89 | `setPage(0)` |
| `src/app/subjects/[subject]/questions/page.tsx` | 53 | `loadQuestions(0)` (calls setState internally) |
| `src/app/exams/[exam]/[category]/[year]/page.tsx` | 93 | `setSelectedShift(null)` |

**Fix**: Fold page reset logic into the `loadQuestions` callback, or use a ref to track page number instead of state.

---

### 3. Impure Function Call During Render

| File | Line | Issue |
|---|---|---|
| `src/app/admin/add/page.js` | 85 | `Date.now()` called during render (inside `handleSave` which is used as form handler, but lint treats it as render-path code) |

**Fix**: Move `Date.now()` inside the async handler body or compute it on submit only via a `useRef`/local variable.

---

### 4. `<a>` Tags Instead of `<Link>` from `next/link`

Using raw `<a>` tags for internal navigation bypasses Next.js client-side routing (no prefetch, full page reload).

| File | Lines | Links |
|---|---|---|
| `src/app/question/[slug]/page.tsx` | 101 | `<a href="/">` navbar logo |
| `src/app/subjects/[subject]/[topic]/[subtopic]/page.tsx` | 39, 43, 44 | Navbar `<a>` for `/`, `/exams/`, `/subjects/` |
| `src/app/exams/[exam]/[category]/[year]/[date]/page.tsx` | 75 | `<a href="/">` navbar logo |
| `src/app/exams/[exam]/[category]/[year]/[date]/[shift]/page.tsx` | 77 | `<a href="/">` navbar logo |

**Fix**: Replace all `<a href="...">` with `<Link href="...">` from `next/link`.

---

### 5. `@typescript-eslint/no-explicit-any` (14 occurrences)

| File | Lines |
|---|---|
| `src/lib/queries.ts` | 12, 30, 70, 88, 131, 173 |
| `src/app/sitemap.ts` | 28, 31, 34, 81, 84, 87 |
| `src/app/subjects/[subject]/[topic]/page.tsx` | 52 |
| `src/app/subjects/[subject]/[topic]/[subtopic]/layout.tsx` | 13 |

**Fix**: Replace `any` with proper typed interfaces or use Supabase-generated types.

---

## 🟡 Warnings

### 6. Unused Variables

| File | Line | Variable |
|---|---|---|
| `src/components/questions/QuestionList.tsx` | 180 | `OPTION_LABELS` — declared but never used |
| `src/lib/queries.ts` | 12 | destructured `categories` unused |
| `src/lib/queries.ts` | 30 | destructured `exam_sessions` unused |
| `src/lib/queries.ts` | 70 | destructured `questions` unused |
| `src/lib/queries.ts` | 88 | destructured `questions` unused |
| `src/lib/queries.ts` | 132 | destructured `exam_sessions` unused |

**Fix**: Prefix unused destructured vars with `_` (e.g. `_categories`) or remove them.

---

## 🟠 Design & Architecture Issues

### 7. Security — Hardcoded Fallback Admin Secret

Both `src/middleware.ts` (line 8) and `src/app/api/admin/mutate/route.ts` (line 8) contain:

```ts
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'pyqbank_admin_2025';
```

If `ADMIN_SECRET` env var is missing in any deployment, the fallback `'pyqbank_admin_2025'` is used — a publicly visible default in source code. The actual `.env.local` has a strong secret, but this fallback is dangerous.

**Fix**: Remove the fallback; throw an error if `ADMIN_SECRET` is undefined at startup.

---

### 8. Missing `Content-Type` Header on Admin Fetch Calls

All `fetch('/api/admin/mutate', ...)` calls in admin pages send JSON via `body: JSON.stringify(...)` but **do not set** `Content-Type: application/json` header. This works because `request.json()` in the route handler parses the body regardless, but it's non-standard and may break with stricter middleware/proxies.

**Affected files**:
- `src/app/admin/add/page.js` — 4 fetch calls
- `src/app/admin/exams/page.js` — 7 fetch calls  
- `src/app/admin/subjects/page.js` — 4 fetch calls

**Fix**: Add `headers: { 'Content-Type': 'application/json' }` to all fetch calls.

---

### 9. Missing `/quiz` Route (Dead Link)

The homepage navbar includes:
```tsx
<Link href="/quiz" className="nav-link">Quiz Mode</Link>
```
But there is **no** `src/app/quiz/` directory or page. This is a 404 for users.

**Fix**: Either create the `/quiz` route or remove the link from the navbar.

---

### 10. Empty Component Directories

These directories exist but contain no files:
- `src/components/ui/` — empty
- `src/components/layout/` — empty
- `src/hooks/` — empty

**Fix**: Remove empty directories or add placeholder README files.

---

### 11. Tailwind CSS Still in `devDependencies`

`package.json` still lists `tailwindcss` and `@tailwindcss/postcss` as dev dependencies, but the project was migrated to vanilla CSS. These are unused dead weight.

**Fix**: Run `npm uninstall tailwindcss @tailwindcss/postcss postcss` if PostCSS is also unused.

---

### 12. Duplicate Navbar/Browse CSS Definitions

Both `src/styles/home.css` and `src/styles/browse.css` define identical `.navbar`, `.navbar-inner`, `.navbar-logo`, `.navbar-links`, `.nav-link` styles. This creates maintenance overhead and potential conflicts.

**Fix**: Extract shared navbar/breadcrumb styles into `globals.css` or a shared `src/styles/layout.css`, then import from both pages.

---

### 13. `admin/page.js` Is a Server Component Importing Client-Side Supabase

`src/app/admin/page.js` is an `async` server component that imports `supabase` from `@/lib/supabase`. This client uses the **anon key** with RLS. While it works for reads, it's architecturally inconsistent with the admin pattern (which uses `supabaseAdmin` for mutations). The dashboard counts could return 0 if RLS policies block anonymous reads on the `questions` table.

**Fix**: Use `supabaseAdmin` for server-side admin data fetching, or ensure RLS allows anon reads for count queries.

---

### 14. `question/[slug]/page.tsx` — Missing CSS Classes

The page uses classes like `.options-grid`, `.option-btn`, `.option-label`, `.option-content`, `.explanation-box` that are **not defined** in any CSS file (`questions.css`, `browse.css`, or `globals.css`). These elements will render unstyled.

**Fix**: Add the missing class definitions to `src/styles/questions.css`.

---

### 15. Copyright Year Outdated

`src/app/page.tsx` line 246: `© 2024 PYQBank` — should be 2025/2026.

---

## ✅ What's Clean

- **TypeScript compilation**: `tsc --noEmit` passes with **zero errors**
- **Supabase types**: Well-structured `Database` type with row/insert/update generics
- **API route**: `admin/mutate` has proper auth guard and error handling
- **Middleware**: Admin auth check is correctly scoped to `/admin/:path*`
- **SEO**: Sitemap, robots.txt, structured data, and metadata are all properly implemented
- **Dynamic routing**: All `params` are correctly typed as `Promise<...>` (Next.js 16 pattern)
