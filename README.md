# SProject Frontend

Multi-role catering management UI for Deras (Admin, Client, Chef, Driver, Distributor). Built with Next.js 15 (App Router), React 19, TypeScript, and MUI 7.

## Quick Start

- Requirements
  - Node.js 18+ (LTS recommended)
  - npm 9+
- Setup
  - `npm install`
  - Create `.env.local` in the project root (see Environment Variables)
  - Run `npm run dev` and open `http://localhost:3000`

## Tech Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- MUI 7 + Emotion (`@mui/material-nextjs` integration)
- Axios (typed API client)
- Recharts (charts) and `@mui/x-date-pickers`

## Environment Variables

Create `.env.local` in the root with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_TELEMETRY_DISABLED=1

# Optional development/build optimizations
NODE_OPTIONS=--max-old-space-size=4096
WATCHPACK_POLLING=false
```

- `NEXT_PUBLIC_API_BASE_URL`: Backend REST API base URL (required)
- `NEXT_TELEMETRY_DISABLED`: Disables Next.js telemetry (optional)
- `NODE_OPTIONS`, `WATCHPACK_POLLING`: Build/watch optimizations (optional)

## Scripts

- `npm run dev`: Start the dev server
- `npm run build`: Production build
- `npm run start`: Run production server
- `npm run lint`: Run ESLint
- Type check (optional): `npx tsc --noEmit`

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

- Theme: `src/theme/theme.ts`
  - Primary: `#000000`
  - Secondary: `#C9A227`
  - Rounded corners (`borderRadius: 16`) and a clean, premium look
- Global styles: `src/app/globals.css` (CSS variables, inputs, animations)
- Images: Next Image is configured for Cloudinary in `next.config.ts`

Note: Tailwind CSS v4 PostCSS plugin is configured, but the primary UI is built with MUI. Utility classes can be introduced if desired.

## API Layer

- Core client: `src/services/apiClient.ts`
  - Uses `NEXT_PUBLIC_API_BASE_URL`
  - Request interceptor adds `Authorization: Bearer <token>` from `localStorage`
  - Adds an idempotency key for write operations (POST/PUT/PATCH/DELETE)
  - Normalizes success envelopes: if `{ success, data, meta }`, returns inner `data`, or `{ data, pagination }` when pagination exists
  - Emits global events on errors:
    - Critical: `critical-api-error` (full-page error)
    - Notification: `notification-api-error` (toast)
- Feature services: e.g., `catalogService.ts`, `authService.ts`, `orderService.ts`, `adminService.ts`
- See `API.md` for endpoint details

## Authentication & Roles

- Auth context: `src/context/AuthContext.tsx` — JWT stored in `localStorage` (`token`), user decoded from the token
- On 401 (Unauthorized), clears session and redirects to `/login?reason=session_expired`
- Navigation adapts by role (ADMIN, CLIENT, CHEF, DRIVER, DISTRIBUTOR) via the dynamic `Sidebar`

## Error Handling & Notifications

- Global events are handled by `GlobalEventHandler` and `NotificationHandler`
  - `critical-api-error` → full-screen error with retry
  - `notification-api-error` → toast notifications
- Toast provider: `src/components/ui/ToastProvider.tsx`

## Development Notes

- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`
- Common issues
  - 401/expired token → redirected to `/login`
  - Network/CORS issues trigger a global critical error event

## Build & Deploy

- Build: `npm run build`
- Start: `npm run start`
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the correct backend in production

## License

Private repository — internal use only.
