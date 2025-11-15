# Project Index — Medicine Tracker Frontend

A complete, navigable index of this codebase: structure, routing, features, services, state, types, config, and key dependencies. This document reflects the current repository state and code behaviors verified from source.

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
      │  ├─ RegisterPage.tsx
      │  └─ ForgotPasswordPage.tsx
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
  - /forgot-password → <ForgotPasswordPage />
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
- If not authenticated: Navigate to /login with { from: location, message: "Please sign in to continue." }
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
  - Displays session-expired warning when URL contains ?msg=session_expired
- RegisterPage.tsx
  - Email/password/confirm form
  - register() service; on success sets email, refreshes auth, navigates /app/dashboard
- ForgotPasswordPage.tsx
  - Email + new password + confirm; basic validations
  - forgotPassword() service; on success navigates to /login with success message (no auto-login)

Dashboard (src/features/dashboard)
- DashboardPage.tsx
  - Fetches backend health via useQuery(['health'], getHealth) and displays status/version/timestamp; Refresh button

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
  - Breadcrumbs; Add/Edit medicine via dialogs, Delete confirmation
- MedicineFormDialog.tsx
  - Controlled form for createMedicine(profileId, payload); optional image upload via uploadMedicineImage(file)
  - On success invalidates ['medicines', profileId]
- MedicineEditDialog.tsx
  - Controlled edit form for updateMedicine(profileId, id, payload); optional image upload
  - On success invalidates ['medicines', profileId]

Schedules (src/features/schedules)
- SchedulesListPage.tsx
  - useParams medicineId
  - useQuery(['medicine', medicineId], getMedicineById)
  - useQuery(['schedules', medicineId], getSchedulesForMedicine)
  - CRUD via createSchedule/updateSchedule/deleteSchedule mutations
  - ScheduleFormDialog for create/edit; ConfirmDialog for delete
  - Breadcrumbs linking back to relevant profile medicines when profileId is known
- ScheduleFormDialog.tsx
  - Validates timeOfDay as HH:mm:ss, frequency select, Active toggle

--------------------------------------------------------------------------------
7) Services (API layer)
--------------------------------------------------------------------------------
src/services/axiosClient.ts
- Base URL: import.meta.env.VITE_API_BASE_URL (no trailing slash), default http://localhost:8080
- Attaches Authorization: Bearer <token> if present in localStorage/sessionStorage
- Response interceptor:
  - On 401/403: clears tokens and performs hard redirect to /login?msg=session_expired&from=<current>
  - Always rejects to allow UI to surface errors via extractErrorMessage
- Exported helper:
  - extractErrorMessage(error): normalizes error messages from Axios responses, arrays, details, or generic Error

src/services/auth.ts
- Types: AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest
- Token storage: storeToken(token, remember) into localStorage/sessionStorage
- Endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/forgot-password (no auto-login; user must sign in manually)
  - POST /api/users/fcm-token
  - GET  / (health)
- Helpers:
  - clearStoredToken(), logout()
  - getHealth()

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
- Notes: transforms camelCase to API fields (e.g. image_url) and prunes undefined keys

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
- CRUD + search endpoints for global medicines catalog (UI not yet implemented)

--------------------------------------------------------------------------------
8) State Management
--------------------------------------------------------------------------------
src/store/authStore.ts (Zustand)
- State: email: string | null; isAuthenticated: boolean (derived from presence of stored token)
- Actions:
  - setEmail(email)
  - refreshAuth() → recompute isAuthenticated from stored tokens
  - logout() → clearStoredToken() + reset state
- Token detection checks both localStorage and sessionStorage for jwt_token/token

--------------------------------------------------------------------------------
9) Types (Domain models)
--------------------------------------------------------------------------------
src/types/auth.ts
- AuthResponse: { token: string; email: string }
- LoginRequest, RegisterRequest
- ForgotPasswordRequest: { email: string; newPassword: string }

src/types/api.ts
- Composition: { name, strengthValue, strengthUnit }
- Medicine: includes id, userId, profileId, name, dosage, quantity, expiryDate, status, timestamps, and optional fields (category, notes, form, imageUrl, composition)
- Profile: { id, userId, name, createdAt }
- Schedule: { id, medicineId, profileId, userId, timeOfDay, frequency, isActive, createdAt }
- GlobalMedicine: catalog fields with metadata

