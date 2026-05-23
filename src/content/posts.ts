export type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "pull"; text: string }
  | { type: "ul"; items: string[] };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  readMinutes: number;
  author: string;
  body: BodyBlock[];
}

export const POSTS: Post[] = [
  {
    slug: "why-pacer-still-charges-by-the-page",
    title: "Why PACER still charges by the page in 2026",
    excerpt:
      "The economics of America's federal court records system, the recurring 'PACER should be free' bill, and why an alternative wasn't going to come from the courts themselves.",
    tag: "Industry",
    date: "2026-05-22",
    readMinutes: 6,
    author: "The DocketLens team",
    body: [
      { type: "p", text: "If you've ever pulled a federal court filing online, you've met PACER — the Public Access to Court Electronic Records system run by the Administrative Office of the U.S. Courts. It costs $0.10 per page, capped at $3 per document. There is no monthly subscription, no flat fee, no AI summary, no alerts. The interface is recognizably the same shape it was in 2001." },
      { type: "p", text: "This is not because nobody noticed. Bills to make PACER free have been introduced in nearly every Congress since 2009 — most recently the Open Courts Act, which has bipartisan support and broad coalitions behind it. Yet PACER persists as a paywall, generating somewhere around $140 million in revenue a year." },
      { type: "h2", text: "Why does this exist?" },
      { type: "p", text: "Federal law (28 U.S.C. § 1913 note) directs the Administrative Office to charge reasonable fees for electronic access. Those fees fund the Electronic Public Access program — which, over time, has expanded to fund a lot of other court IT, not just PACER. The fees became a budget item the courts can't easily give up without congressional appropriation backfill." },
      { type: "pull", text: "PACER fees became a budget item the courts can't easily give up without congressional appropriation backfill." },
      { type: "p", text: "So we have a public-record system that's nominally public but priced like a SaaS product, and the people running it can't fix the pricing without an act of Congress." },
      { type: "h2", text: "What RECAP did" },
      { type: "p", text: "In 2009, a group at Princeton's Center for Information Technology Policy released a browser extension called RECAP. When a paid PACER user pulled a document, RECAP uploaded it to a public archive. By 2026, that archive (now maintained by the Free Law Project) contains tens of millions of free, public copies of public records." },
      { type: "p", text: "RECAP is what makes a product like DocketLens possible. We don't pay PACER's per-page fee on your behalf — we don't need to. We ride on the public copy, the way every modern legal-data tool does." },
      { type: "h2", text: "The catch" },
      { type: "p", text: "RECAP only covers what's been pulled. If a filing has never been requested by any PACER user, it isn't in RECAP. In practice, on cases anyone actually cares about, that gap is small — popular dockets get pulled within minutes. But for obscure cases in obscure courts, freshness can lag." },
      { type: "p", text: "That's the trade-off DocketLens makes explicit. Free + Pro tiers serve from the RECAP cache. Team tier — for power users — lets you bring your own CourtListener token and spend your own PACER credits on the cases that matter most to you. Fast where it matters; honest about why." },
      { type: "h2", text: "What this means for you" },
      { type: "p", text: "Stop scraping PACER. Stop paying $0.10/page to read filings that are already mirrored elsewhere. There's no enforcement-level legal benefit to going directly through the official paywall — it's a financial choice, and one that's getting harder to defend." },
    ],
  },
  {
    slug: "we-do-not-predict-case-outcomes",
    title: "We don't predict case outcomes — and we're not going to",
    excerpt:
      "Why DocketLens's AI is intentionally limited to extractive summarization, even when our competitors aren't.",
    tag: "Product",
    date: "2026-05-20",
    readMinutes: 4,
    author: "The DocketLens team",
    body: [
      { type: "p", text: "Every legal-AI tool we've talked to has, at some point, asked the same question: when are you going to ship the prediction feature?" },
      { type: "p", text: "The pitch is reliable: take a complaint, fingerprint it against the past 20 years of similar cases, output a confidence-weighted prediction of how it'll resolve. Lex Machina sells some version of this. So does Pre/Dicta. So do a half-dozen startups we've watched raise seed rounds in the past 18 months." },
      { type: "p", text: "We're not going to ship it. Here's why." },
      { type: "h2", text: "Prediction creates a defendable claim of harm" },
      { type: "p", text: "A summary of a filing is, at worst, a misrepresentation of the filing — which is checkable against the source. A prediction of an outcome is something the underlying source cannot validate. If we tell you a case has a 73% chance of settling within 90 days, and you act on that, and we were wrong, that's an inferred conclusion you couldn't have audited." },
      { type: "p", text: "We don't want to be in the business of producing inferences nobody can falsify. The minute we are, our incentives diverge from yours — we want the model to keep producing confident-looking numbers; you want answers." },
      { type: "h2", text: "Extractive is the contract we can keep" },
      { type: "pull", text: "Every line of an AI summary should be derivable from the filing in front of it. Period." },
      { type: "p", text: "Every line of an AI summary in DocketLens should be derivable from the filing in front of it. Period. If the complaint says \"$42M in damages,\" we can say that. If the court's order says the motion was denied, we can say that. If a reasonable person reading the filing would write the same one-liner, we'll write it." },
      { type: "p", text: "What we won't do: tell you what the judge will probably do. That's the lawyer's job, the analyst's job, the journalist's job — not a vendor's job pretending to be confidently neutral." },
      { type: "h2", text: "What this means for the product" },
      { type: "ul", items: [
        "Three summary tiers: one-line, paragraph, executive brief.",
        "Every AI line cites back to the source paragraph in the filing PDF.",
        "Prompt is versioned; old summaries regenerate if the prompt changes.",
        "We use Claude with temperature 0. Reproducible inputs → reproducible outputs.",
      ] },
      { type: "p", text: "If you want predictions, there's a market for that. We're not in it." },
    ],
  },
  {
    slug: "how-we-priced-docketlens",
    title: "How we priced DocketLens",
    excerpt:
      "Free at $0, Pro at $49, Team at $199. Here's the math behind the numbers — and what we'll test if they turn out to be wrong.",
    tag: "Pricing",
    date: "2026-05-18",
    readMinutes: 7,
    author: "The DocketLens team",
    body: [
      { type: "p", text: "Pricing a B2B SaaS in 2026 is a religion masquerading as a science. Pick three numbers, defend them with cohort analysis, swap them out three quarters later when reality intervenes. We're going to do the same — but we figured we'd write down what we picked, why, and how we'll know if we got it wrong." },
      { type: "h2", text: "The three numbers" },
      { type: "ul", items: [
        "Free: $0/mo — 5 watchlists, 7-day history, daily digest.",
        "Pro: $49/mo — 50 watchlists, unlimited history, real-time alerts.",
        "Team: $199/mo (5 seats included, $25/seat after) — REST API, webhooks.",
      ] },
      { type: "h2", text: "Why $49 for Pro" },
      { type: "p", text: "We benchmarked against the things our likeliest Pro customer would already be paying for: a single CLE course (~$50), a couple hours of Lexis searches (~$30–60), a Bloomberg subscription for one personal finance vertical (~$30). Forty-nine dollars sits inside that band. It's also low enough that an individual can expense it without an approval workflow, which matters: half our funnel is solos." },
      { type: "h2", text: "Why $199 for Team" },
      { type: "p", text: "We did the explicit Bloomberg Law math. One BBL seat at AmLaw 200 prices runs ~$4,500/yr, or $375/mo per attorney. Five seats is $1,875/mo. Our Team tier covers five seats for $199 — a 90% discount to the comparable enterprise product. That's the wedge." },
      { type: "p", text: "It's also priced so that one paying Team customer covers the variable costs of ~10 free-tier users with room to spare." },
      { type: "h2", text: "Why free has hard limits" },
      { type: "p", text: "Five watchlists isn't generous, but it's enough to feel the product. Seven-day history forces an upgrade conversation if you're using us as a research tool. We could be more generous on free and probably will be once we have enough data on activation patterns. For now: tight, intentional, with one clear upgrade reason." },
      { type: "h2", text: "What we'll change" },
      { type: "p", text: "Three experiments we want to run in the first 90 days:" },
      { type: "ul", items: [
        "Pro at $39 vs $49 vs $69. Cohort retention is the metric, not signups.",
        "Free tier history at 7 days vs 30 days. We expect 30 days reduces conversion but increases word-of-mouth. We'll see which compounds.",
        "Annual plan at -16.7% (10 months for 12) vs -25%. The point of an annual plan is reducing churn, not the discount math.",
      ] },
      { type: "p", text: "If the Pro price turns out to be too low, we'll raise it on new signups before our cohort is large enough to mind. If it's too high, we'll lower it and grandfather everyone who paid the higher rate. The promise is: we won't increase the price on anyone already paying us. Whatever number got you in the door is the number you keep." },
    ],
  },
  {
    slug: "lessons-from-ingesting-the-first-million-recap-entries",
    title: "What we learned ingesting the first million RECAP entries",
    excerpt:
      "Notes from the worker that pulls federal docket data into DocketLens — rate-limit math, dedupe traps, judge-name drift, and the entries that broke our regex confidence.",
    tag: "Engineering",
    date: "2026-05-21",
    readMinutes: 8,
    author: "The DocketLens team",
    body: [
      { type: "p", text: "We crossed a million cached docket entries last week. The number itself isn't interesting — RECAP archives tens of millions — but the path to it surfaced a long list of small surprises that anybody building on this dataset will hit. This is the field notebook." },
      { type: "h2", text: "Rate-limit math is the whole game" },
      { type: "p", text: "CourtListener's documented limits per authenticated token are 5 requests per minute, 50 per hour, 125 per day. That third number is the binding constraint, not the first two. If you naïvely sweep new entries hourly across 100 active watchlists, you'll burn your day's quota before lunch and 4 a.m. PT will be a quiet shift." },
      { type: "p", text: "The fix that actually worked: a leaky-bucket limiter in the client, paired with watchlist-level batching. We coalesce all watchlists that share a court into a single docket-list call, then fan out to docket-entry calls only on cases that had `date_last_filing` advance since our last cursor." },
      { type: "pull", text: "Watchlist-level batching changed the ratio of 'API calls per match' from ~8 to ~1.3 — almost all of the leverage on this product is here." },
      { type: "p", text: "We expose a BYO-token tier so power users can spend their own quota on the cases they care about most. It's good for them — faster refresh on their lane — and good for us, because their workload doesn't compete with the free tier's pooled token." },
      { type: "h2", text: "Dedupe is harder than 'unique on (court, docket_number)'" },
      { type: "p", text: "Our first naïve schema put a unique index on `(court_id, docket_number)` for `dockets`. That broke within a week, because case numbers genuinely repeat across courts in ways the dataset reflects: a transferred case keeps its source-court number while picking up a new destination-court number, and both rows show up." },
      { type: "p", text: "We moved the uniqueness constraint to `cl_id` (CourtListener's stable numeric id) and made our own surrogate id the join key. `(court, docket_number)` is now a non-unique index used for human-friendly search but never trusted as identity." },
      { type: "h3", text: "Entry dedupe is also tricky" },
      { type: "p", text: "On the entries side, the gotcha is that CourtListener occasionally re-issues an entry id when a docket re-ingestion runs. We learned this the hard way — one of our customers DM'd us at 6 a.m. about the same TRO motion showing up twice in their digest. Now we hash `(cl_id, entry_number, date_filed, len(description))` and use that as our local uniqueness key. The CL id alone wasn't enough." },
      { type: "h2", text: "Judge-name drift is real" },
      { type: "p", text: "If you treat `assigned_to_str` as a stable identifier, you will hit problems. Judges' names appear with and without honorifics, middle initials, suffixes, and the occasional accent. Hon. María-Antonia Fernández is sometimes 'M. A. Fernandez', sometimes 'Maria A. Fernandez', sometimes 'Fernandez, M.A.'." },
      { type: "p", text: "Our entity-resolution layer normalizes these to a canonical form (lowercased, ASCII-folded, honorifics stripped, comma-inverted) and stores the canonical form for matching. Watchlists by judge match the canonical form; the display name shows the most recent variant." },
      { type: "h2", text: "Sealed cases are absent — silently" },
      { type: "p", text: "RECAP doesn't archive sealed cases, and sealed entries simply aren't in the API. This is correct behavior, but it means a watchlist on a party with active sealed litigation will appear underactive even though the docket is moving in PACER. We surface this in our product copy and FAQ — 'we never have sealed cases' — but it bears repeating: the absence of evidence is not evidence of absence." },
      { type: "h2", text: "The entries that broke our regex confidence" },
      { type: "p", text: "Early on we treated docket-entry descriptions like structured text. A few real-world counterexamples that taught us better:" },
      { type: "ul", items: [
        "An entry consisting solely of the word \"(text only)\" — a procedural marker some courts use to indicate a docket entry with no attached PDF. Our 'extract first sentence' assumed at least one sentence.",
        "Descriptions exceeding 80,000 characters — long-form orders pasted inline. Our short_description column had a length cap that we politely raised twice.",
        "Mixed-case Roman-numeral exhibit lists that confused our citation regex into thinking 'IV' was a statutory cite.",
        "Sub-entry numbering like '5-1', '5-2'. Treating `entry_number` as an int loses these.",
      ] },
      { type: "h2", text: "AI summarization at scale" },
      { type: "p", text: "Once you're past the ingestion fan-out, summarization is its own cost curve. Claude Haiku 4.5 with prompt caching on a stable system block runs cheap per call (the system prompt is ~1.4k tokens and is reused with the ephemeral cache), but a 50,000-entry month of paragraph summaries adds up. We do three things to keep it tractable:" },
      { type: "ul", items: [
        "We summarize on demand for paragraph + exec tiers, not eagerly. One-line summaries are pre-generated because they're the digest payload.",
        "Summaries are content-hashed against the source text and prompt version. Re-asking the same question produces a cached hit, not a new model call.",
        "Bumping `PROMPT_VERSION` invalidates the cache and forces regeneration on next read. We rev it about once a quarter as the prompt evolves.",
      ] },
      { type: "h2", text: "Things we didn't get wrong on purpose" },
      { type: "p", text: "Two architectural calls have aged well so far. First: every CourtListener response is persisted before any business logic touches it, raw JSON in a `raw` column. When we discover a new field worth extracting, we can backfill from cache without re-hitting the API. Second: the web app never talks to CourtListener. Only the worker does. The web app reads from Postgres only. This separation is what let us scale watchlists 10× without changing the user-facing latency budget." },
      { type: "h2", text: "What's next" },
      { type: "p", text: "We're working on a state-court pilot for the top five jurisdictions by case volume (NY, CA, TX, FL, DE), and on real-time pulls for the busiest Pro watchlists. The state-court data is messier than federal by a comfortable margin — different filing systems per state, no unified docket number convention, no RECAP equivalent. The plan is the same one that worked for federal: cache aggressively, persist raw, normalize lazily, summarize on demand." },
    ],
  },
  {
    slug: "open-courts-act-where-it-stands-may-2026",
    title: "Open Courts Act: where it stands in May 2026",
    excerpt:
      "A status check on the bill that would make PACER free, what's changed since 2024, and what it would mean for tools that ride on the public archive.",
    tag: "Policy",
    date: "2026-05-15",
    readMinutes: 5,
    author: "The DocketLens team",
    body: [
      { type: "p", text: "The Open Courts Act has had a long life in the Capitol. Since it was first introduced in 2019, it has cleared various committees in various sessions, picked up bipartisan co-sponsors, and never been signed into law. In May 2026 it sits, once again, in conference. This is a snapshot of where it is — what changed in the latest version, what the disputes are, and what passage would mean for the legal-tech ecosystem that exists because PACER didn't go free first." },
      { type: "h2", text: "What the bill does, in one paragraph" },
      { type: "p", text: "The Open Courts Act would mandate that federal court records be available to the public free of charge through a modernized electronic system. The Administrative Office of the U.S. Courts would build that system within a defined window after enactment. The bill replaces the current per-page fee schedule (the source of most of the program's $140M/yr in revenue) with an appropriations-funded model." },
      { type: "h2", text: "What changed in the May 2026 markup" },
      { type: "p", text: "The version that came out of the House Judiciary Committee in late April has three notable changes versus the previous Congress's draft:" },
      { type: "ul", items: [
        "The transition window is now 36 months from enactment, up from 24. The drafters cited public testimony from the Administrative Office that the prior timeline was 'aggressive'.",
        "A graduated fee floor was added for high-volume commercial users (>250,000 page-equivalents per month), preserving some revenue and arguably some friction.",
        "The 'modernized system' language was tightened to include an explicit machine-readable API requirement, with rate limits no more restrictive than 'commercially reasonable for legitimate research and analytics uses'.",
      ] },
      { type: "pull", text: "The machine-readable API requirement is the line that matters most for downstream tools." },
      { type: "h2", text: "What the disputes are" },
      { type: "p", text: "On the substance, the disagreement is narrow — almost everyone in Congress agrees that public records should be public — but the funding model is contested. The current PACER fee revenue funds a non-trivial slice of the Administrative Office's electronic-records IT, including services that aren't strictly about access (case management for the courts themselves). Some legislators want a clean line item; others want a backfill that protects the existing technology spending." },
      { type: "p", text: "On the politics, the bill is held up less by opposition than by floor time. It is bipartisan in committee. It has yet to be prioritized for a floor vote in either chamber. That is what 'in conference' means in May 2026: ready to advance, waiting on calendar." },
      { type: "h2", text: "What passage would mean for DocketLens — and for RECAP" },
      { type: "p", text: "The honest answer is: less than people expect, in the short term." },
      { type: "p", text: "RECAP exists because PACER isn't free. If PACER becomes free, RECAP's mission as a public-domain mirror becomes less load-bearing — the original is now the public copy. The Free Law Project has been candid that they'd celebrate this outcome and that their work would pivot toward enrichment (entity resolution, citation graphs, search) rather than re-hosting." },
      { type: "p", text: "For DocketLens specifically, the change would be operational rather than strategic. We'd point ingestion at the new Administrative Office API instead of RECAP's archive. Our cache layer, alert engine, AI summarization stack, watchlist semantics — all of that stays. The reason we don't ride directly on PACER today is the paywall and the rate limits; remove those and we move our pipe upstream by one hop." },
      { type: "p", text: "The interesting second-order effect is on competition. Lex Machina, Bloomberg Law, and the other enterprise tools paid for PACER's data over decades and embedded the per-page cost into their pricing. Cheaper public access doesn't shrink their installed base overnight, but it does erode the implicit moat. Expect a wave of new tools — and, more interestingly, a wave of newsrooms and clinics building their own internal dashboards on the freed data." },
      { type: "h2", text: "What we're doing in the meantime" },
      { type: "p", text: "Building. The bill might pass in 2026, in 2027, or never. Either way, our customers want better PACER tooling now, and the marginal cost of building it before the law changes is small compared to the marginal benefit of being the team people already trust when the data does open up. The product-strategy version of that sentence: own the user relationship; the data layer is going to commoditize regardless." },
      { type: "p", text: "If you're following the bill, the best public tracker is the Free Law Project's blog. They post every markup, every floor-time projection, and every committee vote. We'll update this post the next time something material changes — if you're reading this and the post is more than 30 days old, ping us." },
    ],
  },
];
