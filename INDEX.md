# Project Index — Medicine Tracker Frontend

A complete, navigable index of this codebase: structure, routing, features, services, state, types, config, and key dependencies.

Repository: medicine-tracker-frontend
Build tool: Vite (rolldown-vite@7.2.2)
Language: TypeScript + React 19
UI: MUI 7
Routing: React Router 7
Data: TanStack Query 5
State: Zustand 5
HTTP: Axios

--------------------------------------------------------------------------------
1) Top-level File Tree
--------------------------------------------------------------------------------
.
├─ .env
├─ .env.example
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ public/
│  └─ vite.svg
└─ src/
   ├─ App.css
   ├─ index.css
   ├─ main.tsx
   ├─ App.tsx
   ├─ theme.ts
   ├─ assets/
   │  └─ react.svg
   ├─ components/
   │  ├─ AppShell.tsx
   │  └─ ConfirmDialog.tsx
   ├─ routes/
   │  └─ ProtectedRoute.tsx
   ├─ services/
   │  ├─ axiosClient.ts
   │  ├─ auth.ts
   │  ├─ medicines.ts
   │  ├─ profiles.ts
   │  ├─ schedules.ts
   │  └─ globalMedicines.ts
   ├─ store/
   │  └─ authStore.ts
   ├─ types/
   │  ├─ api.ts
   │  └─ auth.ts
   └─ features/
      ├─ auth/
      │  ├─ LoginPage.tsx
      │  └─ RegisterPage.tsx
      ├─ dashboard/
      │  └─ DashboardPage.tsx
      ├─ medicines/
      │  ├─ MedicineFormDialog.tsx
      │  ├─ MedicineEditDialog.tsx
      │  └─ pages/
      │     ├─ MedicinesListPage.tsx
      │     └─ ProfileMedicinesListPage.tsx
      ├─ profiles/
      │  ├─ ProfileFormDialog.tsx
      │  └─ ProfilesListPage.tsx
      └─ schedules/
         ├─ ScheduleFormDialog.tsx
         └─ SchedulesListPage.tsx

--------------------------------------------------------------------------------
2) Package Metadata
--------------------------------------------------------------------------------
name: medicine-tracker-frontend
version: 0.0.0
type: module

Scripts:
- dev: vite
- build: tsc -b && vite build
- lint: eslint .
- preview: vite preview

Dependencies:
- react, react-dom: ^19.2.0
- react-router-dom: ^7.9.6
- @mui/material: ^7.3.5, @mui/icons-material: ^7.3.5
- @emotion/react, @emotion/styled
- @tanstack/react-query: ^5.90.8
- axios: ^1.13.2
- zustand: ^5.0.8

Dev Dependencies:
- vite: npm:rolldown-vite@7.2.2 (overridden)
- @vitejs/plugin-react
- typescript ~5.9.3
- eslint 9, @eslint/js, typescript-eslint, react-refresh plugin, react-hooks plugin
- @types/node, @types/react, @types/react-dom

--------------------------------------------------------------------------------
3) Build & Configuration
--------------------------------------------------------------------------------
Vite (vite.config.ts):
- Plugins: @vitejs/plugin-react
- Standard Vite config scaffold

TypeScript:
- tsconfig.json: references tsconfig.app.json and tsconfig.node.json
- tsconfig.app.json:
  - target: ES2022, module: ESNext
  - strict: true; noUnusedLocals/Parameters; noUncheckedSideEffectImports
  - jsx: react-jsx
  - moduleResolution: bundler; noEmit
  - include: src

ESLint (eslint.config.js):
- Flat config
- Extends:
  - @eslint/js recommended
  - typescript-eslint recommended
  - eslint-plugin-react-hooks (flat) recommended
  - eslint-plugin-react-refresh vite
- Ignores: dist
- Browser globals

Environment (.env.example):
- VITE_API_BASE_URL=http://localhost:8080 (no trailing slash)
- Optional VITE_APP_NAME

--------------------------------------------------------------------------------
4) Application Entry & Providers
--------------------------------------------------------------------------------
index.html
- Root container: <div id="root"></div>
- Entry: /src/main.tsx