--------------------------------------------------------------------------------
10) Data Fetching (TanStack Query)
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
11) Error Handling Conventions
--------------------------------------------------------------------------------
- Global:
  - axiosClient response interceptor clears tokens and redirects to /login with msg=session_expired on 401/403.
- UI Helpers:
  - extractErrorMessage(error) imported from services/axiosClient is used in form pages/dialogs to standardize error surfaces.
- Pages updated to use extractErrorMessage:
  - LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx
  - MedicineFormDialog.tsx, MedicineEditDialog.tsx
- Login UX:
  - LoginPage reads ?msg=session_expired to display a warning and asks the user to sign in again.

--------------------------------------------------------------------------------
12) Navigation Surfaces
--------------------------------------------------------------------------------
- Desktop AppBar links (AppShell): /app/dashboard, /app/medicines, /app/profiles, Logout
- Mobile Drawer with identical links + logout
- Breadcrumbs in profile/medicine schedule pages for hierarchical navigation

--------------------------------------------------------------------------------
13) Module Exports Catalog (Key)
--------------------------------------------------------------------------------
Components/Pages (default exports):
- App.tsx → App (routes)
- components/AppShell.tsx → AppShell
- routes/ProtectedRoute.tsx → ProtectedRoute
- features/auth/LoginPage.tsx → LoginPage
- features/auth/RegisterPage.tsx → RegisterPage
- features/auth/ForgotPasswordPage.tsx → ForgotPasswordPage
- features/dashboard/DashboardPage.tsx → DashboardPage
- features/medicines/pages/MedicinesListPage.tsx → MedicinesListPage
- features/medicines/pages/ProfileMedicinesListPage.tsx → ProfileMedicinesListPage
- features/medicines/MedicineFormDialog.tsx → MedicineFormDialog
- features/medicines/MedicineEditDialog.tsx → MedicineEditDialog
- features/profiles/ProfilesListPage.tsx → ProfilesListPage
- features/profiles/ProfileFormDialog.tsx → ProfileFormDialog
- features/schedules/SchedulesListPage.tsx → SchedulesListPage
- features/schedules/ScheduleFormDialog.tsx → ScheduleFormDialog
- components/ConfirmDialog.tsx → ConfirmDialog

Services (named exports):
- services/axiosClient.ts → axiosClient, extractErrorMessage
- services/auth.ts → login, register, forgotPassword, logout, clearStoredToken, updateFcmToken, getHealth
- services/medicines.ts → getAllMedicines, getMedicinesForProfile, getMedicineById, createMedicine, updateMedicine, deleteMedicine, takeDose, uploadMedicineImage
- services/profiles.ts → getProfiles, getProfileById, createProfile, updateProfile, deleteProfile
- services/schedules.ts → getSchedulesForMedicine, getSchedulesForProfile, getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule
- services/globalMedicines.ts → catalog CRUD/search (various)

Store:
- store/authStore.ts → useAuthStore

Types:
- types/auth.ts → AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest
- types/api.ts → Composition, Medicine, Profile, Schedule, GlobalMedicine

--------------------------------------------------------------------------------
14) Environment & Operational Notes
--------------------------------------------------------------------------------
- Development: npm run dev (http://localhost:5173)
- Build: npm run build (type-check + bundle)
- Preview: npm run preview
- API base defaults to http://localhost:8080; ensure backend CORS allows Vite origin
- Image upload endpoint returns a raw string body; axios transformResponse disabled to consume as-is
- Auth:
  - Tokens stored in localStorage/sessionStorage ('jwt_token' and 'token')
  - axiosClient attaches Authorization header when present
  - 401/403 triggers hard redirect to /login?msg=session_expired&from=..., Login page shows warning

--------------------------------------------------------------------------------
15) Gaps / Future Enhancements
--------------------------------------------------------------------------------
- Expand global medicines UI using services/globalMedicines.ts
- Pagination/filters for list pages (profiles, medicines, schedules)
- Centralized query keys/util enums for consistency
- Extract date/time and chip helpers into shared utilities
- Better empty/zero-state designs and skeleton loaders
