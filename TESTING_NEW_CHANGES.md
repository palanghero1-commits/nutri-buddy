# Testing New Registration And Guardian Information Changes

Use this checklist to verify the latest changes for residency verification, guardian information separation, and the guardian address field.

## 1. Build Check

Run:

```bash
npm.cmd run build
```

Expected result:

- The build completes successfully.
- Existing Vite warnings about bundle size or Browserslist data are okay.

## 2. User Registration Verification

Open the app and go to:

```text
/user/register
```

Test the first verification step:

- Confirm the page shows `1. Verification` before account setup.
- Try clicking `Continue to Account Setup` without filling the address.
- Expected: the app asks you to complete Tinampa-an residency verification.
- Fill `Purok / Sitio / Street`, for example `Purok 2`.
- Leave the confirmation checkbox unchecked and try again.
- Expected: verification should not continue.
- Check the confirmation box.
- Click `Continue to Account Setup`.
- Expected: the account form appears and shows the verified address as:

```text
Purok 2, Barangay Tinampa-an, Cadiz City
```

Then test account creation:

- Enter full name, email, password, and confirm password.
- Password must be at least 8 characters.
- Submit the form.
- Expected: account is created and the user is redirected to the user dashboard.

## 3. API Verification Bypass Check

The server should reject registration if residency verification is missing.

Send a registration request without `residentAddress` or with `residencyConfirmed: false`.

Expected result:

- API returns an error.
- Message should say Tinampa-an residency verification is required.

Send a valid registration request with:

```json
{
  "name": "Test User",
  "email": "test-user@example.com",
  "password": "password123",
  "residentAddress": "Purok 2, Barangay Tinampa-an, Cadiz City",
  "contactNumber": "09123456789",
  "residencyConfirmed": true
}
```

Expected result:

- API creates the user.
- User data includes the registration session response.

## 4. Add Child Guardian Information

Sign in as a user and open the user dashboard.

Click:

```text
Add Child
```

Verify the form sections:

- `Child Information` contains only child-related fields:
  - First Name
  - Middle Name
  - Last Name
  - Birthdate
  - Calculated Age
  - Gender
  - Weight
  - Height
  - Allergies
- `Guardian Information` contains guardian-related fields:
  - Mother's Name
  - Guardian
  - Address

Important expected result:

- `Address` appears only under `Guardian Information`.
- Mother and guardian information are not mixed into the child information section.

Submit a child profile with an address.

Expected result:

- Child profile saves successfully.
- Admin dashboard can see the new child.

## 5. User Child Profile Display

Open a saved child profile from the user sidebar.

Expected result:

- The top child summary shows only child details, such as age and gender.
- Guardian details appear in a separate `Guardian Information` section.
- The `Guardian Information` section includes:
  - Mother's Name
  - Guardian
  - Address

## 6. Admin Children List

Sign in as admin and open:

```text
/admin/children
```

Expected result:

- Each child card keeps child health details separate.
- Each card has a separate `Guardian Information` subsection.
- The subsection includes:
  - Mother
  - Guardian
  - Address

## 7. Reports Page

Sign in as admin and open:

```text
/admin/reports
```

Expected result:

- The children summary table includes guardian-related columns:
  - Guardian
  - Mother
  - Address
- Address should appear beside guardian information, not inside the child's basic details.

## 8. Database Schema Check

For new or migrated databases, confirm these columns exist.

In `users`:

- `resident_address`
- `contact_number`
- `residency_confirmed`

In `children`:

- `parent_address`

If using the app server, `ensureDatabaseSchema` should add missing columns automatically on startup.

## 9. Regression Checks

Also confirm these still work:

- Existing users can log in.
- Existing child records without an address still load.
- Missing child addresses display as `Not recorded`.
- Meal logging still works.
- Growth updates still work.
