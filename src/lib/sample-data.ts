/* ============================================================================
 * Sample data for demos + UI development.
 *
 * Pre-baked dockets, entries, parties, and watchlists used to render the
 * dashboard / search / detail pages WITHOUT hitting CourtListener.
 *
 * All names are obviously synthetic ("Helios Bio", "Northgate Labs") so they
 * cannot be confused with real ongoing cases.
 * ==========================================================================*/

export type SampleParty = {
  id: string;
  name: string;
  role: "Plaintiff" | "Defendant" | "Petitioner" | "Respondent" | "Intervenor";
  counsel: string[];
};

export type SampleEntry = {
  id: string;
  entryNumber: number;
  dateFiled: string; // ISO
  type: "Complaint" | "Motion" | "Order" | "Notice" | "Brief" | "Verdict" | "Stipulation";
  short: string;
  description: string;
  filedBy?: string;
  summaryOne?: string;
  summaryPara?: string;
};

export type SampleDocket = {
  id: string;
  court: string;
  courtFull: string;
  caseNumber: string;
  caseName: string;
  caseNameShort: string;
  filed: string; // ISO
  natureOfSuit: string;
  natureOfSuitCode: string;
  cause: string;
  juryDemand: "Plaintiff" | "Defendant" | "Both" | "None";
  status: "Open" | "Closed" | "Stayed" | "Settled";
  judge: string;
  referredJudge?: string;
  parties: SampleParty[];
  entries: SampleEntry[];
  tags: string[];
};

