# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # dev server (Next.js 16, localhost:3000)
pnpm build        # production build
pnpm lint         # ESLint (eslint-config-next core-web-vitals + typescript)
pnpm start        # production server
```

Package manager is **pnpm 9.12.3** — npm, yarn 절대 사용 금지. `pnpm-lock.yaml`이 lockfile.

No test framework is configured.

## Tech Stack

- **Next.js 16.2.2** (App Router) / React 19 / TypeScript 5
- **Tailwind CSS 4** with design tokens in `src/app/globals.css` (CSS custom properties: `--ink`, `--point`, `--bg-canvas`, `--r-btn`, `--sp-md`, etc.)
- **Supabase** for auth — `@supabase/ssr` with cookie-based sessions, both browser client (`src/lib/supabase/client.ts`) and server client (`src/lib/supabase/server.ts`)
- **Toss Payments SDK** (`@tosspayments/tosspayments-sdk`) for checkout
- **Sentry** (client + server + edge configs at project root)
- **Framer Motion** for animations, **Three.js** for 3D, **Lottie** for animated graphics
- **Pretendard** variable font (Korean)

## Architecture

### Auth Flow (two-tier)

Authentication has two layers that must both be satisfied:

1. **Supabase session** — email/password or Kakao OAuth. Server Actions in `src/app/auth/actions.ts` handle sign-in/sign-up and return tokens to the client.
2. **Backend profile** — the separate backend API must have a `users` record. `UserContext.profileStatus` tracks this: `complete` | `incomplete` | `none` | `loading` | `error`.

`ProfileGate` (`src/components/ProfileGate.tsx`) is a global guard that redirects to `/signup?step=2` when a user has a Supabase session but no backend profile (Kakao OAuth step-2 dropout scenario). `isAuthenticated` (session + complete profile) is the gate for protected routes — not `isLoggedIn` (session only).

### API Proxy Pattern

Client code calls `apiFetch()`/`apiJson()` from `src/lib/api/client.ts`. When `NEXT_PUBLIC_USE_AUTH_PROXY` is not `"false"` (default ON), requests route through `/api/proxy/*` Route Handler (`src/app/api/proxy/[...path]/route.ts`). The proxy extracts the Supabase access token from httpOnly cookies and attaches it as `Authorization: Bearer` to the backend. The client sends `X-Auth-Mode: auto|required|none` to control auth behavior.

API modules (`src/lib/api/user.ts`, `cart.ts`, `store.ts`, `payment.ts`, `subscription.ts`, `spirit.ts`) are thin wrappers around `apiFetch`/`apiJson`.

### State Management

No external state library. Two React Contexts wrap the entire app via `src/providers/Providers.tsx`:

- **UserContext** (`src/contexts/UserContext.tsx`) — Supabase session, auth state, profile status, profile version (for re-fetch triggers). Access via `useUser()`.
- **CartContext** (`src/contexts/CartContext.tsx`) — cart items synced between localStorage (guest) and backend (member). Login triggers `syncCartAfterLogin()` to merge guest cart into server cart. Access via `useCart()`.

### Layout

`src/app/layout.tsx` → `Providers` → `LayoutShell` (Header + TopBanner + Footer + ScrollToTop). The subscribe planner page (`/subscribe`) gets special layout treatment (no flex-grow on main).

### Middleware

`src/lib/supabase/proxy.ts` exports `updateSession()` for middleware — refreshes expired Supabase tokens on every request and syncs cookies.

### Page Co-location

Each route folder under `src/app/` co-locates its private components (`_components/`), data (`_data/`), hooks (`_hooks/`), and types (`_types/`). The subscribe flow is the most complex, with ~18 components, a custom hook (`useSubscribePlanner`), and a multi-step order flow.

### Path Alias

`@/*` maps to `./src/*` (tsconfig paths).

## Environment Variables

`.env.local`에만 저장 — 코드에 환경변수 값을 절대 하드코딩하지 않는다.

Required (referenced in code):
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `NEXT_PUBLIC_API_BASE_PATH` — backend API base URL
- `NEXT_PUBLIC_USE_AUTH_PROXY` — set to `"false"` to disable proxy mode (default: ON)
- `API_BASE_INTERNAL` — backend URL for server-side proxy (falls back to `NEXT_PUBLIC_API_BASE_PATH`)
- `SENTRY_AUTH_TOKEN` — Sentry sourcemap upload token

## Rules

- **API 호출은 반드시 `src/lib/api/` 모듈을 통해서.** 컴포넌트에서 `fetch()`를 직접 호출하지 않는다. 새 엔드포인트가 필요하면 `src/lib/api/`에 함수를 추가하고 `apiFetch`/`apiJson`을 사용한다.
- **Supabase 클라이언트는 SSR/브라우저 구분.** Client Component → `getSupabaseBrowserClient()` (`src/lib/supabase/client.ts`). Server Component / Server Action / Route Handler → `createSupabaseServerClient()` (`src/lib/supabase/server.ts`). 절대 혼용하지 않는다.
- **페이지별 `_components/` 폴더 구조 유지.** 특정 라우트에서만 쓰이는 컴포넌트는 해당 라우트의 `_components/` 폴더에 둔다. 여러 라우트에서 공유하는 컴포넌트만 `src/components/`에 둔다.

## Key Conventions

- Korean language throughout UI and comments. Commit messages and code comments are in Korean.
- Client Components use `"use client"` directive. Server Actions use `"use server"`.
- Design tokens live in CSS custom properties in `globals.css`, not in Tailwind config. Use `var(--token-name)` in styles.
- Background color is `#D7D7D7` (LayoutShell), min-width `360px` for mobile.
- Public assets are under `/public/` with `NEXT_PUBLIC_BASE_PATH` prefix applied at runtime.
