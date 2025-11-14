# Medicine Tracker Frontend (React + Vite + MUI + React Query + React Router)

A React frontend for the Medicine Tracker application, implementing the API blueprint and Postman collection provided.

## Tech Stack

- React + Vite (TypeScript)
- React Router v6
- MUI v5 (Material UI)
- TanStack Query (React Query)
- Axios

## Prerequisites

- Node.js 18+ and npm
- Backend running at http://localhost:8080 (Spring Boot app from the repo root)
  - Base API URL: http://localhost:8080/api

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment:
   - Copy `.env.example` to `.env.local` (or `.env`) and adjust values if needed:
     ```
     cp .env.example .env.local
     ```
     Default:
     ```
     VITE_API_BASE_URL=http://localhost:8080
     ```

3. Run the dev server:
   ```
   npm run dev
   ```
   Vite runs on http://localhost:5173 by default.

4. Open the app:
   - Public routes:
     - /login
     - /register
   - Protected app routes (require login):
     - /app/dashboard
     - /app/medicines
     - /app/profiles

## Authentication

- On successful login/register, a JWT token should be stored in localStorage or sessionStorage as either `jwt_token` or `token`.
- The axios client automatically attaches the token to `Authorization: Bearer <token>`.
- If a request returns 401, tokens are cleared and ProtectedRoute will cause a redirect to /login on next render.

## API Integration

- Base URL is read from `VITE_API_BASE_URL` and combined with endpoint paths in the services.
- Example service (profiles):
  ```ts
  // src/services/profiles.ts
  import { axiosClient } from './axiosClient';
  import type { Profile } from '../types/api';

  export async function getProfiles(): Promise<Profile[]> {
    const res = await axiosClient.get<Profile[]>('/api/profiles');
    return res.data;
  }
  ```

## Project Structure (key files)

- src/main.tsx — Providers (ThemeProvider, CssBaseline, QueryClientProvider, BrowserRouter)
- src/App.tsx — Route configuration (public + protected nested under AppShell)
- src/components/AppShell.tsx — App layout with navigation
- src/routes/ProtectedRoute.tsx — Guard for protected routes
- src/services/axiosClient.ts — Axios instance + auth headers + 401 handling
- src/services/* — API service layer
- src/features/auth/LoginPage.tsx — Login page
- src/features/auth/RegisterPage.tsx — Register page
- src/features/dashboard/DashboardPage.tsx — Dashboard widgets
- src/features/medicines/pages/MedicinesListPage.tsx — Medicines list
- src/features/profiles/ProfilesListPage.tsx — Profiles list
- src/theme.ts — MUI theme

## Routing

- Public:
  - `/login` — LoginPage
  - `/register` — RegisterPage
- Redirect root:
  - `/` → `/app/dashboard`
- Protected (requires token):
  - `/app` — AppShell (layout)
    - `/app/dashboard` — DashboardPage
    - `/app/medicines` — MedicinesListPage
    - `/app/profiles` — ProfilesListPage

## Environment Variables

- VITE_API_BASE_URL — Backend base (no trailing slash). Default: `http://localhost:8080`

## Notes

- For image upload and other multipart endpoints, add corresponding services that use `FormData` and `Content-Type: multipart/form-data`.
- Pagination, rate limiting, advanced error handling, and push notifications are planned as future enhancements per the blueprint.
- Ensure your backend matches the API blueprint and CORS allows the Vite origin (http://localhost:5173) in development.

## Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build production bundle
- `npm run preview` — Preview production build locally

## Troubleshooting

- 401 Unauthorized: token missing/expired — log in again
- Network errors: verify backend is running at VITE_API_BASE_URL and CORS is configured
- TypeScript errors for MUI Grid: we use a CSS grid via Box in ProfilesListPage to avoid Grid v2 typing differences
