# Nutri-Track Implementation Change Report

**Prepared:** 7 October 2026  
**Scope:** Current uncommitted workspace changes

## Summary

Nutri-Track has received a coordinated dashboard redesign and workflow updates for guardians, BHW staff, and administrators. The current work adds role-specific meal entry, growth visualizations, guardian and child management improvements, and estimated nutrition values for supported foods.

## Changes implemented

### Dashboard and navigation

- Updated the guardian dashboard to follow the supplied reference layout, with a dark navigation sidebar, welcome panel, quick actions, summary cards, child profiles, recent meals, and growth overview.
- Applied the same visual language to Admin and BHW layouts, with responsive navigation and role-specific labels.
- Kept the welcome panel free of decorative images and removed child photos from child profile presentation.
- Removed the dashboard search control that was identified as unwanted.
- Kept profile details separate from child profile details.

### Child and guardian records

- Added a two-step child registration flow: child details first, then optional guardian information.
- Added a checkbox to enter different guardian details. When unchecked, the signed-in guardian's account details are used.
- Added an Admin-only guardian list with live search, pagination, verification status, and linked child profiles.
- Added a server endpoint to return guardian accounts together with their child summaries.

### Growth charts

- Added an all-children comparison chart to the Admin/BHW Growth Monitor.
- Added Height, Weight, and BMI views to the general chart, with each child's actual records represented separately.
- Retained the individual child growth chart and current measurements.
- Sorted growth entries chronologically and normalized month-only dates when saving.
- Added empty states for missing children or growth records.

### Feeding-program meal records

- Restricted meal creation in the interface and API to BHW users. Admin and guardian meal views are read-only.
- Added a live nutrition estimate to the BHW meal form. Enter supported food names, separated by commas, and the form updates calories, protein, carbohydrates, and fat automatically.
- Added a serving-size field. The default is 100 grams per listed food; estimates scale with the entered amount.
- Added an estimated nutrition summary and a warning for unsupported food names. Saving is disabled while any listed item is unsupported.
- Restored estimated calories to saved meal displays. Existing historical meal rows keep their previously stored values, including zeros.

### Data handling

- Normalized free-text child and meal food values to uppercase before saving.
- Preserved the existing database columns and API shape for meal calories and macronutrients.

## Food estimate limitations

The current estimator is a small local catalog of common foods, including rice, egg, banana, milk, chicken, fish, bread, mung beans, potato, papaya, mango, and oatmeal. Values are approximate reference values based on USDA FoodData Central foods; preparation, ingredients, and actual serving weights can change nutrition. When multiple foods are listed, the serving size applies to each listed item. Existing records are not recalculated because their original portion sizes were not stored.

## Validation status

- Added HMAC-signed, expiring API sessions and removed client-supplied role headers as a source of authorization.
- Protected API routes now require a valid signed session; child, growth, action-plan, and meal writes are checked against role and ownership/assigned area in both the MySQL and Supabase handlers.
- Public dashboard statistics now use an aggregate-only endpoint rather than downloading child records.
- Removed browser-side cached child/meal/growth state to avoid stale data surviving account changes.
- Disabled known demo-account creation/password resets in production.
- Added tests for signed-session validation and food-estimate behavior, including invalid portions.

## QA results (7 October 2026)

- `npm test -- --run`: passed, 15 tests across 5 files.
- `npm run lint`: completed with 0 errors and 11 warnings. Warnings are Fast Refresh export patterns in existing component files and a ReportsPage memo dependency warning; the data-hook dependency warnings introduced/exposed during this pass were corrected.
- `npm run build`: passed. Vite reports the largest minified JS chunk at approximately 2.73 MB (751 KB gzip), which should be code-split to improve initial load performance.
- `node --check` passed for both API handlers, the session helper, and the database utilities.
- `git diff --check` passed; only Git line-ending conversion notices were emitted.
- No production database credentials were available in this workspace, so full live-database/API workflow verification and interactive browser/device testing remain outstanding.

## Production caveats

- Configure `AUTH_SESSION_SECRET` with a unique random value of at least 32 bytes in every production environment before startup. Existing sessions will require signing in again after secret rotation.
- The current account password storage uses unsalted SHA-256 in the existing authentication/database layer. That is not suitable password hashing for a production system; migrate to Argon2id or scrypt with per-account salts before handling real credentials.
- No live MySQL/Supabase credentials are present in this QA workspace, so database-backed sign-in, data access, schema compatibility, and end-to-end role workflows must still be exercised in the deployment/staging environment.
- Production demo users are no longer seeded. Provision the initial administrator and operational users through a secure deployment process.
- Nutrition values remain estimates, not clinical measurements. Verify the food catalog and serving assumptions with a qualified nutrition professional before using the figures for care decisions.
- The large initial JavaScript chunk is a performance follow-up; split the routed pages/charts into lazy-loaded bundles and retest on a representative mobile connection.
