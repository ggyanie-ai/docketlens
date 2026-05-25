/* ============================================================================
 *  /.well-known/security.txt — RFC 9116
 *
 *  Re-rendered at runtime so the `Expires:` date stays 1 year out without
 *  manual maintenance. Mirrors the human-readable policy at /security.
 * ==========================================================================*/

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function plusOneYear(d: Date): string {
  const x = new Date(d);
  x.setUTCFullYear(x.getUTCFullYear() + 1);
  // Trim millis for cleaner RFC 9116 output
  return x.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function GET() {
  const site =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://docketlens.ai";
  // NB: no `Encryption:` field — we haven't published a PGP key yet. RFC 9116
  // makes the field optional; better to omit than to advertise a key that
  // 404s. Add the line back when /security/pgp.asc is real.
  const body = [
    "# DocketLens security disclosure policy",
    "# https://" + site.replace(/^https?:\/\//, "") + "/security",
    "",
    "Contact: mailto:security@docketlens.ai",
    `Expires: ${plusOneYear(new Date())}`,
    "Acknowledgments: " + site + "/security#acknowledgments",
    "Preferred-Languages: en",
    "Canonical: " + site + "/.well-known/security.txt",
    "Policy: " + site + "/security",
    "Hiring: " + site + "/about",
    "",
    "# Please include reproduction steps and your preferred public-credit name.",
    "# We respond within 24h on weekdays, 48h on weekends.",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
