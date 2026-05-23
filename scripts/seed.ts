import { db } from "../src/lib/db";
import {
  courts,
  dockets,
  docketEntries,
  parties,
  watchlists,
  users,
  orgs,
  orgMembers,
} from "../src/lib/db/schema";
import { ids, normalizeEntityName } from "../src/lib/db/ids";
import { SAMPLE_DOCKETS, SAMPLE_WATCHLISTS } from "../src/lib/sample-data";

/* ============================================================================
 *  Local dev seed — populates the database with the same synthetic dataset
 *  used by the marketing UI, so dev + demo experiences match.
 * ==========================================================================*/

async function main() {
  console.log("▸ seeding local database…");

  // Seed dev user + org
  const userId = ids.user();
  const orgId = ids.org();
  await db
    .insert(users)
    .values({
      id: userId,
      email: "ggyanie.ai@gmail.com",
      emailVerified: true,
      name: "GG Yanie",
    })
    .onConflictDoNothing();
  await db
    .insert(orgs)
    .values({
      id: orgId,
      name: "DocketLens HQ",
      slug: "docketlens-hq",
      ownerId: userId,
      plan: "free",
    })
    .onConflictDoNothing();
  await db
    .insert(orgMembers)
    .values({ orgId, userId, role: "owner" })
    .onConflictDoNothing();
  console.log(`  user + org seeded (${userId.slice(0, 12)}…)`);

  // Seed courts
  const distinctCourts = new Map<string, { full: string; short: string }>();
  for (const d of SAMPLE_DOCKETS) {
    distinctCourts.set(d.court, { full: d.courtFull, short: d.court });
  }
  for (const [id, c] of distinctCourts) {
    await db
      .insert(courts)
      .values({
        id,
        fullName: c.full,
        shortName: c.short,
        jurisdiction: "F",
        inUse: true,
      })
      .onConflictDoNothing();
  }
  console.log(`  courts: ${distinctCourts.size}`);

  // Seed dockets, entries, parties
  for (const sample of SAMPLE_DOCKETS) {
    const docketId = ids.docket();
    await db
      .insert(dockets)
      .values({
        id: docketId,
        clId: stableNumericId(sample.id),
        court: sample.court,
        caseName: sample.caseName,
        caseNameShort: sample.caseNameShort,
        docketNumber: sample.caseNumber,
        natureOfSuit: sample.natureOfSuit,
        cause: sample.cause,
        juryDemand: sample.juryDemand,
        dateFiled: new Date(sample.filed),
        assignedTo: sample.judge,
        raw: sample as unknown as Record<string, unknown>,
      })
      .onConflictDoNothing({ target: dockets.clId });

    for (const e of sample.entries) {
      await db
        .insert(docketEntries)
        .values({
          id: ids.entry(),
          clId: stableNumericId(e.id),
          docketId,
          entryNumber: e.entryNumber,
          dateFiled: new Date(e.dateFiled),
          description: e.description,
          shortDescription: e.short,
        })
        .onConflictDoNothing({ target: docketEntries.clId });
    }

    for (const p of sample.parties) {
      await db
        .insert(parties)
        .values({
          id: ids.party(),
          clId: stableNumericId(p.id),
          docketId,
          name: p.name,
          role: p.role,
          nameNormalized: normalizeEntityName(p.name),
        })
        .onConflictDoNothing({ target: parties.clId });
    }
  }
  console.log(`  dockets: ${SAMPLE_DOCKETS.length}`);

  // Seed watchlists
  for (const w of SAMPLE_WATCHLISTS) {
    await db
      .insert(watchlists)
      .values({
        id: w.id,
        orgId,
        createdBy: userId,
        name: w.name,
        description: w.description,
        color: w.color,
        entityType: w.entityType,
        matchValue: w.name,
        matchValueNormalized: normalizeEntityName(w.name),
        filters: {},
        isActive: true,
        refreshCadence: "daily",
        matchCount: w.matches,
      })
      .onConflictDoNothing();
  }
  console.log(`  watchlists: ${SAMPLE_WATCHLISTS.length}`);

  console.log("▸ seed complete");
  process.exit(0);
}

/** Hash a string id into a stable positive int (32-bit). */
function stableNumericId(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
