# Nutri-Track Defense Notes

This file is for studying the code and preparing for project defense.

## 1. One-Minute Project Explanation

Nutri-Track is a responsive nutrition monitoring system for children in Barangay Tinampa-an, Cadiz City. It has two main roles: admin and user. Users can register and submit child profiles, meal logs, and growth updates. The admin side reads the same shared data and presents it through dashboards, alerts, charts, and reports. The purpose is to make nutrition monitoring more organized, visible, and easier to manage.

## 2. Main Objective

The goal of the project is to provide a digital system for:

- tracking children's nutrition-related records
- monitoring growth indicators such as weight, height, and BMI
- helping administrators identify cases like underweight, overweight, and stunting
- consolidating meal, growth, and child profile data in one interface

## 3. Target Users

- Admin users
  Barangay health workers or authorized staff who monitor records

- Regular users
  Parents or guardians who submit child-related records

## 4. Technology Stack

- Frontend: React + TypeScript
- Build tool: Vite
- Styling: Tailwind CSS
- Routing: React Router
- Charts: Recharts
- UI primitives: Radix UI / shadcn-style components
- Data storage: `localStorage`
- Session storage: `sessionStorage`

## 5. Important Files You Should Know

### Entry and Routing

- `src/main.tsx`
  Starts the React app

- `src/App.tsx`
  Defines all public, admin, and user routes

### Authentication

- `src/hooks/useAuth.tsx`
  Handles admin login, user login, user registration, and logout

- `src/components/AdminRoute.tsx`
  Prevents access to admin pages when not logged in as admin

- `src/components/UserRoute.tsx`
  Prevents access to the user portal when no user session exists

### Shared Data

- `src/hooks/useNutriData.tsx`
  Core business logic for children, meals, growth records, alerts, and dashboard stats

- `src/lib/mockData.ts`
  Contains seed data and shared TypeScript types

### Main Pages

- `src/pages/HomePage.tsx`
- `src/pages/AdminLogin.tsx`
- `src/pages/UserLogin.tsx`
- `src/pages/UserRegister.tsx`
- `src/pages/UserPortal.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/ChildrenList.tsx`
- `src/pages/MealTracker.tsx`
- `src/pages/GrowthMonitor.tsx`
- `src/pages/AlertsPage.tsx`
- `src/pages/ReportsPage.tsx`

## 6. Code Architecture in Simple Terms

The app uses provider-based state management.

### Authentication provider

`AuthProvider` wraps the app and stores:

- `isAdmin`
- `currentUser`
- login functions
- logout function

This means any component can access the current login state through `useAuth()`.

### Data provider

`NutriDataProvider` wraps the app and stores:

- children
- meal entries
- growth data
- alerts
- dashboard statistics

Any admin or user page can access the same dataset through `useNutriData()`.

## 7. Data Flow You Can Explain in Defense

### User side

1. A user logs in or registers.
2. The user opens the user portal.
3. The user adds:
   - a child profile
   - a meal entry
   - a growth record
4. The data is saved into `localStorage`.

### Admin side

1. Admin logs in.
2. Admin pages read the same shared data from the provider.
3. Dashboard, reports, and alerts update automatically.

This is a strong explanation because it shows that the two roles are connected through one shared state layer.

## 8. Business Logic You Should Memorize

### BMI Calculation

BMI is calculated in `useNutriData.tsx`:

```text
BMI = weight / (height in meters)^2
```

### Nutritional Status Logic

The status is derived based on:

- age-specific height threshold
- BMI threshold

Rules:

- If height is below the age threshold -> `Stunted`
- If BMI is below 14 -> `Underweight`
- If BMI is above 18 -> `Overweight`
- Otherwise -> `Normal`

### Alert Logic

Alerts are generated automatically from the child's latest status:

- `Stunted` -> critical alert
- `Underweight` -> warning alert
- `Overweight` -> warning alert
- `Normal` -> informational alert

## 9. Pages and Their Purpose

### Home Page

Introduces the system and provides entry points for admin and user login.

### Admin Login

Allows the administrator to access the protected admin pages using demo credentials.

### User Login and Register

Allows parents or guardians to access the user portal.

### User Portal

Lets users add:

- child profiles
- meal logs
- growth updates

### Dashboard

Shows:

- total children
- meals logged
- pending alerts
- normal percentage
- nutrition status chart
- recent children
- recent alerts

### Children Profiles

Displays child records in card format.

### Meal Tracker

Displays meal entries, food items, and nutrition values.

### Growth Monitor

Displays growth trends using a chart.

### Alerts Page

Displays system-generated recommendations and warning levels.

### Reports Page

Shows chart summaries and a table of child records.

## 10. Demo Credentials

### Admin

- Email: `admin@nutritrack.gov.ph`
- Password: `admin123`

### User

- Email: `user@nutritrack.app`
- Password: `user12345`

## 11. Sample Defense Walkthrough

Use this order during presentation:

1. Start at the landing page.
2. Explain the purpose of Nutri-Track.
3. Show admin login.
4. Enter the dashboard and explain the summary cards and chart.
5. Open children list, meal tracker, growth monitor, alerts, and reports.
6. Log out.
7. Log in as a user.
8. Add a child profile.
9. Add a meal record.
10. Add a growth update.
11. Return to admin view and show that the same data appears there.

That sequence clearly demonstrates the shared-data concept.

## 12. Likely Panel Questions and Suggested Answers

### Q: Why did you use React?

Because the project has multiple pages, shared state, and reusable components. React makes the UI modular and easier to maintain.

### Q: Why did you use TypeScript?

TypeScript helps prevent mistakes by checking types during development. It is useful when handling structured records like children, meals, alerts, and growth data.

### Q: Why did you use localStorage instead of a database?

This project is currently a prototype. `localStorage` was used to simulate persistence without requiring a backend during development. In production, this should be replaced with a secure database.

### Q: How is access control handled?

Admin and user pages are protected by route guards. `AdminRoute` checks `isAdmin`, and `UserRoute` checks whether `currentUser` exists.

### Q: How are alerts generated?

Alerts are not manually entered. They are derived automatically from the child's current nutritional status using logic inside `useNutriData.tsx`.

### Q: What is the biggest limitation of the current system?

The biggest limitation is that it is frontend-only. It does not yet have a secure backend, encrypted passwords, or cloud-based multi-device data sync.

### Q: What is your proposed future improvement?

I would add a backend database, secure authentication, downloadable reports, and real analytics or nutrition recommendation services.

## 13. Strengths of the Project

- Clear separation of admin and user roles
- Shared data model between both sides
- Automatic status and alert generation
- Responsive interface
- Strong demo flow for presentation
- Type-safe code structure

## 14. Limitations You Should State Honestly

- Not yet connected to a live database
- Passwords are not production-secure
- No backend API yet
- Data is device-based because it uses browser storage
- Reports are UI summaries only
- Current implementation is a prototype, not a full deployment-ready system

## 15. Best Technical Points to Say During Defense

- The app uses context providers to avoid prop drilling.
- Authentication and domain data are separated into different hooks.
- The data model is typed in TypeScript through interfaces.
- Derived values such as alerts and dashboard stats are computed, not manually duplicated.
- Route guards help enforce role-based navigation.
- The system is responsive and usable on desktop and mobile.

## 16. Short Closing Statement

Nutri-Track is a functional prototype for digitizing child nutrition monitoring. Its main contribution is the integration of user-submitted records and admin monitoring tools in one responsive web application, supported by structured logic for BMI calculation, status classification, alerts, and reporting.
