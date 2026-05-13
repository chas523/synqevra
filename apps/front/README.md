# Frontend

Frontend is a **Next.js 15** app (App Router, Turbopack) running on port `3000`. It uses **Tailwind v4**, **shadcn**, and **Redux** for global state. All backend communication goes through our API at port `3003` — the frontend never talks to ThingsBoard or Medplum directly.



## Architecture

### Atomic Design

Components are organized following **Atomic Design methodology**. The `components/` folder is split into five levels:

- `atoms/` — `Label`, `Input`, etc. 
- `molecules/` — `FormField`, `GoogleSignInButton`, `TimeWindowPicker`. They're used to build organisms.
- `organisms/` — sections of the UI. Things like `LoginForm`, `AppSidebar`, `AddDeviceDialog`.
- `pages/` — full page components that compose organisms together. `TenantsListPage`, `DevicePage`, `PatientsPage`, `SettingsPage`, `RuleChainsPage`, etc. These are what the Next.js route files (`app/*/page.tsx`) render.
- `templates/` — reusable layout wrappers. The most important one is **`EntityDetailPanel`** (more on this below).

There's also a `ui/` folder with shadcn components inside.

### Data Flow: Component -> Hook -> Service

This is the pattern used  in the app for talking to the backend. It's a three-layer chain:

**1. Service** (in `lib/services/`) — a plain class with **static methods** that call the backend API using the shared `proxyApi` axios instance. 
```typescript
export class DeviceService {
  public static async fetchDevices(page = 0, pageSize = 10): Promise<DevicesResponse> {
    const { data } = await proxyApi.get(`/thingsboard/devices?page=${page}&pageSize=${pageSize}`);
    return data;
  }

  public static async createDevice(payload: CreateDeviceRequest): Promise<Device> {
    const { data } = await proxyApi.post("/thingsboard/devices", payload);
    return data;
  }
}
```

**2. Hook** (in `hooks/`) — wraps a service method and adds React state: loading, error, the returned data, and a `refresh`/`mutate` function. Depending on the operation there are two shapes:

For **reads** — the hook uses **SWR** to handle caching, revalidation, etc.:

```typescript
export function useDevices(page = 0, pageSize = 5) {
  const { data, error, isLoading, mutate } = useSWR<DevicesResponse>(
    `devices-${page}-${pageSize}`,
    //here we call the service method
    () => DeviceService.fetchDevices(page, pageSize),
  );

  return { devices: data?.data || [], error, isLoading, refresh: mutate };
}
```

For **writes** (create, update, delete) — the hook uses `useState` hook for loading/error tracking:

```typescript
export const useCreateDevice = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createDevice = async (deviceData: CreateDeviceRequest) => {
    setLoading(true);
    setError(null);
    try {
      //here we call the service method
      return await DeviceService.createDevice(deviceData);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createDevice, loading, error };
};
```

**3. Component** — calls the hook and uses the returned values to render. The component doesn't touch axios or the service directly.

### API Client (`lib/api/api.ts`)

All HTTP calls go through a single `proxyApi` axios instance configured with:
- Base URL of `/api` (proxied to port `3003` by Next.js)
- Credentials included (cookies with auth and refresh token for JWT auth)
- Automatic token refresh: if a request gets a `401`, the interceptor calls `POST /auth/refresh` and retries the original request. If the refresh also fails, it redirects to `/auth/login` (this logic is in `lib/api/api.ts`).

### State Management

We use one state management library. It's used only to provide hooks to get user information inside different components.

- **Redux Toolkit** — used only for user session state. There's a single `userSlice` that stores the current user info (name, role, email). It's fetched once on login via `fetchUserInformations` thunk and cleared on logout.

### Middleware (Route Protection)

`middleware.ts` runs on every request and handles auth-based routing:
- If you're logged (if there's an access_token cookie) in and try to visit `/auth/login` — you get redirected to `/dashboards`.
- If you're not logged in and try to visit any protected page — you get redirected to `/auth/login` with a `?from=` query param so you can be bounced back after login (this function is not currently implemented).
- Public-asset proxied paths (`/public-assets/`, `/tb-assets/`) are always allowed through (these serve whitelabel assets from MinIO).

### Theming & Whitelabeling

The app has two themes: **dark** and **light** (toggled via `next-themes`). Dark theme has a fixed look and is not affected by whitelabeling at all.

**Whitelabeling only changes the light theme.** The SysAdmin can configure it at two levels:

- **Global** — applies to all tenants by default. Configured in the System Settings page (`GlobalWhitelabelForm`). The uploaded logo files and a CSS file are saved to MinIO under `/public-assets/global/`.
- **Per-tenant** — overrides the global branding for a specific tenant. Configured in the tenant's detail panel (the "Whitelabel" tab in `TenantDetailPanel`). Uploaded logos are saved to MinIO under `/public-assets/{tenantId}/`.

**What gets changed:**

