/* ============================================================================
 *  Glossary of terms used inside DocketLens.
 *
 *  Aimed at non-lawyer readers (journalists, analysts, founders) who hit a
 *  page and don't know what NOS / MDL / 12(b)(6) means. Lawyers should read
 *  past it — the definitions are deliberately plain-English, not Black's.
 * ==========================================================================*/

export type GlossaryCategory =
  | "data"
  | "lifecycle"
  | "pleadings"
  | "procedural"
  | "people"
  | "ai";

export interface GlossaryTerm {
  /** URL slug, used as the anchor id (`#nos`). */
  slug: string;
  term: string;
  /** Optional shorter / acronym form. */
  short?: string;
  category: GlossaryCategory;
  body: string;
  /** Other terms readers might want to jump to next. */
  related?: string[];
}

export const CATEGORIES: { key: GlossaryCategory; label: string; blurb: string }[] = [
  {
    key: "data",
    label: "Data sources",
    blurb: "Where federal court records live and how they get to us.",
  },
  {
    key: "lifecycle",
    label: "Case lifecycle",
    blurb: "Stages a federal case moves through.",
  },
  {
    key: "pleadings",
    label: "Pleadings & motions",
    blurb: "The actual documents lawyers file.",
  },
  {
    key: "procedural",
    label: "Procedural concepts",
    blurb: "The structural language judges and clerks use.",
  },
  {
    key: "people",
    label: "Parties & roles",
    blurb: "Who is who on a docket.",
  },
  {
    key: "ai",
    label: "DocketLens-specific",
    blurb: "Terms that mean something specific in this product.",
  },
];

