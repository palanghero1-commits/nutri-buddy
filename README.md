# Nutri-Track

Nutri-Track is a responsive web application for monitoring children's nutrition and growth data for Barangay Tinampa-an, Cadiz City. It provides separate admin and user experiences, where users can submit child, meal, and growth records, and the admin side can immediately monitor the same shared data through dashboards, reports, and alerts.

## Project Summary

This project was built as a final-year web application using:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Radix UI / shadcn-style UI components

The current implementation is a frontend-only prototype. It uses browser storage instead of a live database, and session handling is simulated through `sessionStorage` and `localStorage`.

## Main Features

### Public Side

- Landing page with project overview and feature highlights
- Admin login entry point
- User login and user registration pages

### Admin Side

- Dashboard with statistics and nutritional status chart
- Children profiles page
- Meal tracker page
- Growth monitoring page
- Alerts and recommendations page
- Reports page
- Responsive admin layout with mobile drawer navigation

### User Side

- User account registration and login
- User portal for adding:
  - Child profiles
  - Meal entries
  - Growth records
- Immediate data sharing with the admin module

## How the System Works

The system has two main data layers:

1. Authentication state
   Managed by `src/hooks/useAuth.tsx`

2. Nutrition and growth data
   Managed by `src/hooks/useNutriData.tsx`

### Authentication Flow

- Admin login uses hardcoded demo credentials.
- User accounts are stored in `localStorage`.
- Active login sessions are stored in `sessionStorage`.
- Route guards redirect unauthorized users away from protected pages.

Relevant files:

- `src/hooks/useAuth.tsx`
- `src/components/AdminRoute.tsx`
- `src/components/UserRoute.tsx`

### Data Flow

- Seed data starts in `src/lib/mockData.ts`.
- `NutriDataProvider` loads seed data into browser storage if no saved data exists.
- User submissions update local React state.
- Updated state is saved back into `localStorage`.
- Admin pages read from the same shared state, so new user entries appear immediately.

Relevant files:

- `src/hooks/useNutriData.tsx`
- `src/lib/mockData.ts`

## Routes

Defined in `src/App.tsx`.

### Public Routes

- `/`
- `/admin/login`
- `/user/login`
- `/user/register`

### Protected Admin Routes

- `/admin`
- `/admin/children`
- `/admin/meals`
- `/admin/growth`
- `/admin/alerts`
- `/admin/reports`

### Protected User Route

- `/user`

## Demo Credentials

### Admin

- Email: `admin@nutritrack.gov.ph`
- Password: `admin123`

### Default User

- Email: `user@nutritrack.app`
- Password: `user12345`

You can also register a new user account through the app.

## Project Structure

```text
src/
  components/
    AdminRoute.tsx
    AppLayout.tsx
    AppSidebar.tsx
    UserRoute.tsx
    ui/
  hooks/
    useAuth.tsx
    useNutriData.tsx
    use-mobile.tsx
  lib/
    mockData.ts
    utils.ts
  pages/
    HomePage.tsx
    AdminLogin.tsx
    UserLogin.tsx
    UserRegister.tsx
    UserPortal.tsx
    Dashboard.tsx
    ChildrenList.tsx
    MealTracker.tsx
    GrowthMonitor.tsx
    AlertsPage.tsx
    ReportsPage.tsx
    NotFound.tsx
  App.tsx
  main.tsx
```

## Setup and Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

### 5. Run built app with Node server

```bash
npm run build
npm run start
```

The custom production server is implemented in `server.mjs`.

## Testing

Run the current test suite with:

```bash
npm run test
```

## Key Technical Notes

### BMI and Status Logic

`useNutriData.tsx` computes:

- BMI from weight and height
- child status based on:
  - height threshold by age
  - BMI thresholds for underweight and overweight

Possible statuses:

- Normal
- Underweight
- Overweight
- Stunted

### Alerts

Alerts are derived automatically from each child's current status:

- `Stunted` -> critical
- `Underweight` -> warning
- `Overweight` -> warning
- `Normal` -> info

### Shared Data Design

This project demonstrates a shared-data design:

- users submit records
- admin pages read the same updated dataset
- reports, charts, and alerts react automatically

This is one of the strongest points to explain during project defense.

## Current Limitations

- No real backend or cloud database
- No encrypted password storage
- No real API integration
- No multi-device sync
- Demo auth only
- Reports are view-only and not exported as real files

## Recommended Future Improvements

- Replace browser storage with a real database such as Supabase or Firebase
- Add secure authentication with hashed passwords
- Add role-based access control from a backend
- Generate downloadable PDF or CSV reports
- Add audit logs and activity history
- Add real nutrition recommendation logic or AI-backed analysis
- Add automated tests for critical workflows

## Defense Tip

If asked whether the project is already production-ready, the honest answer is:

> No. It is a functional prototype that demonstrates the workflow, interface, and core data logic, but it still needs a secure backend, real authentication, and deployment-grade data handling for production use.