src/main.tsx
- Providers:
  - StrictMode
  - TanStack Query: QueryClientProvider (refetchOnWindowFocus: false)
  - MUI: ThemeProvider + CssBaseline using src/theme.ts
  - Router: BrowserRouter
- Renders <App />

src/theme.ts
- MUI theme customization:
  - mode: light
  - primary: #1976d2, secondary: #7c3aed
  - background default: #f5f7fb
  - shape.borderRadius: 12
  - typography: Inter-like stack, bold headings
  - Components overrides: CssBaseline, Paper borders, AppBar elevation, Button radius
- Export: responsiveFontSizes(baseTheme)

--------------------------------------------------------------------------------
5) Routing Map and Navigation
--------------------------------------------------------------------------------
src/App.tsx
- Public:
  - /login → <LoginPage />
  - /register → <RegisterPage />
- Root redirect:
  - / → Navigate to /app/dashboard
- Protected (via <ProtectedRoute />) nesting:
  - /app → <AppShell />
    - index → Navigate to dashboard
    - /app/dashboard → <DashboardPage />
    - /app/medicines → <MedicinesListPage />
    - /app/profiles → <ProfilesListPage />
    - /app/profiles/:profileId/medicines → <ProfileMedicinesListPage />
    - /app/medicines/:medicineId/schedules → <SchedulesListPage />
- Fallback:
  - * → Navigate to /app/dashboard

src/routes/ProtectedRoute.tsx
- Reads auth state from Zustand store
- If not authenticated: Navigate to /login with { from: location }
- Else: renders <Outlet />

Layout & Navigation (src/components/AppShell.tsx)
- AppBar with title and desktop nav buttons (Dashboard, Medicines, Profiles, Logout)
- Mobile Drawer with same links and Logout
- <Outlet /> renders child routes within a Container

--------------------------------------------------------------------------------
6) Features by Domain
--------------------------------------------------------------------------------
Auth (src/features/auth)
- LoginPage.tsx
  - Email/password form, Remember me
  - login() service; on success sets email in store, refreshes auth, navigates to previous route or /app/dashboard
- RegisterPage.tsx
  - Email/password/confirm form
  - register() service; on success sets email, refreshes auth, navigates /app/dashboard

Dashboard (src/features/dashboard)
- DashboardPage.tsx
  - Fetches backend health via useQuery(['health'], getHealth)
  - Displays status/version/timestamp; Refresh button

Profiles (src/features/profiles)
- ProfilesListPage.tsx
  - useQuery(['profiles'], getProfiles)
  - CRUD via createProfile/updateProfile/deleteProfile mutations
  - ProfileFormDialog for create/edit
  - ConfirmDialog for deletion
  - Grid of profile cards; Open navigates to /app/profiles/:id/medicines
- ProfileFormDialog.tsx
  - Controlled dialog for name editing with validation

Medicines (src/features/medicines)
- MedicinesListPage.tsx
  - useQuery(['medicines'], getAllMedicines)
  - Search filter, tabular list with ExpiryChip and low-quantity hint
- ProfileMedicinesListPage.tsx
  - useParams profileId
  - useQuery(['profile', profileId], getProfileById)
  - useQuery(['medicines', profileId], getMedicinesForProfile)
  - takeDose mutation (takeDose(profileId, id)) with pending state per row; delete uses deleteMedicine(profileId, id)
  - Breadcrumbs; Add medicine opens MedicineFormDialog
- MedicineFormDialog.tsx
  - Controlled form for createMedicine(profileId, payload)
  - Optional image upload via uploadMedicineImage(file)
  - On success invalidates ['medicines', profileId]

Schedules (src/features/schedules)
- SchedulesListPage.tsx
  - useParams medicineId
  - useQuery(['medicine', medicineId], getMedicineById)
  - useQuery(['schedules', medicineId], getSchedulesForMedicine)
  - CRUD via createSchedule/updateSchedule/deleteSchedule mutations
  - ScheduleFormDialog for create/edit; ConfirmDialog for delete
  - Breadcrumbs linking back to profile medicines when profileId is known