export const SAMPLE_DOCKETS: SampleDocket[] = [
  {
    id: "dkt_helios_v_northgate",
    court: "S.D.N.Y.",
    courtFull: "Southern District of New York",
    caseNumber: "1:25-cv-04812",
    caseName: "Helios Bio Inc. v. Northgate Labs, Inc.",
    caseNameShort: "Helios v. Northgate",
    filed: "2026-05-22",
    natureOfSuit: "840 — Patent (Trade Secret)",
    natureOfSuitCode: "840",
    cause: "18:1836 Defend Trade Secrets Act",
    juryDemand: "Plaintiff",
    status: "Open",
    judge: "Hon. Aileen R. Castillo",
    parties: [
      {
        id: "pty_helios",
        name: "Helios Bio Inc.",
        role: "Plaintiff",
        counsel: ["Margolis & Crain LLP", "Inara Saxe (lead)"],
      },
      {
        id: "pty_northgate",
        name: "Northgate Labs, Inc.",
        role: "Defendant",
        counsel: ["Polaris & Vex PC", "Daniel R. Okonkwo (lead)"],
      },
    ],
    entries: [
      {
        id: "ent_h1",
        entryNumber: 1,
        dateFiled: "2026-05-22",
        type: "Complaint",
        short: "Complaint filed; jury demanded",
        description:
          "Complaint for misappropriation of trade secrets and breach of confidentiality agreements. Plaintiff Helios Bio Inc. alleges that three former research scientists left for defendant Northgate Labs, Inc. in Q1 2026 and carried with them proprietary fluorescent reporter chemistry protocols. Plaintiff seeks $42,000,000 in damages, treble damages under the DTSA, attorneys' fees, and a permanent injunction against defendant's use of the protocols.",
        filedBy: "Plaintiff",
        summaryOne:
          "Helios Bio sues Northgate Labs over alleged misappropriation of fluorescent-reporter chemistry protocols by three former scientists; $42M demanded.",
        summaryPara:
          "Plaintiff Helios Bio Inc. filed a complaint against Northgate Labs, Inc. alleging trade-secret misappropriation under the Defend Trade Secrets Act and breach of confidentiality. The complaint identifies three former Helios research scientists who joined Northgate in Q1 2026 and is said to have carried fluorescent reporter chemistry protocols. Helios seeks $42,000,000 in damages, treble damages, attorneys' fees, and a permanent injunction. Jury trial demanded.",
      },
      {
        id: "ent_h2",
        entryNumber: 2,
        dateFiled: "2026-05-23",
        type: "Motion",
        short: "Motion for TRO and expedited discovery",
        description:
          "Motion by plaintiff Helios Bio Inc. for a temporary restraining order, preliminary injunction, and expedited discovery directed to defendant. Hearing requested within 14 days. Supporting memorandum, declarations of three former Helios employees, and proposed protective order filed contemporaneously.",
        filedBy: "Plaintiff",
        summaryOne:
          "Plaintiff moves for TRO and expedited discovery; hearing requested within 14 days.",
      },
    ],
    tags: ["Trade Secret", "Patent-adjacent", "Biotech", "Hot"],
  },
  {
    id: "dkt_ftc_v_aurora",
    court: "N.D. Cal.",
    courtFull: "Northern District of California",
    caseNumber: "3:25-cv-01984",
    caseName: "Federal Trade Commission v. Aurora AI Corp.",
    caseNameShort: "FTC v. Aurora AI",
    filed: "2026-04-18",
    natureOfSuit: "410 — Antitrust",
    natureOfSuitCode: "410",
    cause: "15:18 Clayton Act §7",
    juryDemand: "None",
    status: "Open",
    judge: "Hon. Marcus T. Ouyang",
    parties: [
      {
        id: "pty_ftc",
        name: "Federal Trade Commission",
        role: "Plaintiff",
        counsel: ["U.S. DOJ Antitrust Division", "Lina Greve (lead)"],
      },
      {
        id: "pty_aurora",
        name: "Aurora AI Corp.",
        role: "Defendant",
        counsel: ["Pemberton, Vex & Lyon LLP", "Jacob N. Hartshorn (lead)"],
      },
      {
        id: "pty_vellum",
        name: "Vellum Data Holdings, LLC",
        role: "Defendant",
        counsel: ["Rangel & Hu PLLC"],
      },
    ],
    entries: [
      {
        id: "ent_a1",
        entryNumber: 1,
        dateFiled: "2026-04-18",
        type: "Complaint",
        short: "Complaint seeking permanent injunction",
        description:
          "Complaint by the Federal Trade Commission against Aurora AI Corp. and Vellum Data Holdings, LLC seeking a permanent injunction under Section 7 of the Clayton Act blocking Aurora's planned $4.2 billion acquisition of Vellum, a training-data vendor.",
        filedBy: "Plaintiff",
        summaryOne:
          "FTC sues to block Aurora AI's $4.2B acquisition of training-data vendor Vellum on Clayton Act §7 grounds.",
      },
      {
        id: "ent_a2",
        entryNumber: 14,
        dateFiled: "2026-05-21",
        type: "Motion",
        short: "Motion for preliminary injunction",
        description:
          "Plaintiff's motion for a preliminary injunction enjoining the closing of the Aurora-Vellum transaction pending trial. Brief and supporting declarations filed.",
        summaryOne:
          "FTC moves for a preliminary injunction blocking the Aurora-Vellum closing pending trial.",
      },
      {
        id: "ent_a3",
        entryNumber: 17,
        dateFiled: "2026-05-23",
        type: "Order",
        short: "Order setting PI hearing",
        description:
          "Order setting hearing on plaintiff's motion for preliminary injunction for June 4, 2026 at 10:00 a.m. Defendant's opposition due May 30; reply due June 2.",
      },
    ],
    tags: ["Antitrust", "M&A", "AI", "Hot"],
  },
  {
    id: "dkt_optera_v_arm",
    court: "D. Del.",
    courtFull: "District of Delaware",
    caseNumber: "1:25-cv-00713",
    caseName: "Optera Semiconductor LLC v. ARM Holdings plc",
    caseNameShort: "Optera v. ARM",
    filed: "2026-02-07",
    natureOfSuit: "830 — Patent",
    natureOfSuitCode: "830",
    cause: "35:271 Patent Infringement",
    juryDemand: "Plaintiff",
    status: "Open",
    judge: "Hon. Leonard P. Stark",
    parties: [
      {
        id: "pty_optera",
        name: "Optera Semiconductor LLC",
        role: "Plaintiff",
        counsel: ["Westin & Klaus LLP"],
      },
      {
        id: "pty_arm",
        name: "ARM Holdings plc",
        role: "Defendant",
        counsel: ["Crail, Brox & Saint PC"],
      },
    ],
    entries: [
      {
        id: "ent_o1",
        entryNumber: 1,
        dateFiled: "2026-02-07",
        type: "Complaint",
        short: "Patent infringement complaint",
        description:
          "Complaint for infringement of U.S. Patent Nos. 10,872,113 and 11,001,438 directed to low-power memory bus architectures. Plaintiff seeks past damages, ongoing royalties, and a permanent injunction.",
        summaryOne:
          "Optera sues ARM for infringement of two patents on low-power memory-bus architectures.",
      },
      {
        id: "ent_o2",
        entryNumber: 28,
        dateFiled: "2026-05-21",
        type: "Order",
        short: "Order denying motion to dismiss",
        description:
          "Memorandum order denying defendant's Rule 12(b)(6) motion to dismiss the §271(a) claims. Discovery cutoff extended sixty (60) days. Markman hearing set for August 12, 2026.",
        summaryOne:
          "Judge Stark denies ARM's motion to dismiss; §271(a) claims survive; discovery extended 60 days.",
      },
    ],
    tags: ["Patent", "Semiconductors", "EDTex-adjacent"],
  },
  {
    id: "dkt_larsen_v_crestmark",
    court: "S.D.N.Y.",
    courtFull: "Southern District of New York",
    caseNumber: "1:25-cv-04901",
    caseName: "Larsen v. Crestmark Capital LLC",
    caseNameShort: "Larsen v. Crestmark",
    filed: "2026-05-23",
    natureOfSuit: "850 — Securities/Commodities/Exchange",
    natureOfSuitCode: "850",
    cause: "15:78 Securities Exchange Act of 1934",
    juryDemand: "Plaintiff",
    status: "Open",
    judge: "Hon. Renata B. Velasquez",
    parties: [
      {
        id: "pty_larsen",
        name: "Eric Larsen, on behalf of himself and all others similarly situated",
        role: "Plaintiff",
        counsel: ["Brohm Holzer Kane LLP"],
      },
      {
        id: "pty_crestmark",
        name: "Crestmark Capital LLC",
        role: "Defendant",
        counsel: ["Halberd & Quint LLP"],
      },
      {
        id: "pty_crestmark_execs",
        name: "Various executive officers of Crestmark Capital LLC",
        role: "Defendant",
        counsel: ["Halberd & Quint LLP"],
      },
    ],
    entries: [
      {
        id: "ent_l1",
        entryNumber: 1,
        dateFiled: "2026-05-23",
        type: "Complaint",
        short: "Putative class action complaint",
        description:
          "Putative class action complaint alleging that defendants violated §10(b) of the Securities Exchange Act and Rule 10b-5 by inflating Q4 2025 assets-under-management disclosures by approximately 18%. Plaintiff seeks certification of a class of all investors who purchased Crestmark interests between October 1, 2025 and May 15, 2026.",
        summaryOne:
          "Putative §10(b)/Rule 10b-5 class action — Crestmark allegedly inflated Q4 2025 AUM by ~18%.",
      },
    ],
    tags: ["Securities", "Class Action", "Hot"],
  },
  {
    id: "dkt_mdl_quantix",
    court: "E.D. Tex.",
    courtFull: "Eastern District of Texas",
    caseNumber: "2:25-md-00382",
    caseName: "In re Quantix LiDAR Patent Litigation",
    caseNameShort: "In re Quantix LiDAR",
    filed: "2026-03-30",
    natureOfSuit: "830 — Patent",
    natureOfSuitCode: "830",
    cause: "28:1407 MDL Consolidation",
    juryDemand: "Both",
    status: "Open",
    judge: "Hon. Roy S. Payne",
    parties: [
      {
        id: "pty_quantix",
        name: "Quantix Photonics Inc.",
        role: "Plaintiff",
        counsel: ["Voss Heim Khoury LLP"],
      },
      {
        id: "pty_tesla",
        name: "Tesla, Inc.",
        role: "Defendant",
        counsel: ["Yarmouth & Glade LLP"],
      },
      {
        id: "pty_waymo",
        name: "Waymo LLC",
        role: "Defendant",
        counsel: ["Calder, Bremer & Vey LLP"],
      },
      {
        id: "pty_cruise",
        name: "Cruise, LLC",
        role: "Defendant",
        counsel: ["Lyman Foss Akagi PC"],
      },
    ],
    entries: [
      {
        id: "ent_q1",
        entryNumber: 1,
        dateFiled: "2026-03-30",
        type: "Order",
        short: "Consolidation transfer order (JPML)",
        description:
          "Transfer order of the Judicial Panel on Multidistrict Litigation consolidating six related actions concerning U.S. Patent No. 10,925,001 (\"Phase-coded LiDAR pulse trains\") into MDL 2025-LIDAR-001 before the Hon. Roy S. Payne.",
        summaryOne:
          "JPML consolidates six related Quantix LiDAR patent suits into an MDL before Judge Payne.",
      },
      {
        id: "ent_q2",
        entryNumber: 9,
        dateFiled: "2026-05-23",
        type: "Notice",
        short: "Notice of joint case-management plan",
        description:
          "Notice and proposed joint case-management plan filed by plaintiffs and all defendants per Court's order of April 22, 2026. Discovery phase split into infringement-only and invalidity-only tracks.",
        summaryOne:
          "Joint case-management plan filed; discovery split into infringement-only and invalidity-only tracks.",
      },
    ],
    tags: ["Patent", "MDL", "Autonomous", "Hot"],
  },
  {
    id: "dkt_sec_v_meridian",
    court: "D.D.C.",
    courtFull: "District of Columbia",
    caseNumber: "1:25-cv-02041",
    caseName: "Securities and Exchange Commission v. Meridian Asset Mgmt Corp.",
    caseNameShort: "SEC v. Meridian",
    filed: "2026-05-15",
    natureOfSuit: "850 — Securities/Commodities/Exchange",
    natureOfSuitCode: "850",
    cause: "15:78u SEC Civil Enforcement",
    juryDemand: "None",
    status: "Open",
    judge: "Hon. Maya Patel-Brown",
    parties: [
      {
        id: "pty_sec",
        name: "U.S. Securities and Exchange Commission",
        role: "Plaintiff",
        counsel: ["SEC Enforcement Division"],
      },
      {
        id: "pty_meridian",
        name: "Meridian Asset Management Corp.",
        role: "Defendant",
        counsel: ["Crown Drexel & Associates LLP"],
      },
    ],
    entries: [
      {
        id: "ent_m1",
        entryNumber: 1,
        dateFiled: "2026-05-15",
        type: "Complaint",
        short: "Civil enforcement complaint (Advisers Act §206)",
        description:
          "Civil enforcement complaint by the SEC alleging that defendant Meridian Asset Management Corp. violated §206 of the Investment Advisers Act of 1940 by failing to disclose payments received from affiliated broker-dealers between 2022 and 2025. Disgorgement, civil penalties, and an officer-and-director bar requested.",
        summaryOne:
          "SEC alleges Meridian violated Advisers Act §206 by undisclosed affiliated-broker payments (2022–2025).",
      },
    ],
    tags: ["Securities", "Enforcement", "RIA"],
  },
];

export const SAMPLE_WATCHLISTS = [
  {
    id: "wl_apple",
    name: "Apple Inc.",
    entityType: "party" as const,
    color: "amber",
    matches: 12,
    new24h: 3,
    description: "All federal cases naming Apple Inc. or subsidiaries",
  },
  {
    id: "wl_judge_alsup",
    name: "Hon. William H. Alsup",
    entityType: "judge" as const,
    color: "navy",
    matches: 47,
    new24h: 5,
    description: "All dockets assigned to Judge Alsup (N.D. Cal.)",
  },
  {
    id: "wl_kirkland",
    name: "Kirkland & Ellis LLP",
    entityType: "lawfirm" as const,
    color: "emerald",
    matches: 218,
    new24h: 9,
    description: "All cases with K&E as counsel of record",
  },
  {
    id: "wl_securities_sdny",
    name: "Securities suits — S.D.N.Y.",
    entityType: "term" as const,
    color: "rose",
    matches: 89,
    new24h: 7,
    description: "NOS 850 in S.D.N.Y. — putative class actions and §10(b)",
  },
];

export type SampleWatchlist = (typeof SAMPLE_WATCHLISTS)[number];
