# Nutri-Track Defense Notes

This document is a presentation guide based on the current implementation. It explains what the system actually does, what files support each feature, and what limitations should be stated honestly.

## 1. One-minute project explanation

Nutri-Track is a responsive web-based child nutrition and growth monitoring system for Barangay Tinampa-an Health Center, Cadiz City. It connects guardian-submitted child, meal, and growth records with staff monitoring tools.

The system has three roles:

- **Administrator** – manages the overall system and can view all records and manage BHW accounts.
- **Barangay Health Worker (BHW)** – monitors children assigned to the BHW's area, updates records, and follows alerts and action plans.
- **Guardian/user** – registers an account, manages a child profile, and records meals and growth measurements.

The React frontend communicates with a Node.js API. The API stores the main data in MySQL, so the administrator, BHW, and user modules work from the same shared records. The system calculates BMI and a simplified nutrition status, then generates alerts, recommendations, charts, reports, and follow-up action plans from those records.

## 2. Main objectives

- Digitize child profiles, meal logs, and growth records.
- Monitor weight, height, BMI, and nutrition status over time.
- Help staff identify children who need monitoring or follow-up.
- Assign records to the correct BHW area.
- Give guardians and health workers a single, organized source of information.
- Reduce repeated manual encoding and make trends easier to see.

The system is a monitoring and decision-support prototype. It does not replace a doctor, dietitian, or official clinical assessment.

## 3. Target users and permissions

### Administrator

The administrator can access `/admin` routes, view all children and records, review alerts and reports, and create, edit, or delete BHW accounts.

### BHW

A BHW signs in through the BHW option and accesses `/bhw` routes. The data provider filters children, meals, growth records, and action plans using the BHW's assigned area. A BHW therefore sees the records assigned to that area rather than the entire system.

### Guardian/user

A guardian accesses the `/user` portal. The portal provides profile management, child profiles, meal entries, growth records, and child-specific information.

## 4. Technology stack and actual data design

- **Frontend:** React 18, TypeScript, Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **UI components:** Radix UI and shadcn-style components
- **Backend:** Node.js HTTP API in `server.mjs`
- **Database:** MySQL through `mysql2`
- **Authentication data:** MySQL `users` table
- **Browser session:** `sessionStorage`
- **Frontend cache/fallback state:** React state and `localStorage` are used by `useNutriData`, but the normal source of truth is the API/MySQL database
- **Testing:** Vitest and Testing Library

Important clarification: this is not currently a localStorage-only application. The active implementation uses the Node API and MySQL for accounts and nutrition records. `src/lib/supabase.ts` and `supabase/schema.sql` are prepared Supabase/PostgreSQL migration infrastructure; the existing API still uses MySQL.

## 5. Important files

### Application entry and routing

- `src/main.tsx` – starts the React application.
- `src/App.tsx` – configures providers and public, admin, BHW, and user routes.
- `src/components/AppLayout.tsx` – staff layout and navigation.
- `src/components/UserLayout.tsx` – guardian/user layout and navigation.

### Authentication and access control

- `src/hooks/useAuth.tsx` – calls the authentication API, stores the active browser session, and exposes login, registration, profile, password, and logout functions.
- `src/components/AdminRoute.tsx` – protects staff routes and checks whether the role is `admin` or `bhw`.
- `src/components/UserRoute.tsx` – protects the user portal.
- `server.mjs` – validates credentials and handles account operations.
- `scripts/db-utils.mjs` – creates the MySQL schema and hashes passwords with SHA-256.

### Nutrition domain logic

- `src/hooks/useNutriData.tsx` – loads nutrition data, derives visible records, calculates BMI/status, generates alerts and dashboard statistics, and sends create/update requests.
- `src/lib/mockData.ts` – shared TypeScript interfaces, seed-style data, age helpers, and BHW-area helpers.
- `src/lib/actionPlan.ts` – builds recommendations, follow-up dates, severity, meal-tracking notes, and overdue status.
- `src/lib/api.ts` – common JSON `fetch` wrapper for the API.

### Server and database