- ScheduleFormDialog.tsx
  - Validates timeOfDay as HH:mm:ss, frequency select, Active toggle

--------------------------------------------------------------------------------
7) Shared Components
--------------------------------------------------------------------------------
src/components/AppShell.tsx
- Layout wrapper with AppBar/Desktop nav/Mobile drawer, renders <Outlet />

src/components/ConfirmDialog.tsx
- Reusable confirm dialog with customizable labels, color, and loading state

--------------------------------------------------------------------------------
8) Services (API layer)
--------------------------------------------------------------------------------
src/services/axiosClient.ts
- Base URL: import.meta.env.VITE_API_BASE_URL (no trailing slash), default http://localhost:8080
- Attaches Authorization: Bearer <token> if present in localStorage/sessionStorage
- 401 interceptor clears tokens, allows ProtectedRoute to redirect on next render

src/services/auth.ts
- Types: AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest
- Token storage: storeToken(token, remember) into localStorage/sessionStorage
- Endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/forgot-password (auto-login per blueprint)
  - POST /api/users/fcm-token
  - GET  / (health)
- clearStoredToken(), logout()

src/services/profiles.ts
- GET  /api/profiles
- GET  /api/profiles/{profileId}
- POST /api/profiles
- PUT  /api/profiles/{profileId}
- DELETE /api/profiles/{profileId}

src/services/medicines.ts
- Types: MedicineCreateRequest, MedicineUpdateRequest
- GET  /api/medicines
- GET  /api/profiles/{profileId}/medicines
- GET  /api/medicines/{id}
- POST /api/profiles/{profileId}/medicines
- PUT  /api/profiles/{profileId}/medicines/{id}
- DELETE /api/profiles/{profileId}/medicines/{id}
- POST /api/profiles/{profileId}/medicines/{id}/takedose
- POST /api/medicines/upload-image (multipart) → returns raw string (imageUrl)

src/services/schedules.ts
- Types: ScheduleCreateRequest, ScheduleUpdateRequest
- POST /api/medicines/{medicineId}/schedules
- GET  /api/medicines/{medicineId}/schedules
- GET  /api/profiles/{profileId}/schedules
- GET  /api/schedules
- GET  /api/schedules/{scheduleId}
- PUT  /api/schedules/{scheduleId}
- DELETE /api/schedules/{scheduleId}

src/services/globalMedicines.ts
- CRUD + search endpoints for global medicines catalog

--------------------------------------------------------------------------------
9) State Management
--------------------------------------------------------------------------------
src/store/authStore.ts (Zustand)
- State: email: string | null; isAuthenticated: boolean
- Actions:
  - setEmail(email)
  - refreshAuth() → recompute isAuthenticated from stored tokens
  - logout() → clearStoredToken() + reset state
- Token detection checks both localStorage and sessionStorage for jwt_token/token

--------------------------------------------------------------------------------
10) Types (Domain models)
--------------------------------------------------------------------------------
src/types/auth.ts
- AuthResponse: { token, email }
- LoginRequest, RegisterRequest
- ForgotPasswordRequest: { email, newPassword }

src/types/api.ts
- Composition: { name, strengthValue, strengthUnit }
- Medicine: includes id, userId, profileId, name, dosage, quantity, expiryDate, status, timestamps, etc.
- Profile: { id, userId, name, createdAt }
- Schedule: { id, medicineId, profileId, userId, timeOfDay, frequency, isActive, createdAt }
- GlobalMedicine: catalog fields with metadata

--------------------------------------------------------------------------------
11) Data Fetching (TanStack Query)
--------------------------------------------------------------------------------
Query keys used:
- ['health']
- ['profiles']
- ['profile', profileId]
- ['medicines']
- ['medicines', profileId]
- ['medicine', medicineId]
- ['schedules', medicineId]

Patterns:
- Refetch buttons using refetch() with disabled={isFetching}
- Mutations invalidate relevant list keys on success
- Loading and error states wired to MUI components

--------------------------------------------------------------------------------
12) Authentication Flow
--------------------------------------------------------------------------------
- On successful login/register/forgot-password:
  - Token stored in localStorage or sessionStorage based on remember flag
  - Axios client attaches Authorization header automatically
  - authStore.refreshAuth() toggles isAuthenticated
