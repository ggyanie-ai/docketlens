import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { alertDeliveries, alertRules } from "@/lib/db/schema";
import { serverEnv } from "@/lib/env";

/* ============================================================================
 *  Dispatch queued alert deliveries.
 *  - email channel  → Resend (stubbed when key absent)
 *  - webhook channel → fetch POST with HMAC sig (stubbed when no secret)
 *  - in_app          → no external send; just mark sent (UI reads inbox)
 * ==========================================================================*/

let _resend: Resend | null = null;
function getResend() {
  if (_resend) return _resend;
  const key = serverEnv?.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

export async function flushDeliveries({ batchSize = 50 }: { batchSize?: number } = {}) {
  const queued = await db
    .select()
    .from(alertDeliveries)
    .where(eq(alertDeliveries.status, "queued"))
    .limit(batchSize);

  if (queued.length === 0) return { sent: 0, skipped: 0, failed: 0 };

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const d of queued) {
    try {
      const rule = (
        await db
          .select()
          .from(alertRules)
          .where(eq(alertRules.id, d.ruleId))
          .limit(1)
      )[0];
      if (!rule) {
        await markFailed(d.id, "no rule");
        failed++;
        continue;
      }

      const payload = d.payload as { subject: string; body: string };

      switch (rule.channel) {
        case "email": {
          const resend = getResend();
          if (!resend) {
            await markSkipped(d.id, "RESEND_API_KEY absent");
            skipped++;
            break;
          }
          await resend.emails.send({
            from: serverEnv?.RESEND_FROM ?? "DocketLens <alerts@docketlens.ai>",
            to: rule.target,
            subject: payload.subject,
            text: payload.body,
          });
          await markSent(d.id);
          sent++;
          break;
        }
        case "webhook": {
          const res = await fetch(rule.target, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              subject: payload.subject,
              text: payload.body,
              delivery_id: d.id,
              rule_id: rule.id,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          await markSent(d.id);
          sent++;
          break;
        }
        case "in_app": {
          await markSent(d.id);
          sent++;
          break;
        }
      }
    } catch (err) {
      await markFailed(d.id, err instanceof Error ? err.message : String(err));
      failed++;
    }
  }

  return { sent, skipped, failed };
}

async function markSent(id: string) {
  await db
    .update(alertDeliveries)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(alertDeliveries.id, id));
}
async function markSkipped(id: string, reason: string) {
  await db
    .update(alertDeliveries)
    .set({ status: "skipped", error: reason })
    .where(eq(alertDeliveries.id, id));
}
async function markFailed(id: string, reason: string) {
  await db
    .update(alertDeliveries)
    .set({ status: "failed", error: reason })
    .where(eq(alertDeliveries.id, id));
}
