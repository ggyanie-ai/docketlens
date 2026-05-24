import {
  Newspaper,
  TrendingUp,
  Briefcase,
  Bell,
  Webhook,
  Mail,
  Sparkles,
  Eye,
  Bookmark,
  type LucideIcon,
} from "lucide-react";

/* ============================================================================
 *  Persona landing page configs
 *
 *  Each /use/<slug> page is rendered from one of these entries via the shared
 *  template at src/app/use/[slug]/page.tsx.
 * ==========================================================================*/

export interface PersonaFeature {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface Persona {
  slug: string;
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  icon: LucideIcon;
  audience: string;
  features: PersonaFeature[];
  example: {
    title: string;
    intro: string;
    monthCost: string;
    /** What they were doing before */
    before: string[];
    /** What they do now */
    after: string[];
    quote: { text: string; who: string };
  };
  ctaPrimary: { label: string; href: string };
}

export const PERSONAS: Persona[] = [
  {
    slug: "journalists",
    icon: Newspaper,
    audience: "reporters · investigators · newsrooms",
    hero: {
      eyebrow: "For journalists",
      title: "Break the story",
      titleAccent: "before the press release.",
      subtitle:
        "Material litigation hits the docket hours before the 8-K. Watchlists on the right companies, executives, and venues mean your inbox sees it first.",
    },
    features: [
      {
        icon: Eye,
        title: "Watch the people, not the press wires",
        body: "Set entity watchlists on the CEOs, plaintiffs, VCs, and law firms that show up in your beat. The moment they're named in a federal filing, you get the alert — usually before the company's PR team has finished circulating the draft response.",
      },
      {
        icon: Sparkles,
        title: "AI summaries you can paste into a draft",
        body: "Three-tier extractive summaries — one-line for the desk, paragraph for the lede, exec-brief for the explainer. Every line cites back to the source paragraph in the PDF; nothing is invented. Quotable, defensible, fast.",
      },
      {
        icon: Mail,
        title: "Morning digest, real-time on the hot ones",
        body: "Email digest at 7am for the routine watches. Real-time Slack hook on the watches that matter today — the M&A target, the executive under SEC scrutiny, the patent troll on its third venue.",
      },
    ],
    example: {
      title: "A finance reporter at a mid-sized newsroom",
      intro:
        "Beat: 50 publicly-traded companies, plus the activist investors and short-seller funds that name them. The reporter sets one watchlist per beat company plus one for each major activist.",
      monthCost: "$49 / month",
      before: [
        "Open PACER, run 50 case-by-case searches, pay per page.",
        "Set Google Alerts on company names — get press releases, never lawsuits.",
        "Find out about new filings from the company's own statement, 48 hours late.",
      ],
      after: [
        "One email at 7am summarising every new federal filing on the beat list.",
        "Slack ping the moment any of the activists files anything.",
        "AI one-liner in the message; click → full docket entry; paste → first draft.",
      ],
      quote: {
        text: "We broke three M&A stories last quarter from DocketLens alerts before the 8-K hit.",
        who: "— Senior reporter, financial newsroom",
      },
    },
    ctaPrimary: { label: "Start free — no card", href: "/signup" },
  },
  {
    slug: "investors",
    icon: TrendingUp,
    audience: "analysts · hedge funds · long/short PMs",
    hero: {
      eyebrow: "For investors",
      title: "Litigation moves the stock",
      titleAccent: "— so move first.",
      subtitle:
        "Securities suits, patent litigation, FTC actions, and M&A challenges are material. Watch the names in your portfolio across every federal court, then act on the filing — not on the next-day analyst note.",
    },
    features: [
      {
        icon: TrendingUp,
        title: "Litigation as a market signal",
        body: "Putative class actions, FTC complaints, and ITC investigations are 8-K-trigger events. DocketLens watches the docket directly, so you see the complaint when it's filed — not when the company chooses to disclose it.",
      },
      {
        icon: Bookmark,
        title: "Portfolio-shaped watchlists",
        body: "One watchlist per ticker. Add the subsidiary and product-line entity names that case captions actually use. Bulk-import from a CSV (Team tier) so a 200-position portfolio is a one-time setup, not a weekly chore.",
      },
      {
        icon: Webhook,
        title: "Pipe matches into your stack",
        body: "Webhook signed with HMAC-SHA256 → Slack, your internal terminal, your risk dashboard. The Team tier ships a REST API so quants can fold litigation events into their own backtests.",
      },
    ],
    example: {
      title: "A long/short PM watching 80 mid-cap names",
      intro:
        "Set one watchlist per holding plus one per major activist short fund (Hindenburg, Muddy Waters, Citron-adjacent funds). Webhook to the firm's research Slack.",
      monthCost: "$199 / month",
      before: [
        "Three analysts manually scanning PACER + Twitter + SeekingAlpha for litigation chatter.",
        "Catch most things — miss the long-tail filings in less-watched courts.",
        "Find out about the SEC enforcement action when the position is down 12%.",
      ],
      after: [
        "Slack ping the second a watch-listed entity is named in any federal court.",
        "AI one-liner in the message lets the desk triage in 10 seconds.",
        "Quants pull historical match data via the REST API for backtests.",
      ],
      quote: {
        text: "It's a litigation Bloomberg I can actually afford — five seats, $199/mo total.",
        who: "— Long/short equity PM, $400M fund",
      },
    },
    ctaPrimary: { label: "Talk to us about Team", href: "/contact?topic=sales" },
  },
  {
    slug: "lawyers",
    icon: Briefcase,
    audience: "solo attorneys · small firms · corporate legal",
    hero: {
      eyebrow: "For lawyers",
      title: "Bloomberg Law on a",
      titleAccent: "solo's budget.",
      subtitle:
        "Watch opposing counsel, competing firms, and your industry's hot venues. PACER stops being a $0.10/page tax — and your morning routine stops being a scroll session.",
    },
    features: [
      {
        icon: Briefcase,
        title: "Track opposing counsel + competing firms",
        body: "One watchlist per opposing firm tells you what they're filing against your clients before opposing counsel calls. One per peer firm in your practice area surfaces every case you'd want to know about — for client development or competitive positioning.",
      },
      {
        icon: Eye,
        title: "Judge watchlists for venue strategy",
        body: "Every motion your assigned judge has ruled on this year, in one feed. When you're staring at a Rule 12(b)(6), seeing how Judge Stark has handled six similar motions in the last 30 days is the difference between writing blind and writing informed.",
      },
      {
        icon: Bell,
        title: "Stop scrolling PACER each morning",
        body: "Daily digest at 7am summarises every new filing across every watchlist. Real-time Slack hook on the case-numbered watches you can't miss. The hour you used to spend on the PACER carousel goes back to billable work.",
      },
    ],
    example: {
      title: "A solo IP attorney with 12 active cases",
      intro:
        "Watchlists: 12 case-number watches for active matters, plus 4 watches on common opposing firms in the IP space, plus 2 watches on the two patent-trolling LLCs that recur in their practice.",
      monthCost: "$49 / month",
      before: [
        "Open PACER each morning, search each case by name, pay ~$0.30 per docket report.",
        "Miss the motion-to-dismiss filing that landed at 4:47pm Friday because no one was watching.",
        "Realise the opposing party filed in a new venue from a client call, not the docket.",
      ],
      after: [
        "Single morning email summarises every overnight filing across all 12 cases.",
        "Slack ping the moment an opposing firm appears in any federal court.",
        "PACER bill drops from ~$80/mo to $0 because every fetch hits our cached copy first.",
      ],
      quote: {
        text: "Saved me at least one billable hour every morning. I used to scroll PACER manually.",
        who: "— Solo IP attorney, Austin",
      },
    },
    ctaPrimary: { label: "Start free — no card", href: "/signup" },
  },
];

export function getPersona(slug: string): Persona | undefined {
  return PERSONAS.find((p) => p.slug === slug);
}