- ProtectedRoute guards all /app routes, redirecting to /login when unauthenticated
- axios 401 interceptor clears tokens; route guard will redirect on next render

--------------------------------------------------------------------------------
13) Navigation Surfaces
--------------------------------------------------------------------------------
- Desktop AppBar links (AppShell): /app/dashboard, /app/medicines, /app/profiles, Logout
- Mobile Drawer with identical links + logout
- Breadcrumbs in profile/medicine schedule pages for hierarchical navigation

--------------------------------------------------------------------------------
14) Environment
--------------------------------------------------------------------------------
- VITE_API_BASE_URL (no trailing slash), defaults to http://localhost:8080 when missing
- Optional VITE_APP_NAME (declared but not referenced yet in code)

--------------------------------------------------------------------------------
15) Import Relationships (Condensed)
--------------------------------------------------------------------------------
- main.tsx → App, theme, providers (React Query, Router, MUI)
- App.tsx → ProtectedRoute, AppShell, all page components
- AppShell → authStore (logout), react-router links, MUI UI elements
- ProtectedRoute → authStore.isAuthenticated
- Pages → services via axiosClient, types, dialogs, ConfirmDialog
- Dialogs → mutations (create/update/delete), invalidate query keys
- services/* → axiosClient base + endpoints
- axiosClient → import.meta.env.VITE_API_BASE_URL, token attachments
- store/authStore → services/auth.clearStoredToken

--------------------------------------------------------------------------------
16) Useful Cross-references
--------------------------------------------------------------------------------
- Entry: src/main.tsx
- Route config: src/App.tsx
- ProtectedRoute: src/routes/ProtectedRoute.tsx
- Layout: src/components/AppShell.tsx
- Theme: src/theme.ts
- Styles: src/App.css, src/index.css
- Pages:
  - Auth: src/features/auth/LoginPage.tsx, RegisterPage.tsx
  - Dashboard: src/features/dashboard/DashboardPage.tsx
  - Profiles: src/features/profiles/ProfilesListPage.tsx
  - Medicines:
    - All: src/features/medicines/pages/MedicinesListPage.tsx
    - Per profile: src/features/medicines/pages/ProfileMedicinesListPage.tsx
  - Schedules (per medicine): src/features/schedules/SchedulesListPage.tsx
- Dialogs:
  - Profiles: src/features/profiles/ProfileFormDialog.tsx
  - Medicines: src/features/medicines/MedicineFormDialog.tsx, src/features/medicines/MedicineEditDialog.tsx
  - Schedules: src/features/schedules/ScheduleFormDialog.tsx
  - Confirm: src/components/ConfirmDialog.tsx
- Services:
  - Auth: src/services/auth.ts
  - Profiles: src/services/profiles.ts
  - Medicines: src/services/medicines.ts
  - Schedules: src/services/schedules.ts
  - Global meds: src/services/globalMedicines.ts
  - Axios client: src/services/axiosClient.ts
- State: src/store/authStore.ts
- Types: src/types/auth.ts, src/types/api.ts
- Config: eslint.config.js, tsconfig*.json, vite.config.ts
- Env: .env.example

--------------------------------------------------------------------------------
17) Operational Notes
--------------------------------------------------------------------------------
- Development: npm run dev (http://localhost:5173)
- Build: npm run build (type-check + bundle)
- Preview: npm run preview
- API base defaults to http://localhost:8080, ensure backend CORS allows Vite origin
- Image upload endpoint returns a raw string body; axios transformResponse disabled to consume as-is

--------------------------------------------------------------------------------
18) Gaps / Future Enhancements (from README and patterns)
--------------------------------------------------------------------------------
- Add forgot password UI route (/forgot-password) to match LoginPage link
- Expand global medicines UI using services/globalMedicines.ts
- Pagination and advanced error handling on list pages
- Push notifications (FCM token update endpoint exists)
- Centralized query keys/enums for consistency
- Extract date/time and chip helpers into shared utilities