- `server.mjs` – API routes, MySQL-backed data operations, static production serving, and seed handling.
- `database.schema.sql` – MySQL schema reference.
- `supabase/schema.sql` – PostgreSQL/Supabase schema prepared for a future migration.
- `.env.example` – database and server configuration template.

### Main pages

- `HomePage.tsx` – landing page.
- `AdminLogin.tsx` – administrator login.
- `UserLogin.tsx` – guardian and BHW login, including password reset flow.
- `UserRegister.tsx` – resident verification and guardian registration.
- `Dashboard.tsx` – staff summary and status chart.
- `ChildrenList.tsx` – child records list.
- `StaffChildProfile.tsx` – staff view of one child.
- `MealTracker.tsx` – staff meal records.
- `GrowthMonitor.tsx` – staff growth history and charts.
- `AlertsPage.tsx` – alerts and action-plan follow-ups.
- `ReportsPage.tsx` – nutrition summaries and record table.
- `BhwManagement.tsx` / `BhwProfile.tsx` – BHW account management and profile.
- `UserPortal.tsx`, `UserChildProfile.tsx`, `UserMealsPage.tsx`, `UserGrowthPage.tsx`, and `UserProfile.tsx` – guardian features.

## 6. System architecture in simple terms

The application uses two main React context providers:

1. **`AuthProvider`** stores the current staff or guardian session and exposes authentication operations.
2. **`NutriDataProvider`** loads and manages children, meals, growth records, action plans, alerts, and dashboard statistics.

The provider pattern allows pages to access shared data without passing the same props through every component. `App.tsx` wraps the router with `AuthProvider` and `NutriDataProvider`, while `QueryClientProvider` is available for query-based features.

The normal data flow is:

```text
React page
   -> useAuth() or useNutriData()
   -> apiRequest() /api/...
   -> server.mjs
   -> MySQL tables
```

When a user submits a record, the interface updates its React state immediately and then sends the record to the API. The database-backed `/api/nutrition` response is loaded when the provider starts, so other views can read the shared records.

## 7. Authentication and registration flow

### Login

1. The user selects administrator, BHW, or guardian login.
2. `useAuth.tsx` sends the email and password to the corresponding API endpoint.
3. The server hashes the submitted password and compares it with the stored hash and role.
4. The returned public user information is saved in `sessionStorage`.
5. A route guard allows or redirects the user based on the active role.

The session is browser-session state, not a JWT or server-side cookie session. Logging out clears the session keys.

### Guardian registration

Registration is designed for residents of Barangay Tinampa-an:

1. The guardian enters an address and confirms residency.
2. The guardian uploads a JPG/PNG ID document, up to 5 MB.
3. Tesseract OCR reads the document and checks for a Tinampa-an address.
4. The guardian performs a one-time camera face comparison using `@vladmandic/face-api`.
5. The account request is sent to `/api/auth/register` with the ID metadata/document and verification values.
6. The server validates the required address, residency confirmation, face verification, document type/size, and OCR text before saving the user.

New guardian accounts are stored with `verification_status = pending`. The current login flow returns the account after registration; formal approval workflow should be strengthened before production deployment.

## 8. Database and API

On startup, `server.mjs` uses the MySQL configuration from environment variables, creates the database if the account has permission, creates missing tables, and seeds the default accounts. The main tables are:

- `users` – names, email, hashed passwords, role, area, residency, and ID verification fields.
- `children` – identity, birth date, guardian details, measurements, BMI, status, assigned area, and assigned BHW.
- `meal_entries` – date, meal type, food list, calories, protein, carbohydrates, and fat.
- `growth_records` – historical weight and height measurements per child.
- `nutrition_action_plans` – severity, recommendations, follow-up date, target, BHW notes, and completion date.

Important API groups in `server.mjs` include:

- `GET /api/health` – checks API/database availability.
- `GET /api/nutrition` – returns children, meals, growth data, and saved action plans.
- `POST /api/auth/admin-login`, `/api/auth/bhw-login`, `/api/auth/user-login` – role-specific login.
- `POST /api/auth/register` – guardian registration.
- `PUT/DELETE /api/auth/profile` and password reset routes – account management.
- `GET/POST/PUT/DELETE /api/bhws` – BHW account management.
- `POST/PUT /api/children` – child profile creation and editing.
- `POST /api/meals` – meal creation.
- `POST /api/growth-records` – growth history creation and current child update.
- `PUT /api/children/:childId/action-plan` – saves BHW action-plan notes/completion.

Meal and growth records reference a child, and database foreign keys use cascade deletion so dependent records are removed when a child is deleted.

## 9. Nutrition calculations and classification

### BMI

The code assumes height is entered in centimeters:

```text
heightInMeters = heightInCentimeters / 100
BMI = weightInKilograms / (heightInMeters x heightInMeters)
```

BMI is rounded to one decimal place.

### Current prototype status rules

`useNutriData.tsx` first checks a simplified age-based height threshold:

- age 2 or below: 82 cm
- age 3: 89 cm
- age 4: 96 cm
- age 5: 103 cm
- age 6: 109 cm
- above age 6: 115 cm

The classification order is important:

1. If height is below the applicable threshold: `Stunted`.
2. Otherwise, if BMI is below 14: `Underweight`.
3. Otherwise, if BMI is above 18: `Overweight`.
4. Otherwise: `Normal`.

This is a simplified prototype rule, not an official WHO growth-standard calculation. In a clinical deployment, the thresholds should be replaced with validated age/sex-specific standards and reviewed by qualified health personnel.

## 10. Alerts and nutrition action plans

Alerts are derived from the current child status and action-plan state; they are not manually duplicated in every page.

- `Stunted` – critical alert about height trend and follow-up.
- `Underweight` – warning to review intake and calorie density.
- `Overweight` – warning to review portions, snacks, and activity.
- `Normal` – informational alert that the current plan should continue.
- Priority action plans or overdue follow-ups – warning/critical action-plan alerts.

`buildNutritionActionPlan()` creates a severity, summary, recommendations, target, and follow-up date:

- Underweight and stunted: priority follow-up.
- Overweight: monitoring plan.
- Normal: routine information plan.

The action plan also checks recent meal records. It can identify no meals in the last seven days, low average protein, processed foods, and inconsistent breakfast logging. BHW notes and completion dates are saved through the API.

## 11. Page functions

- **Home:** explains the system and links to the login pages.
- **Admin dashboard:** shows total children, status counts, recent meal activity, pending alerts, and charts.
- **Children:** displays profiles and opens detailed staff child records.
- **Meals:** records and reviews food and nutrient values.
- **Growth:** displays weight/height history and growth trends.
- **Alerts:** displays status alerts and action-plan follow-ups.
- **Reports:** presents summary charts and child record tables.
- **BHW management:** allows the administrator to create, edit, and remove BHW accounts and assign areas.
- **Guardian portal:** manages the account, children, meals, and growth updates.

## 12. Demo accounts

The server seeds these development accounts when configured to seed the database:

### Administrator

- Email: `admin@nutritrack.gov.ph`
- Password: `admin123`

### BHW accounts

- `bhw@nutritrack.gov.ph` / `bhw12345` – Purok 1 - Riverside
- `bhw.proper@nutritrack.gov.ph` / `bhwproper123` – Purok 2 - Proper
- `bhw.hillside@nutritrack.gov.ph` / `bhwhillside123` – Purok 3 - Hillside

### Guardian

- Email: `user@nutritrack.app`
- Password: `user12345`

These are demo credentials only and must be changed or removed in a real deployment.

## 13. Recommended defense walkthrough

1. Start on the landing page and explain the problem being addressed.
2. Log in as administrator and show the dashboard.
3. Explain how the cards and chart are derived from shared records.
4. Open Children, Meals, Growth, Alerts, and Reports.
5. Open BHW Management to show that staff accounts and assigned areas are separate from the administrator role.
6. Log out and sign in as a BHW; show that only the assigned area is visible.
7. Log out and sign in as a guardian.
8. Add or edit a child profile, then record a meal and a growth measurement.
9. Show the updated status, chart, alert, and action plan.
10. Explain that the records are sent through the Node API and persisted in MySQL.

