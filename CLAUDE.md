# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vue 3 + Vite frontend for a charging-station admin platform (后台管理系统). Element Plus UI, Pinia state, Vue Router with role-based guards, ECharts for statistics, axios for HTTP, plus a WebSocket channel for customer service. UI text and route titles are in Chinese — keep that convention.

## Commands

- `npm run dev` — Vite dev server on **port 6101**. Proxies `/api/*` to `VITE_API_TARGET` (default `http://localhost:8080`, the Java backend). The customer-service WebSocket URL is read from `VITE_WS_BASE_URL`. Both live in `.env.development` / `.env.production`; change them together when the backend moves.
- `npm run build` — production build to `dist/`.
- `npm run preview` — preview the built bundle.

No lint, test, or typecheck scripts are configured. The codebase is plain JS (no TypeScript).

## Architecture

### Auth + role model (`src/store/authStore.js`)
Pinia `authStore` (`useAuthStore`) is the source of truth for the logged-in admin. Admin types are an integer enum. Business state (invite codes) was split out into `src/store/inviteCodeStore.js` (`useInviteCodeStore`) and is used by `PlatformManage.vue`.

| code | label (`typeDesc`) |
|------|--------------------|
| 0 | 超级管理员 |
| 1 | 普通管理员 |
| 2 | 审核员 |
| 3 | 客服 |
| 4 | 紧急响应人员 |
| 5 | 论坛管理员 |
| 10 | 未分配身份 |

- Token + `adminInfo` are persisted in `localStorage` under keys `admin_token`, `admin_token_type`, `admin_expires_in`, `admin_info`. The store rehydrates on construction via `initFromStorage()`.
- `hasPermission(requiredType)` accepts **either** a string action (`'manage_admins'`, `'audit'`, `'customer_service'`, `'emergency'`, `'platform_manage'`, `'forum_manage'`) **or** an array of Chinese role labels (e.g. `['超级管理员', '客服']`). Super admin always passes. Router `meta.permission` uses the array form.
- `AdminType` enum is exported from `authStore.js` and re-exposed on the store; the type→label map (`typeDescription`) is a module constant in the same file.

### Routing (`src/router/index.js`)
- Single flat `routes` array; all views are lazy-imported.
- Layout selection is driven by `meta.hideLayout` in `App.vue`: truthy → render the component bare (login/register); falsy → wrap in `components/layout/MainLayout.vue`.
- Global `beforeEach` guard: redirects to `/login` if `meta.requiresAuth` and not logged in; calls `authStore.hasPermission(to.meta.permission)` when `meta.permission` is set; bounces back to `/` with an `ElMessage.error` on failure.
- Parent routes like `/audit`, `/decision`, `/notice` declare children that render inside the parent view's `<router-view>` — adding a new sub-page means adding both the child route and a nav entry inside that parent view.

### API layer
- `src/api/index.js` exports a configured axios instance with `baseURL: '/api/v1/admin'` and a 30s timeout. It auto-attaches `Authorization: <tokenType> <token>` from `localStorage` on every request.
- Response interceptor unwraps `{ code, data, message }`: returns `res.data` on `code === 200`, shows `ElMessage.error` and rejects otherwise. **Two endpoints are special-cased** to return the whole envelope (so callers can read `message`): `/auth/logout` and `/emergency/call/{id}/respond`. If you add another endpoint that needs the envelope, extend the same conditional in `src/api/index.js`.
- 401 anywhere → `authStore.logout()` + redirect to `/login`. 403 is intentionally swallowed (no toast) because some backend endpoints are not yet implemented — don't "fix" this without a wider conversation. `blob` responses are returned raw for file downloads.
- The **request** interceptor reads `localStorage` directly (not the Pinia store) to avoid instantiating the store during module evaluation; the **response** interceptor calls `useAuthStore()` lazily for logout. This `api/index.js → authStore → api/auth → api/index` cycle is intentional and safe because every cross-reference is deferred to runtime.
- API modules are organized by domain: `auth.js` (login, profile, members, invite codes), `audit.js`, etc. Add new domain modules alongside these and import the default `service` from `./index`.

### Customer-service WebSocket (`src/utils/CustomerServiceWS.js`)
Class-based client that opens `ws://localhost:8080/ws/customer-service?token=<jwt>`, dispatches messages by `type` to registered handlers (`ws.on(type, fn)`), and runs a heartbeat. Used by `CustomerService.vue`. The WS URL is **not** routed through the Vite proxy — it hits the backend directly.

### Shared modules (`src/composables`, `src/utils`, `src/styles`)
These were extracted during the `feature/full-optimization` refactor to kill duplicated inline code across the 50+ views — reuse them instead of re-introducing local copies:
- `composables/usePagination.js` — single pagination hook (`pageNum`/`pageSize`/`total` + `handleSizeChange`/`handleCurrentChange`/`reset` with an `onChange` callback). Replaced ~44 duplicated pagination blocks.
- `utils/statusMaps.js` — audit status, priority, and private-station auth-status text/tag-type maps plus `getXxxText`/`getXxxType` helpers (shared by all `*Audit` views).
- `utils/dateFormat.js` — `formatDateTime` / `formatDateMinute` / `formatDay` (return `''` on empty/invalid input).
- `utils/roleColors.js` — role → color/tag-type mapping (`roleColorByType`, `roleColorByDesc`, `roleTagType`).
- `utils/echarts.js` — on-demand ECharts assembly (`echarts/core` + only used charts/components). Import this instead of `import * as echarts from 'echarts'`.
- `styles/variables.css` — global CSS design tokens (colors, radius, spacing, shadows, layout sizes). Imported first in `main.js`; components reference `var(--color-*)`, `var(--radius-*)`, etc.

### Build & tooling (`vite.config.js`, `src/main.js`)
- Element Plus **components and function APIs** (`ElMessage`, `ElMessageBox`, …) are auto-imported on demand via `unplugin-vue-components` + `unplugin-auto-import` with `ElementPlusResolver`. There is **no** `app.use(ElementPlus)` and no full `element-plus/dist/index.css` import. Generated type hints land in `src/components.d.ts` / `src/auto-imports.d.ts` (committed; regenerate by running a build).
- Element Plus **icons** are still globally registered in `main.js` (all of `@element-plus/icons-vue`) so `<el-icon><UserFilled /></el-icon>`-style usage works without explicit imports.
- `build.rollupOptions.output.manualChunks` splits vendors into `vendor-echarts`, `vendor-element`, `vendor-vue`, `vendor-xlsx` for better caching.

### Views
Roughly 50 top-level views in `src/views/` plus a `system/` subfolder (`UserManage`, `RoleManage`, `LogManage`, `UserDetail`). The split is roughly: dashboard, statistics (many `Statistics*.vue` slices per role/topic), decision (AI*.vue family), audit (per-audit-type pages), platform management, notice, customer service, emergency, forum, profile, data export/screen. When adding a new feature, check whether an existing `Statistics*` or `Audit/*` page already covers the domain before creating a new top-level view.

## Working in this repo

- New protected routes must declare both `requiresAuth: true` and the correct `permission` array of Chinese role labels — otherwise everyone sees them.
- When adding admin-type-gated UI, prefer the Pinia store's `isSuperAdmin` / `isAuditor` / `hasPermission` computeds over reading `localStorage` directly.
- Path alias `@` resolves to `src/` (configured in `vite.config.js`) — use it for cross-folder imports.
- The shell is Windows bash (Git Bash on Win11). Use forward slashes in paths and `/dev/null`, not `NUL`. Many project paths contain Chinese characters and spaces — quote them.
