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
];
