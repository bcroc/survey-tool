import { PrismaClient } from '@prisma/client';

/**
 * Safe one-time migration script:
 * - If a `"BranchingRule"` table exists, copy its fields into the corresponding
 *   `"Option"` rows (matching BranchingRule.optionId -> Option.id).
 * - Run inside a transaction and log a summary.
 *
 * Usage:
 *   NODE_ENV=production node -r tsx/register scripts/migrate-branching-to-options.ts
 *
 * Note: keep a database backup before running on production.
 */

async function main() {
  const prisma = new PrismaClient();

  try {
    // Check if BranchingRule table exists
    const tableExists = await prisma.$queryRawUnsafe(
      `SELECT to_regclass('public."BranchingRule"') IS NOT NULL as exists;`
    );

    // The result shape depends on PG version/driver; check generically
    const exists = Array.isArray(tableExists)
      ? (tableExists[0] && (tableExists[0] as any).exists) || false
      : (tableExists as any).exists || false;

    if (!exists) {
      console.log('No BranchingRule table found. Nothing to migrate.');
      return;
    }

    console.log('BranchingRule table detected — starting migration.');

    // Copy rows: SELECT from BranchingRule join Option, update Option
    const rules: Array<any> = await prisma.$queryRawUnsafe(`SELECT id, optionId, action, targetQuestionId, targetSectionId, skipToEnd FROM public."BranchingRule";`);

    console.log(`Found ${rules.length} branching rule(s).`);

    let migrated = 0;

    await prisma.$transaction(async (tx) => {
      for (const r of rules) {
        const optionId = r.optionid || r.optionId;
        if (!optionId) continue;

        const updateResult = await tx.option.updateMany({
          where: { id: optionId },
          data: {
            // action enum name -> branchAction
            branchAction: r.action,
            targetQuestionId: r.targetquestionid ?? r.targetQuestionId ?? null,
            targetSectionId: r.targetsectionid ?? r.targetSectionId ?? null,
            skipToEnd: r.skiptoend ?? r.skipToEnd ?? false,
          },
        });

        if (updateResult.count > 0) migrated += updateResult.count;
      }
    });

    console.log(`Migration complete — migrated ${migrated} option row(s).`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