export const GLOSSARY: GlossaryTerm[] = [
  // Data sources
  {
    slug: "pacer",
    term: "PACER",
    short: "Public Access to Court Electronic Records",
    category: "data",
    body: "The U.S. federal judiciary's official electronic-records system. Charges $0.10/page (capped at $3/document), no real alerting, interface unchanged since 2001. DocketLens does not pay PACER directly — we read the public copy through RECAP.",
    related: ["recap", "ecf", "court-listener"],
  },
  {
    slug: "recap",
    term: "RECAP",
    short: "PACER spelled backwards",
    category: "data",
    body: "A public archive of federal court records, maintained by the Free Law Project. When a PACER user reads a document with the RECAP browser extension installed, the document is automatically uploaded to the free RECAP archive. DocketLens reads from RECAP, not PACER.",
    related: ["pacer", "court-listener", "free-law-project"],
  },
  {
    slug: "court-listener",
    term: "CourtListener",
    category: "data",
    body: "The Free Law Project's free, open API on top of RECAP. Every CourtListener REST call DocketLens makes is rate-limited to 125/day per token — see our blog post on how we work around that.",
    related: ["recap", "free-law-project"],
  },
  {
    slug: "free-law-project",
    term: "Free Law Project",
    short: "FLP",
    category: "data",
    body: "A 501(c)(3) non-profit that runs RECAP and CourtListener. The single most important upstream dependency in modern legal-tech. See our /donate page for how to support them.",
    related: ["recap", "court-listener"],
  },
  {
    slug: "ecf",
    term: "ECF",
    short: "Electronic Case Filing",
    category: "data",
    body: "The system attorneys use to file documents into PACER. ECF is the input; PACER is the output. They share a sign-in.",
    related: ["pacer"],
  },

  // Case lifecycle
  {
    slug: "docket",
    term: "Docket",
    category: "lifecycle",
    body: "The running log of every filing, order, and event in a single court case. Every entry has a number, a date, and a one-line description (the 'docket text') plus often a linked PDF.",
    related: ["docket-entry", "case-number"],
  },
  {
    slug: "docket-entry",
    term: "Docket entry",
    category: "lifecycle",
    body: "One row on the docket. A complaint is a docket entry. A motion is a docket entry. A scheduling order is a docket entry. DocketLens AI-summarises each entry into a one-liner, paragraph, and (Pro+) executive brief.",
    related: ["docket", "complaint", "motion"],
  },
  {
    slug: "case-number",
    term: "Case number",
    category: "lifecycle",
    body: "Unique identifier for a case within a court. Format varies by court but typically looks like `1:25-cv-04812` (district + year + case type + sequence). Use /lookup to jump to a case by its number.",
    related: ["docket", "nos"],
  },
  {
    slug: "nos",
    term: "NOS code",
    short: "Nature of Suit",
    category: "lifecycle",
    body: "Three-digit code (e.g. 830 Patent, 850 Securities, 410 Antitrust) classifying the subject matter of a civil case. Set at filing. Used in DocketLens watchlist filters and search facets.",
    related: ["case-number"],
  },
  {
    slug: "mdl",
    term: "MDL",
    short: "Multidistrict Litigation",
    category: "lifecycle",
    body: "When similar federal cases are filed in different districts, the Judicial Panel on Multidistrict Litigation can consolidate them under one judge for pretrial coordination. The MDL gets its own case number (`2:25-md-00382`).",
    related: ["docket", "case-number", "jpml", "mdl-transferee"],
  },
  {
    slug: "jpml",
    term: "JPML",
    short: "Judicial Panel on Multidistrict Litigation",
    category: "lifecycle",
    body: "Seven federal judges who decide whether tag-along cases should be consolidated into an MDL and which district court (the transferee court) handles the consolidated pretrial proceedings. Sits in Washington, D.C.; meets bimonthly. A JPML transfer order is itself a docket entry worth watching — it tells you a wave of similar cases is now coordinated under one judge.",
    related: ["mdl", "mdl-transferee"],
  },
  {
    slug: "mdl-transferee",
    term: "MDL transferee judge",
    category: "people",
    body: "The single district judge the JPML picks to handle every consolidated case in an MDL through pretrial. After pretrial, cases are either remanded to their original districts for trial or settled in-place. Patent MDLs commonly land in E.D. Tex. / D. Del.; mass-tort MDLs trend toward S.D.N.Y. / N.D. Ohio.",
    related: ["mdl", "jpml", "magistrate"],
  },
  {
    slug: "section-1782",
    term: "Section 1782 discovery",
    short: "28 U.S.C. § 1782",
    category: "procedural",
    body: "A US-court procedure that lets a party to a foreign legal proceeding obtain US-style discovery (depositions, document subpoenas) from a person located in the United States. Heavily used in international patent + securities cases where one side wants evidence held by a US affiliate or witness. Watchlist signal: a § 1782 application is filed as a miscellaneous case (`-mc-`) and is often the first hint that a foreign suit is escalating.",
    related: ["discovery", "removal"],
  },
  {
    slug: "in-camera",
    term: "In camera review",
    category: "procedural",
    body: "A judicial review conducted privately — literally \"in chambers.\" The judge inspects documents, hears testimony, or watches evidence without the opposing party present. Common when a privilege claim is contested: the court reads the disputed material itself to decide whether attorney-client or work-product protections apply. From the Latin for \"chamber.\"",
    related: ["discovery", "motion"],
  },
  {
    slug: "pslra",
    term: "PSLRA pleading standard",
    short: "Private Securities Litigation Reform Act",
    category: "pleadings",
    body: "The 1995 Private Securities Litigation Reform Act raised the bar for surviving a motion to dismiss in §10(b) class actions. Plaintiffs must plead with particularity both the false statement and a \"strong inference\" of scienter (intent to deceive). The standard is why so many securities cases die at the 12(b)(6) stage — and why a denied 12(b)(6) order in a putative class action is itself a major watchlist signal.",
    related: ["12b6", "class-action", "motion"],
  },
  {
    slug: "scheduling-conference",
    term: "Scheduling conference",
    category: "procedural",
    body: "An early pretrial meeting between the judge and counsel where the case's calendar gets set — discovery cutoff, motion deadlines, expert disclosures, trial date. Required under Rule 16(b). The order coming out of it (the scheduling order) is what makes those dates enforceable. Watchlist signal: scheduling conferences are when timelines firm up enough to plan around.",
    related: ["scheduling-order", "discovery"],
  },
  {
    slug: "brady",
    term: "Brady material",
    category: "pleadings",
    body: "Evidence in the prosecution's possession that's favorable to the defense — exculpatory or impeaching. Named after Brady v. Maryland (1963). Failure to disclose Brady material is a constitutional violation that can vacate a conviction. Mostly a criminal-case term but pops up in civil-rights dockets when alleged Brady violations underlie a §1983 wrongful-conviction suit.",
    related: ["motion", "discovery"],
  },
  {
    slug: "vacatur",
    term: "Vacatur",
    category: "procedural",
    body: "A court order setting aside a previous judgment, ruling, or decision. Sometimes the vacating court issues vacatur on its own motion; more often a party moves for it (Rule 60(b)). Common context on civil dockets: an appellate court vacates a district-court ruling and remands. Pronounced 'vay-KAY-ter.'",
    related: ["motion"],
  },
  {
    slug: "lanham-43a",
    term: "Lanham Act §43(a)",
    short: "15 U.S.C. § 1125(a)",
    category: "pleadings",
    body: "The federal-court hook for unfair-competition and false-advertising claims. §43(a)(1)(A) covers false designation of origin (passing off / reverse passing off / trade-dress); §43(a)(1)(B) covers commercial advertising or promotion that misrepresents a product. Pleaded constantly in tech + consumer-goods cases; watchlist signal when paired with NOS 840 or 410.",
    related: ["motion"],
  },
  {
    slug: "treble-damages",
    term: "Treble damages",
    category: "pleadings",
    body: "An award equal to three times the actual damages found. Authorized by specific statutes — Clayton Act (antitrust), DTSA (trade secrets), Lanham Act (in some cases), and patent §284 (willful infringement). The trebling decision usually happens after the underlying verdict, so a willfulness or wantonness finding in the docket is the watchlist signal that trebling is now on the table.",
    related: ["motion", "lanham-43a"],
  },
  {
    slug: "interlocutory-appeal",
    term: "Interlocutory appeal",
    category: "procedural",
    body: "An appeal of a court order that isn't the final judgment — typically allowed only for narrow categories (denied motions to compel arbitration, class-cert decisions under Rule 23(f), preliminary injunctions, certified questions under §1292(b)). Most rulings have to wait for final judgment; an interlocutory appeal jumping out mid-case is itself a noteworthy docket entry.",
    related: ["motion", "preliminary-injunction"],
  },
  {
    slug: "ad-damnum",
    term: "Ad damnum clause",
    category: "pleadings",
    body: "The part of a civil complaint that states the amount of damages the plaintiff is seeking. Some jurisdictions don't allow specifying a dollar amount (\"according to proof at trial\") to prevent jury anchoring; others require it. Watchlist signal: the ad damnum number is often the most-searched datum on a high-profile complaint within hours of filing.",
    related: ["complaint", "treble-damages"],
  },
  {
    slug: "voir-dire",
    term: "Voir dire",
    category: "lifecycle",
    body: "Jury selection — the questioning of potential jurors before trial. From the French 'to see, to say.' Pronounced approximately 'vwah-DEER.'",
    related: [],
  },
  {
    slug: "scheduling-order",
    term: "Scheduling order",
    category: "lifecycle",
    body: "The court's case-management plan: dates for discovery cutoff, expert disclosures, dispositive motions, pretrial conference, and trial. Usually filed within the first few months of a case under Rule 16(b). Once entered, you can only modify it for good cause — so a watchlist hit on a scheduling order tells you the case is real and the deadlines are now firm.",
    related: ["docket", "discovery"],
  },
  {
    slug: "daubert",
    term: "Daubert motion",
    category: "pleadings",
    body: "A pretrial motion asking the court to exclude an opposing expert's testimony as unreliable under Federal Rule of Evidence 702. Named after Daubert v. Merrell Dow Pharmaceuticals (1993). Common in patent, antitrust, products-liability, and securities cases — a granted Daubert can functionally end the case before trial.",
    related: ["motion", "summary-judgment"],
  },

  // Pleadings & motions
  {
    slug: "complaint",
    term: "Complaint",
    category: "pleadings",
    body: "The opening pleading in a civil case. The plaintiff files it; it names the defendants, lays out the facts, and states the legal claims. Docket entry #1 in most cases.",
    related: ["docket-entry", "answer", "motion"],
  },
  {
    slug: "answer",
    term: "Answer",
    category: "pleadings",
    body: "The defendant's formal written response to the complaint. Admits or denies each allegation and raises any affirmative defenses.",
    related: ["complaint"],
  },
  {
    slug: "motion",
    term: "Motion",
    category: "pleadings",
    body: "A formal request to the court to do something — usually with a supporting brief. Motions to dismiss, motions for summary judgment, and motions in limine are the most common types you'll see in DocketLens alerts.",
    related: ["12b6", "summary-judgment"],
  },
  {
    slug: "12b6",
    term: "Rule 12(b)(6)",
    category: "pleadings",
    body: "Federal Rule of Civil Procedure 12(b)(6) — the standard 'motion to dismiss for failure to state a claim.' Defendants file these early to test whether the complaint, taken as true, even alleges a legal violation.",
    related: ["motion", "complaint"],
  },
  {
    slug: "summary-judgment",
    term: "Summary judgment",
    category: "pleadings",
    body: "A motion arguing that there's no genuine factual dispute and the moving party deserves judgment as a matter of law — no trial needed. Filed after discovery; granted, denied, or partially granted.",
    related: ["motion"],
  },
  {
    slug: "tro",
    term: "TRO",
    short: "Temporary Restraining Order",
    category: "pleadings",
    body: "An emergency court order, usually decided on a few days' notice (or ex parte), that pauses a defendant's conduct pending a fuller hearing on a preliminary injunction. Common in trade-secret and IP cases.",
    related: ["preliminary-injunction", "motion"],
  },
  {
    slug: "preliminary-injunction",
    term: "Preliminary injunction",
    short: "PI",
    category: "pleadings",
    body: "An order that maintains the status quo while a case proceeds. Higher bar than a TRO; usually decided after a full hearing.",
    related: ["tro"],
  },

  // Procedural
  {
    slug: "markman",
    term: "Markman hearing",
    category: "procedural",
    body: "In patent cases, a pretrial hearing where the court interprets the disputed terms in the patent claims. The court's claim-construction ruling drives the rest of the case. Named after Markman v. Westview Instruments (1996).",
    related: ["patent"],
  },
  {
    slug: "discovery",
    term: "Discovery",
    category: "procedural",
    body: "The pretrial phase where each side exchanges documents, takes depositions, and answers interrogatories. Can last months to years. Many disputes about it generate motion practice (motions to compel, protective orders).",
    related: [],
  },
  {
    slug: "removal",
    term: "Removal",
    category: "procedural",
    body: "When a defendant transfers a case from state court to federal court. Allowed only when there's a federal-question or diversity basis. The notice of removal is its own docket entry.",
    related: [],
  },
  {
    slug: "venue",
    term: "Venue",
    category: "procedural",
    body: "The geographic district where a case is properly heard. Plaintiff picks initially; defendants can move to transfer venue if the choice is improper or inconvenient.",
    related: ["mdl"],
  },
  {
    slug: "class-action",
    term: "Class action",
    category: "procedural",
    body: "A suit where named plaintiffs represent a larger group ('class') of similarly-situated people. Securities-fraud and consumer cases often run this way. The class has to be certified under Rule 23 before a settlement or trial.",
    related: [],
  },

  // People
  {
    slug: "plaintiff",
    term: "Plaintiff",
    category: "people",
    body: "The party who files the lawsuit. In appeals, becomes the 'appellant' (if they appeal) or 'appellee' (if the other side does).",
    related: ["defendant"],
  },
  {
    slug: "defendant",
    term: "Defendant",
    category: "people",
    body: "The party being sued. In criminal cases, the person accused.",
    related: ["plaintiff"],
  },
  {
    slug: "counsel",
    term: "Counsel",
    category: "people",
    body: "The lawyers. 'Lead counsel' is the primary attorney of record; firms often list multiple attorneys.",
    related: [],
  },
  {
    slug: "magistrate",
    term: "Magistrate judge",
    category: "people",
    body: "A federal judge appointed for an 8-year term (vs. Article III judges' lifetime tenure). Handles discovery disputes, settlement conferences, and increasingly trials by consent.",
    related: [],
  },

  // DocketLens-specific
  {
    slug: "watchlist",
    term: "Watchlist",
    category: "ai",
    body: "A DocketLens primitive — a named saved set of criteria (a party, a judge, a law firm, a case, a free-text term) plus optional filters (court, NOS code, date window). New filings matching a watchlist generate alerts.",
    related: ["alert", "ai-summary"],
  },
  {
    slug: "alert",
    term: "Alert",
    category: "ai",
    body: "What DocketLens sends when a watchlist matches a new filing. Three channels: email, webhook, in-app inbox. Cadence options: real-time (Pro+), hourly (Pro+), daily (all tiers).",
    related: ["watchlist"],
  },
  {
    slug: "ai-summary",
    term: "AI summary (extractive)",
    category: "ai",
    body: "DocketLens AI-summarises filings using Anthropic Claude. Always extractive — we restate what's in the source, never predict outcomes. Three tiers: one-liner (free + paid), paragraph (Pro+), executive brief (Pro+). Every line cites back to the source paragraph.",
    related: ["watchlist"],
  },
  {
    slug: "byo-token",
    term: "BYO token",
    short: "Bring Your Own CourtListener token",
    category: "ai",
    body: "On Pro+ tiers, you can plug in your own CourtListener API token so your watchlists hit your own rate-limit budget (5/min, 50/hr, 125/day) instead of competing with the shared pool. The premium freshness lever.",
    related: ["court-listener"],
  },
];

export function termsByCategory(): Record<GlossaryCategory, GlossaryTerm[]> {
  const out = {} as Record<GlossaryCategory, GlossaryTerm[]>;
  for (const t of GLOSSARY) {
    (out[t.category] ??= []).push(t);
  }
  for (const k in out) {
    out[k as GlossaryCategory].sort((a, b) => a.term.localeCompare(b.term));
  }
  return out;
}

export function findTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
