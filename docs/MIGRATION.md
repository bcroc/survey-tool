# Migration Notes — BranchingRule → Option-level branching

Summary
-------
We simplified the data model: the separate `BranchingRule` model was removed and branching fields were moved onto the `Option` model.

Why
---
- Branching is one-to-one with an Option in current usage. Keeping a separate table added unnecessary complexity and joins.
- Storing branching fields on `Option` makes reads simpler and reduces query complexity.

What changed
------------
- `api/prisma/schema.prisma`: removed `BranchingRule` model; added fields to `Option`:
  - `branchAction BranchAction?`
  - `targetQuestionId String?`
  - `targetSectionId String?`
  - `skipToEnd Boolean @default(false)`

What to do (safe procedure)
--------------------------
1. Back up your database.

2. From the repository root, regenerate Prisma client and push schema changes (this was already done in the codebase):

```bash
cd api
npx prisma generate
npx prisma db push
```

Note: `prisma db push` will sync the schema. If you prefer SQL migrations, create a migration instead and apply it with `prisma migrate deploy`.

3. If you have existing `BranchingRule` rows to preserve, run the migration script which copies `BranchingRule` rows into matching Option rows.

```bash
# Ensure DATABASE_URL points to the target DB and you have a backup
cd api
node -r tsx/register scripts/migrate-branching-to-options.ts
```

The script will:
- Detect if the `BranchingRule` table exists.
- Copy `action` -> `branchAction`, `targetQuestionId`, `targetSectionId`, `skipToEnd` into the matching `Option` row by `optionId`.
- Report how many option rows it migrated.

4. Verify in staging that branching works as expected in the UI and that options have the new fields populated.

5. Once verified, you can drop the old `BranchingRule` table (if `prisma db push` didn't already remove it). If using migrations, add a migration that drops the table explicitly.

Developer notes
---------------
- API endpoints: branching is now managed by `PATCH /api/admin/options/:id`.
- Frontend: updated to read `option.branchAction`, `option.targetSectionId`, `option.skipToEnd`.
- Tests: added API tests that verify branching fields are present and updatable.

If you want, I can prepare a SQL migration that: copies data and drops the `BranchingRule` table in one transaction for your DB (you must run it with a backup).