For the registration feature, demonstrate the verification screen separately if a real camera and sample ID are not available during the defense.

## 14. Likely panel questions and suggested answers

### Why did you use React?

React supports reusable components, multiple role-based pages, and shared provider state. This makes it suitable for a dashboard where several screens respond to the same child and nutrition records.

### Why TypeScript?

The system has structured entities such as `Child`, `MealEntry`, `GrowthRecord`, `Alert`, and `ActionPlanRecord`. TypeScript helps catch invalid fields and makes those data contracts clearer during development.

### Why use a Node API and MySQL?

The API separates the browser interface from database operations. MySQL provides persistent shared records, relationships between children and their meals/growth data, and foreign-key protection. This is more appropriate for multi-user data than browser-only storage.

### What is stored in the browser?

The active login state is stored in `sessionStorage`, so it is cleared on logout or when the session ends. `useNutriData` also keeps React state and writes a localStorage cache, but the API/MySQL data is the primary application source when the server is available.

### How is access control handled?

The frontend uses `AdminRoute` and `UserRoute` to protect navigation. Staff roles are checked by `AdminRoute`, and BHW data is filtered by assigned area in `NutriDataProvider`. The server also receives role-specific authentication requests. For production, server-side authorization on every data-changing endpoint and real sessions/tokens should be added.

### How are alerts generated?

Alerts are derived from the child's current status and action-plan state. This avoids manually maintaining a separate alert copy that could become inconsistent with the child record.

### Is the nutrition classification clinically official?

No. The current thresholds are simplified prototype rules intended to demonstrate the workflow. A production health system should use validated age- and sex-specific standards and professional review.

### What happens if MySQL is unavailable?

The normal server startup requires the configured MySQL database. The frontend may retain local state/cache behavior, but records are not reliably shared or persisted without the API/database. This is why the project includes `npm run db:check` and clear environment configuration.

### What is the largest limitation?

The project is a functional prototype, not a production clinical system. The current password hashing is a simple SHA-256 implementation, browser sessions are not token/cookie sessions, and the simplified nutrition rules need clinical validation. The API also needs stronger authorization, audit logs, backups, and deployment security.

### What would you improve next?

I would add secure salted password hashing, server-side sessions or short-lived tokens, backend authorization for every record operation, audit logs, encrypted document storage, database backups, validated growth standards, exportable PDF/CSV reports, and a formal BHW/admin approval workflow.

## 15. Strengths

- Clear separation of administrator, BHW, and guardian workflows.
- Shared persistent API/database model instead of an isolated page-only demo.
- Area-based BHW visibility.
- Automatic BMI/status, alerts, recommendations, and follow-up plans.
- Historical growth records and chart-based monitoring.
- Registration verification features for residency, ID OCR, and face comparison.
- Typed React code and reusable provider-based state management.
- Responsive layouts for desktop and mobile use.

## 16. Limitations to state honestly

- The system is a prototype and is not yet deployment-ready for sensitive health data.
- MySQL is the active database; Supabase files are not the active provider.
- Password hashing uses SHA-256 without a password-specific salt.
- Browser sessions use `sessionStorage`, not secure server-managed sessions.
- Frontend route guards are not a substitute for complete server-side authorization.
- Nutrition thresholds are simplified and must be clinically validated.
- ID documents are stored as data in the user record and require stronger privacy controls in production.
- Reports are currently on-screen summaries rather than finished export files.
- The face/OCR checks demonstrate verification workflow but should receive security, accuracy, consent, and privacy review before real use.

## 17. Closing statement

Nutri-Track is a functional prototype that digitizes child nutrition monitoring for the health-center workflow. Its main contribution is the connection between guardian data entry, persistent MySQL-backed records, area-based BHW monitoring, administrator dashboards, growth history, automatic nutrition status, alerts, and action plans. It demonstrates the complete workflow while clearly identifying the security, clinical-validation, and deployment improvements still required.

