# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Project Overview

This is a **uni-app + Vue 3 + Vite** cross-platform mini program project (微信小程序为主) called "挪车助手" (Move Car Assistant). It allows users to scan QR codes or enter license plates to contact car owners, and registered users can generate their own move-car QR codes.

The project is built with **HBuilderX** and targets WeChat Mini Program (`mp-weixin`). It also has H5 and App support.

## Build & Development Commands

This project is developed primarily through **HBuilderX**, not CLI. There are no standard npm build scripts defined in `package.json`.

- **Dev server**: Open the project in HBuilderX and click "运行" (Run) → select target platform (e.g., 微信开发者工具).
- **Build for production**: Use HBuilderX "发行" (Publish) menu.
- **No test runner**: `npm test` is not configured (echoes error).
- **Postinstall**: `pnpm install` triggers `weapp-tw patch` automatically.

**Important**: Do not attempt to run `npm run build` or similar — the build pipeline is HBuilderX + `@dcloudio/vite-plugin-uni`.

## High-Level Architecture

### Framework Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 + uni-app (Vite) |
| UI Library | uView Pro (`uni_modules/uview-pro`) |
| Cloud/Backend | VK UniCloud (`uni_modules/vk-unicloud`) — Aliyun serverless |
| Styling | TailwindCSS 3.4 + SCSS (`weapp-tailwindcss` for MP compatibility) |
| State | Vuex 4 with automatic `localStorage` persistence |
| Icons | Iconify (`@iconify/vue`) |
| Build | Vite + `@dcloudio/vite-plugin-uni` + `unplugin-auto-import` |

### Dual API Strategy

The project uses **two separate API systems** — this is critical to understand:

1. **VK Cloud Functions (Primary)** — For core business logic (DB operations, auth, QR generation).
   - Called via `vk.callFunction({ url: 'client/...', data: {} })`.
   - Routes through a single UniCloud cloud function named `router`.
   - Cloud function entry: `uniCloud-aliyun/cloudfunctions/router/index.js`.
   - Business logic lives in `router/service/client/pub_index.js`.
   - Database collections: `car-info`, `contact-history`.

2. **HTTP REST API (Secondary)** — For external integrations (openid, phone login, user info).
   - Base URL is hardcoded in `apis/http.api.js` (`https://travel.tasiai.cn/h5/api/...`).
   - Uses `uni.$u.http` (uView Pro's HTTP client).
   - Global `api` object is registered via `httpApi.install()` in `main.js`.
   - Interceptors in `apis/http.interceptor.js` inject `Authorization` from `uni_id_token` storage and handle business codes (`0`=fail, `1`/`200`=success, `401`=unauthorized).

### VK Framework Conventions

The VK framework (`vk-unicloud`) wraps many uni-app APIs. **Prefer VK wrappers over raw `uni.*` APIs** for consistency:

- Navigation: `vk.navigateTo`, `vk.redirectTo`, `vk.reLaunch`, `vk.switchTab`
- User feedback: `vk.toast`, `vk.showLoading`, `vk.hideLoading`, `vk.alert`
- Storage: `vk.setStorageSync`, `vk.getStorageSync`
- Vuex: `vk.vuex.set`, `vk.vuex.get`
- Auth: `vk.userCenter.login`, `vk.pubfn.checkLogin()`
- Cloud: `vk.callFunction`

**Important**: `vk.alert(content, title, confirmText, callback)` takes **separate string arguments**, NOT an object. Passing an object will display `JSON.stringify` output.

### Authentication & Token Check

Login and token validation are managed by VK via `app.config.js`:

- `checkTokenPages.mode: 2` means pages **outside** the `list` require login.
- Whitelist (no login required): `/pages/index/*`, `/pages/login/index`.
- **Must use `vk.navigateTo`** (not `uni.navigateTo`) for token check to work on navigation.
- Tabbar pages that require login must manually call `vk.pubfn.checkLogin()` in `onLoad`.
- Token key: `uni_id_token` (stored via `uni.setStorageSync`).

### State Management (Vuex)

Store modules in `store/modules/` are auto-discovered. The `updateStore` mutation supports dot-notation paths (e.g., `vk.vuex.set('$user.info.name', value)`).

All modules except `$error` are **automatically persisted** to `uni.getStorageSync('lifeData')`.

Key modules:
- `$user` — User info, permissions, invite code
- `$app` — App init state, network status
- `$tabbar` — Tabbar config (icons use Iconify names like `ri:home-smile-2-line`)

### Component Auto-Registration (easycom)

`pages.json` defines easycom patterns:

- `^yy-(.*)` → `@/components/yy-$1.vue` (project business components)
- `^u-(.*)` → `@/uni_modules/uview-pro/components/u-$1/u-$1.vue` (uView Pro components)

No manual import needed for components matching these patterns.

### Styling & Theming

- **TailwindCSS** is used with CSS variables for theming (`--color-primary`, etc.). Config in `tailwind.config.js`.
- **uView Pro theme**: `common/function/uview-pro.theme.js` defines theme colors. Default theme is `green`.
- **Mini Program dark mode**: `theme.json` defines light/dark color schemes for navigation bar, tabbar, background.
- `uni.scss` imports uView Pro theme SCSS and global fade transition styles.
- `weapp-tailwindcss` is disabled for H5 and App builds (`WeappTailwindcssDisabled = isH5 || isApp`).

### Important Files

| File | Purpose |
|------|---------|
| `main.js` | App bootstrap: uView Pro, VK, Vuex, HTTP API/interceptor |
| `app.config.js` | VK framework config: login URL, token check rules, error codes, share rules |
| `manifest.json` | uni-app manifest: appid, platform configs, MP-WEIXIN settings, permissions |
| `pages.json` | Page routes + easycom + globalStyle (navigationBar, background) |
| `vite.config.js` | Vite plugins: uni, auto-import, weapp-tailwindcss, code-inspector, auto-pages-json |
| `tailwind.config.js` | Tailwind with CSS variable theming |
| `theme.json` | MP light/dark mode color definitions |

### Page Structure

| Path | Purpose |
|------|---------|
| `pages/index/index` | Home / main entry |
| `pages/index/contact` | Contact car owner (by plate or scan) |
| `pages/my/index` | Profile tab |
| `pages/my/qrcode` | My move-car QR code (generate & save poster) |
| `pages/my/contact-history` | Contact history list |
| `pages/login/index` | Login page |
| `pages/error/404` | Not found |

### Cloud Function Structure

All backend logic routes through one cloud function `router`:

```
uniCloud-aliyun/cloudfunctions/router/
├── index.js              # Entry
├── config.js
├── service/client/
│   └── pub_index.js      # Main business logic (car-info, contact-history, QR generation)
├── middleware/modules/   # Filters: login, encrypt, error, returnUserInfo
├── dao/modules/          # carDao, userDao
└── util/
```

Key cloud operations: `getOwnerByPlate`, `getOwnerByScan`, `saveCarInfo`, `sendMoveCarNotify`, `generateMoveCarQRCode`, `addContactHistory`.

### Environment Variables

- `.env.development`: `VITE_API_BASE_URL=http://120.53.10.90:8963`
- `.env.production`: `VITE_API_BASE_URL=https://api.manpsychology.com`

These are Vite env vars and only affect the HTTP REST API base, not VK cloud functions.