1. **Logo** — the sidebar logo is loaded from MinIO with a fallback chain: first it tries the tenant-specific logo (`/public-assets/{tenantId}/logo-*.svg`), if that fails it tries the global logo (`/public-assets/global/logo-*.svg`), and if both fail it falls back to the static logos bundled with the app. This happens in `AppSidebar.tsx`.
2. **Light theme colors** — the root layout (`layout.tsx`) includes a `<link>` tag pointing to `/public-assets/global/light-colors.css`. This CSS file overrides the CSS variables prefixed with `--wl-light-shell-*` that control the sidebar gradients, background blobs, and grid overlays in light mode. The `WhitelabelLightColorsLoader` component handles fetching the current version from MinIO and updates the stylesheet when the SysAdmin uploads a new one.

Both logos and CSS use a versioning mechanism (`version.json` / `css-version.json` files in MinIO) so that changes are picked up immediately without a hard refresh. When the SysAdmin uploads new assets, a `CustomEvent` is dispatched and the relevant components re-render with the new version.

### Form Validation

Forms use **react-hook-form** with **Zod** schemas. Validation schemas live in `lib/schemas/` — things like `activationZodSchema` (initial form for account activation), `securitySettingsZodSchema` (form for security settings page), `practitionerZodSchema` (form for practitioner page).

### Real-time Telemetry

`TelemetryContext` (in `lib/context/`) manages a WebSocket connection (via `socket.io-client`) for live sysadmin dashboard telemetry. Plus for notifications button.  It handles reconnection on route changes (especially after login) and provides a React context so any component can subscribe to real-time data.
Specifictially it's used to:
- Get the number of dashboards, assets, devices, customers.
- Get the CPU, RAM and Disk usage of the server in the real time (display on hourly chart in Sysadmin Dashboard)
- Display transmitted message count in all system (number of messages that rulechain have processed grouped daily displayed in monthly chart in Sysadmin Dashboard) 



## Key Reusable Components

### `EntityDetailPanel` (template)

The single most reused component in the entire codebase. It's a side panel that opens when you click a row in any table. Used for: devices, assets, tenants, tenant profiles, device profiles, dashboards, rule chains, entity views, customers, OTA packages, OAuth2 clients, resources, JavaScript library resources, and rule chain node configs.

You pass it a title, a list of `TabConfig` objects (each with an id, label, and content), and optional action buttons. It handles tab navigation and horizontal scroll for tabs with overflow. Every entity-specific detail panel (`DeviceDetailPanel`, `TenantDetailPanel`, etc.) is just a wrapper that defines the tabs and feeds data into `EntityDetailPanel`.

### `DataTable` (molecule)

A generic table component used across all list views. Handles column definitions, row rendering, sorting, and selection. Paired with `DataTablePagination` for paged navigation.

### `SidebarLayout` (organism)

The root layout for all authenticated pages. Contains the collapsible sidebar (`AppSidebar`), top header bar with user info, notification button, theme toggle, and logout. Decides whether to render the public landing header or the full sidebar layout based on the current route.

And a couple more but the ones listed above are the most important ones to understand the codebase.


## Directory Overview

For you to get clear view of the codebase structure:
```
apps/front/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Redux StoreProvider, ThemeProvider, SidebarLayout)
│   ├── auth/               # Login, registration, activation pages
│   ├── devices/            # Device list and detail pages
│   ├── dashboards/         # Dashboard list and detail pages (iframe embedding)
│   ├── entities/           # Assets, customers, entity views, device profiles, etc.
│   ├── patients/           # Medplum patients (list, add form, and detailed view).
│   ├── practitioners/      # Medplum practitioners (list, add form).
│   ├── rulechains/         # Rule chain list and visual editor 
│   ├── settings/           # Admin settings (general, mail, security, notifications)
│   ├── security/           # OAuth2 and security configuration
│   └── ...
│
├── components/
│   ├── atoms/              
│   ├── molecules/          
│   ├── organisms/          
│   ├── pages/              
│   ├── templates/          
│   └── ui/                 
│
├── hooks/                  
│   ├── auth/
│   ├── connection/
│   ├── device/
│   ├── medplum/
│   └── thingsboard/        
│
├── lib/
│   ├── api/                # Axios instance with interceptors
│   ├── services/           # Static service classes (HTTP calls)
│   ├── redux/              # Redux store + userSlice
│   ├── schemas/            # Zod validation schemas
│   ├── context/            # TelemetryContext (WebSocket)
│   ├── constants/          # App-wide constants
│   └── types/              # Types
│
├── types/                  # Types
├── context/                # WidgetEditorContext
├── middleware.ts           # Route protection (auth redirects)
├── theme.css               # CSS variables for theming
└── package.json
```
Types should me merged into 1 file.
The same with context.

### Important Note

Apart from TailwindCSS we're using Mantine UI library for styling medplum originated components (the one from Medplum/React library) - for example Patient creation form (in our project it's `AddPatientForm`, and `ResourceForm` inside). Those were used to sped up development process. 

To render them properly we had to install Mantine provider. So the app uses 2 providers for styling and theming. Those were in conflict with each other (for example in breakpoint configuration). We've fixed it by defining custom breakpoints for Mantine provider in `theme.js` file. It's not recommended to use Mantine UI library unless you wan't to reuse more components from Medplum/React library.