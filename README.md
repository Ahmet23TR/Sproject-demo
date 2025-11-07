# SProject Frontend

Multi-role catering management UI for Deras (Admin, Client, Chef, Driver, Distributor). Built with Next.js 15 (App Router), React 19, TypeScript, and MUI 7.

## Quick Start

-   Requirements
    -   Node.js 18+ (LTS recommended)
    -   npm 9+
-   Setup
    -   `npm install`
    -   Create `.env.local` in the project root (see Environment Variables)
    -   Run `npm run dev` and open `http://localhost:3000`

### Demo Mode (backend-free)

The repository ships with a full-featured mock backend so you can explore every role without connecting to the live API. Mock mode is **enabled by default** (`NEXT_PUBLIC_USE_MOCK_DATA` defaults to `true`). Generated demo JWTs keep AuthContext behaviour unchanged.

**🎉 Welcome Guide**: When you first open the demo, a welcome modal will automatically appear, explaining all features and providing a quick guide to navigating the platform. You can reopen this guide anytime by clicking the blue info button (ℹ️) in the bottom-left corner.

**Quick Role Switching**: In demo mode, you'll see a sticky dropdown in the top-right corner of all pages. Click it to instantly switch between different user roles without logging out. Perfect for exploring the full platform! You can also drag it anywhere on the screen and minimize it when not needed.

| Role             | Email                        | Password  |
| ---------------- | ---------------------------- | --------- |
| Admin            | `admin@sproject.demo`        | `demo123` |
| Client (Palm)    | `lina@palmbistro.demo`       | `demo123` |
| Client (Sunrise) | `omar@sunrisecatering.demo`  | `demo123` |
| Chef (Sweets)    | `chef.selim@sproject.demo`   | `demo123` |
| Driver           | `driver.yusuf@sproject.demo` | `demo123` |
| Distributor      | `nadia@coastaldist.demo`     | `demo123` |

All dashboards (admin, chef, driver, distributor, client) are hydrated with rich fake data: production queues, driver pools, analytics, pricing, cart/favorites, etc.

To reconnect to the real backend later, set `NEXT_PUBLIC_USE_MOCK_DATA=false` and provide `NEXT_PUBLIC_API_BASE_URL` pointing to your API.

## Tech Stack

-   Next.js 15 (App Router)
-   React 19 + TypeScript
-   MUI 7 + Emotion (`@mui/material-nextjs` integration)
-   Axios (typed API client)
-   Recharts (charts) and `@mui/x-date-pickers`

## Environment Variables

Create `.env.local` in the root with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_TELEMETRY_DISABLED=1

# Optional development/build optimizations
NODE_OPTIONS=--max-old-space-size=4096
WATCHPACK_POLLING=false
```

-   `NEXT_PUBLIC_API_BASE_URL`: Backend REST API base URL (required when mock mode is disabled)
-   `NEXT_PUBLIC_USE_MOCK_DATA`: `true` to run the self-contained mock backend (default), `false` to call the live API
-   `NEXT_TELEMETRY_DISABLED`: Disables Next.js telemetry (optional)
-   `NODE_OPTIONS`, `WATCHPACK_POLLING`: Build/watch optimizations (optional)

## Scripts

-   `npm run dev`: Start the dev server
-   `npm run build`: Production build
-   `npm run start`: Run production server
-   `npm run lint`: Run ESLint
-   Type check (optional): `npx tsc --noEmit`

## Project Structure

```
src/
├─ app/              # Next.js App Router routes
│  ├─ admin/         # Admin screens (dashboard, pricing, reports…)
│  ├─ chef/          # Kitchen / production
│  ├─ client/        # Client area (orders, history…)
│  ├─ driver/        # Driver / delivery
│  ├─ distributor/   # Distributor-specific flows
│  ├─ login/         # Authentication
│  └─ register/      # Registration
├─ components/       # UI components (layout, toast, overlays…)
├─ context/          # React context (Auth, Cart, Loading, Error, Notification)
├─ hooks/            # Custom hooks
├─ services/         # API services (axios-based)
├─ theme/            # MUI theme + Emotion setup
├─ types/            # TypeScript types
└─ utils/            # Utilities
```

## UI & Theming

-   Theme: `src/theme/theme.ts`
    -   Primary: `#000000`
    -   Secondary: `#C9A227`
    -   Rounded corners (`borderRadius: 16`) and a clean, premium look
-   Global styles: `src/app/globals.css` (CSS variables, inputs, animations)
-   Images: Next Image is configured for Cloudinary in `next.config.ts`

Note: Tailwind CSS v4 PostCSS plugin is configured, but the primary UI is built with MUI. Utility classes can be introduced if desired.

## API Layer

-   Core client: `src/services/apiClient.ts`
    -   Uses `NEXT_PUBLIC_API_BASE_URL`
    -   Request interceptor adds `Authorization: Bearer <token>` from `localStorage`
    -   Adds an idempotency key for write operations (POST/PUT/PATCH/DELETE)
    -   Normalizes success envelopes: if `{ success, data, meta }`, returns inner `data`, or `{ data, pagination }` when pagination exists
    -   Emits global events on errors:
        -   Critical: `critical-api-error` (full-page error)
        -   Notification: `notification-api-error` (toast)
-   Feature services: e.g., `catalogService.ts`, `authService.ts`, `orderService.ts`, `adminService.ts`
-   See `API.md` for endpoint details

## Authentication & Roles

-   Auth context: `src/context/AuthContext.tsx` — JWT stored in `localStorage` (`token`), user decoded from the token
-   On 401 (Unauthorized), clears session and redirects to `/login?reason=session_expired`
-   Navigation adapts by role (ADMIN, CLIENT, CHEF, DRIVER, DISTRIBUTOR) via the dynamic `Sidebar`

## Error Handling & Notifications

-   Global events are handled by `GlobalEventHandler` and `NotificationHandler`
    -   `critical-api-error` → full-screen error with retry
    -   `notification-api-error` → toast notifications
-   Toast provider: `src/components/ui/ToastProvider.tsx`

## Development Notes

-   Lint: `npm run lint`
-   Type check: `npx tsc --noEmit`
-   Common issues
    -   401/expired token → redirected to `/login`
    -   Network/CORS issues trigger a global critical error event

## Build & Deploy

-   Build: `npm run build`
-   Start: `npm run start`
-   Ensure `NEXT_PUBLIC_API_BASE_URL` points to the correct backend in production

## License

Private repository — internal use only.
