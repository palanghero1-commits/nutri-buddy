# Automated Nutrition Action Plan Feature

## 1. Feature objective

Give each child a practical, easy-to-follow action plan based on the child’s current nutrition status, recent meals, and growth history.

The plan is intended to support Admins and BHWs during follow-up. It is not a medical diagnosis and should display a note that recommendations must be reviewed by a qualified health worker.

## 2. Recommended user experience

Add an **Action Plan** card to the staff child profile page and a smaller summary card to the dashboard.

Each plan should show:

- Current concern: Normal, Underweight, Overweight, or Stunted
- Severity: Information, Monitor, or Priority follow-up
- Why the plan was generated
- Recommended food and monitoring actions
- Follow-up date
- Target for the next check-up
- BHW notes and completion status
- Last updated date

Example:

> Juan is underweight and needs priority follow-up. Add protein-rich food to meals, provide one healthy snack daily, record meals consistently, and schedule a growth check in 30 days.

## 3. Existing code and data to reuse

The project already has the required source data:

- Child status, BMI, weight, height, age, and assigned BHW: `src/lib/mockData.ts`
- Meal history: `meal_entries` and `MealEntry`
- Growth history: `growth_records` and `GrowthRecord`
- Existing alert generation: `src/hooks/useNutriData.tsx`
- Staff child profile: `src/pages/StaffChildProfile.tsx`
- Dashboard and alerts: `src/pages/Dashboard.tsx` and `src/pages/AlertsPage.tsx`
- Existing API persistence: `server.mjs` and `src/lib/api.ts`

The first version should calculate plans from the current API response instead of adding a separate recommendation service.

## 4. Action-plan rules for version 1

### Normal

- Severity: Information
- Recommendation: Maintain the current meal routine and continue regular growth monitoring.
- Follow-up: Next routine check, suggested in 60 days.
- Target: Maintain a stable growth trend and continue recording meals.

### Underweight

- Severity: Priority follow-up
- Recommendation: Add energy- and protein-rich foods, provide one healthy snack daily, and review recent meal consistency.
- Follow-up: Suggested in 30 days.
- Target: Weight should be reviewed against the next growth record; do not promise a fixed weight gain without an approved clinical standard.

### Overweight

- Severity: Monitor
- Recommendation: Review portion sizes, sugary drinks, frequent snacks, and daily activity. Avoid restrictive dieting language for children.
- Follow-up: Suggested in 30 days.
- Target: Monitor height and weight trend rather than forcing rapid weight loss.

### Stunted

- Severity: Priority follow-up
- Recommendation: Review height trend, meal quality, illness history, and referral requirements with the health worker.
- Follow-up: Suggested in 14 days or according to BHW guidance.
- Target: Record a new height and weight measurement and document the follow-up outcome.

## 5. Meal-based personalization

After the basic status plan works, add simple signals from recent meals:

- No meals recorded in the last 7 days: show “Meal tracking needed.”
- Low protein average: recommend adding eggs, fish, beans, milk, or another locally approved protein source.
- High sugary-drink or processed-food frequency: show a review reminder, not a diagnosis.
- Missing breakfast or frequent skipped meals: recommend discussing a consistent meal schedule.

These recommendations should use configurable rules so a health worker can revise them later without changing the page code.

## 6. Proposed data model

For the first release, generate the plan in the frontend from child and nutrition data. Add persistence only for staff notes and completion tracking.

Suggested future table: `nutrition_action_plans`

```text
id
child_id
status
severity
summary
recommendations_json
follow_up_date
target_summary
bhw_notes
completed_at
created_by_email
created_at
updated_at
```

The generated recommendation should remain reproducible from the child’s measurements and meal history. Staff-entered notes and completion status should be stored separately from the generated text.

## 7. UI implementation plan

### Phase 1: Calculation layer

1. Create `src/lib/actionPlan.ts`.
2. Add typed action-plan interfaces.
3. Add `buildNutritionActionPlan(child, meals, growthRecords)`.
4. Keep all thresholds and recommendation text in one configuration object.
5. Add tests for all four statuses and for missing meal/growth data.

### Phase 2: Staff profile card

1. Add the Action Plan card to `StaffChildProfile.tsx`.
2. Show severity with the existing status colors.
3. Show follow-up date and target.
4. Add editable BHW notes.
5. Add “Mark follow-up complete”.

### Phase 3: Dashboard and alerts

1. Add “Action plans needing follow-up” to the dashboard.
2. Add plan-generated alerts only when a child has a priority status or overdue follow-up.
3. Avoid creating duplicate alerts on every page load.
4. Allow BHWs to see only children assigned to their area.

### Phase 4: Reports

1. Add action-plan status to the existing CSV report.
2. Add a “Follow-up Action Plans” section to the PDF report.
3. Include child name, concern, follow-up date, completion status, and assigned BHW.

## 8. API and persistence plan

### First release

- Generate the action plan locally from `/api/nutrition` data.
- Save only notes and completion state if persistence is required.
- Keep the existing children, meals, and growth endpoints unchanged.

### Later release

Add endpoints:

- `GET /api/children/:childId/action-plan`
- `PUT /api/children/:childId/action-plan`
- `GET /api/action-plans?status=overdue`

The API must verify that the requester is an Admin or an assigned BHW before returning or updating a plan.

## 9. Acceptance criteria

- Every child has a generated plan based on the current status.
- Underweight, overweight, and stunted children clearly show different actions.
- A follow-up date is visible and understandable.
- The plan uses recent meal and growth data when available.
- Missing data produces a clear “more data needed” message instead of a misleading recommendation.
- BHWs cannot view or edit children outside their assigned area.
- Staff notes survive page refresh after persistence is added.
- CSV and PDF reports include action-plan information.
- The interface includes a disclaimer that recommendations require health-worker review.

## 10. Recommended implementation order

1. Build and test the calculation layer.
2. Add the staff child profile card.
3. Add follow-up notes and completion state.
4. Add dashboard and alert integration.
5. Add CSV/PDF report support.
6. Validate the rules with the supervising health worker before using the feature operationally.

## 11. Risks and safeguards

- Do not present the feature as a medical diagnosis.
- Do not promise a specific weight gain target without an approved reference standard.
- Do not recommend restrictive diets for children.
- Keep recommendations culturally appropriate and editable by the health program.
- Record when a plan was generated and when a BHW reviewed it.
- Treat missing or stale measurements as a reason to schedule data collection, not as proof of worsening health.

## Final recommendation

Start with a generated Action Plan card on the staff child profile. It gives the highest value with the least database risk because it can reuse the existing nutrition API and status logic. Add persistence for BHW notes and follow-up completion only after the recommendation rules are reviewed and accepted.
