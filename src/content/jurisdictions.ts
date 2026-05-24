/* ============================================================================
 *  Federal court coverage map
 *
 *  Court ids match the CourtListener slugs (`nysd`, `cand`, `ca9`, etc.) so
 *  /search?court=<id> will Just Work once that param is wired.
 *
 *  Sourced from the public CourtListener court directory. Not authoritative —
 *  if a court has a paywall-only docket system, it's still listed here.
 * ==========================================================================*/

export interface Court {
  id: string;
  short: string;
  full: string;
}

export interface CircuitGroup {
  circuit: string; // e.g. "First Circuit"
  appeals: Court; // The Court of Appeals itself
  districts: Court[];
  region: string; // for grouping ("Northeast", "South", etc.)
}

export const CIRCUITS: CircuitGroup[] = [
  {
    circuit: "First Circuit",
    region: "Northeast",
    appeals: { id: "ca1", short: "1st Cir.", full: "U.S. Court of Appeals for the First Circuit" },
    districts: [
      { id: "med", short: "D. Me.", full: "District of Maine" },
      { id: "mad", short: "D. Mass.", full: "District of Massachusetts" },
      { id: "nhd", short: "D.N.H.", full: "District of New Hampshire" },
      { id: "prd", short: "D.P.R.", full: "District of Puerto Rico" },
      { id: "rid", short: "D.R.I.", full: "District of Rhode Island" },
    ],
  },
  {
    circuit: "Second Circuit",
    region: "Northeast",
    appeals: { id: "ca2", short: "2nd Cir.", full: "U.S. Court of Appeals for the Second Circuit" },
    districts: [
      { id: "ctd", short: "D. Conn.", full: "District of Connecticut" },
      { id: "nynd", short: "N.D.N.Y.", full: "Northern District of New York" },
      { id: "nyed", short: "E.D.N.Y.", full: "Eastern District of New York" },
      { id: "nysd", short: "S.D.N.Y.", full: "Southern District of New York" },
      { id: "nywd", short: "W.D.N.Y.", full: "Western District of New York" },
      { id: "vtd", short: "D. Vt.", full: "District of Vermont" },
    ],
  },
  {
    circuit: "Third Circuit",
    region: "Mid-Atlantic",
    appeals: { id: "ca3", short: "3rd Cir.", full: "U.S. Court of Appeals for the Third Circuit" },
    districts: [
      { id: "ded", short: "D. Del.", full: "District of Delaware" },
      { id: "njd", short: "D.N.J.", full: "District of New Jersey" },
      { id: "paed", short: "E.D. Pa.", full: "Eastern District of Pennsylvania" },
      { id: "pamd", short: "M.D. Pa.", full: "Middle District of Pennsylvania" },
      { id: "pawd", short: "W.D. Pa.", full: "Western District of Pennsylvania" },
      { id: "vid", short: "D.V.I.", full: "District of the Virgin Islands" },
    ],
  },
  {
    circuit: "Fourth Circuit",
    region: "South",
    appeals: { id: "ca4", short: "4th Cir.", full: "U.S. Court of Appeals for the Fourth Circuit" },
    districts: [
      { id: "mdd", short: "D. Md.", full: "District of Maryland" },
      { id: "nced", short: "E.D.N.C.", full: "Eastern District of North Carolina" },
      { id: "ncmd", short: "M.D.N.C.", full: "Middle District of North Carolina" },
      { id: "ncwd", short: "W.D.N.C.", full: "Western District of North Carolina" },
      { id: "scd", short: "D.S.C.", full: "District of South Carolina" },
      { id: "vaed", short: "E.D. Va.", full: "Eastern District of Virginia" },
      { id: "vawd", short: "W.D. Va.", full: "Western District of Virginia" },
      { id: "wvnd", short: "N.D.W. Va.", full: "Northern District of West Virginia" },
      { id: "wvsd", short: "S.D.W. Va.", full: "Southern District of West Virginia" },
    ],
  },
  {
    circuit: "Fifth Circuit",
    region: "South",
    appeals: { id: "ca5", short: "5th Cir.", full: "U.S. Court of Appeals for the Fifth Circuit" },
    districts: [
      { id: "laed", short: "E.D. La.", full: "Eastern District of Louisiana" },
      { id: "lamd", short: "M.D. La.", full: "Middle District of Louisiana" },
      { id: "lawd", short: "W.D. La.", full: "Western District of Louisiana" },
      { id: "msnd", short: "N.D. Miss.", full: "Northern District of Mississippi" },
      { id: "mssd", short: "S.D. Miss.", full: "Southern District of Mississippi" },
      { id: "txed", short: "E.D. Tex.", full: "Eastern District of Texas" },
      { id: "txnd", short: "N.D. Tex.", full: "Northern District of Texas" },
      { id: "txsd", short: "S.D. Tex.", full: "Southern District of Texas" },
      { id: "txwd", short: "W.D. Tex.", full: "Western District of Texas" },
    ],
  },
  {
    circuit: "Sixth Circuit",
    region: "Midwest",
    appeals: { id: "ca6", short: "6th Cir.", full: "U.S. Court of Appeals for the Sixth Circuit" },
    districts: [
      { id: "kyed", short: "E.D. Ky.", full: "Eastern District of Kentucky" },
      { id: "kywd", short: "W.D. Ky.", full: "Western District of Kentucky" },
      { id: "mied", short: "E.D. Mich.", full: "Eastern District of Michigan" },
      { id: "miwd", short: "W.D. Mich.", full: "Western District of Michigan" },
      { id: "ohnd", short: "N.D. Ohio", full: "Northern District of Ohio" },
      { id: "ohsd", short: "S.D. Ohio", full: "Southern District of Ohio" },
      { id: "tned", short: "E.D. Tenn.", full: "Eastern District of Tennessee" },
      { id: "tnmd", short: "M.D. Tenn.", full: "Middle District of Tennessee" },
      { id: "tnwd", short: "W.D. Tenn.", full: "Western District of Tennessee" },
    ],
  },
  {
    circuit: "Seventh Circuit",
    region: "Midwest",
    appeals: { id: "ca7", short: "7th Cir.", full: "U.S. Court of Appeals for the Seventh Circuit" },
    districts: [
      { id: "ilcd", short: "C.D. Ill.", full: "Central District of Illinois" },
      { id: "ilnd", short: "N.D. Ill.", full: "Northern District of Illinois" },
      { id: "ilsd", short: "S.D. Ill.", full: "Southern District of Illinois" },
      { id: "innd", short: "N.D. Ind.", full: "Northern District of Indiana" },
      { id: "insd", short: "S.D. Ind.", full: "Southern District of Indiana" },
      { id: "wied", short: "E.D. Wis.", full: "Eastern District of Wisconsin" },
      { id: "wiwd", short: "W.D. Wis.", full: "Western District of Wisconsin" },
    ],
  },
  {
    circuit: "Eighth Circuit",
    region: "Midwest",
    appeals: { id: "ca8", short: "8th Cir.", full: "U.S. Court of Appeals for the Eighth Circuit" },
    districts: [
      { id: "ared", short: "E.D. Ark.", full: "Eastern District of Arkansas" },
      { id: "arwd", short: "W.D. Ark.", full: "Western District of Arkansas" },
      { id: "iand", short: "N.D. Iowa", full: "Northern District of Iowa" },
      { id: "iasd", short: "S.D. Iowa", full: "Southern District of Iowa" },
      { id: "mnd", short: "D. Minn.", full: "District of Minnesota" },
      { id: "moed", short: "E.D. Mo.", full: "Eastern District of Missouri" },
      { id: "mowd", short: "W.D. Mo.", full: "Western District of Missouri" },
      { id: "ned", short: "D. Neb.", full: "District of Nebraska" },
      { id: "ndd", short: "D.N.D.", full: "District of North Dakota" },
      { id: "sdd", short: "D.S.D.", full: "District of South Dakota" },
    ],
  },
  {
    circuit: "Ninth Circuit",
    region: "West",
    appeals: { id: "ca9", short: "9th Cir.", full: "U.S. Court of Appeals for the Ninth Circuit" },
    districts: [
      { id: "akd", short: "D. Alaska", full: "District of Alaska" },
      { id: "azd", short: "D. Ariz.", full: "District of Arizona" },
      { id: "cacd", short: "C.D. Cal.", full: "Central District of California" },
      { id: "caed", short: "E.D. Cal.", full: "Eastern District of California" },
      { id: "cand", short: "N.D. Cal.", full: "Northern District of California" },
      { id: "casd", short: "S.D. Cal.", full: "Southern District of California" },
      { id: "gud", short: "D. Guam", full: "District of Guam" },
      { id: "hid", short: "D. Haw.", full: "District of Hawaii" },
      { id: "idd", short: "D. Idaho", full: "District of Idaho" },
      { id: "mtd", short: "D. Mont.", full: "District of Montana" },
      { id: "nvd", short: "D. Nev.", full: "District of Nevada" },
      { id: "nmid", short: "D.N. Mar. I.", full: "District of the Northern Mariana Islands" },
      { id: "ord", short: "D. Or.", full: "District of Oregon" },
      { id: "waed", short: "E.D. Wash.", full: "Eastern District of Washington" },
      { id: "wawd", short: "W.D. Wash.", full: "Western District of Washington" },
    ],
  },
  {
    circuit: "Tenth Circuit",
    region: "West",
    appeals: { id: "ca10", short: "10th Cir.", full: "U.S. Court of Appeals for the Tenth Circuit" },
    districts: [
      { id: "cod", short: "D. Colo.", full: "District of Colorado" },
      { id: "ksd", short: "D. Kan.", full: "District of Kansas" },
      { id: "nmd", short: "D.N.M.", full: "District of New Mexico" },
      { id: "oked", short: "E.D. Okla.", full: "Eastern District of Oklahoma" },
      { id: "oknd", short: "N.D. Okla.", full: "Northern District of Oklahoma" },
      { id: "okwd", short: "W.D. Okla.", full: "Western District of Oklahoma" },
      { id: "utd", short: "D. Utah", full: "District of Utah" },
      { id: "wyd", short: "D. Wyo.", full: "District of Wyoming" },
    ],
  },
  {
    circuit: "Eleventh Circuit",
    region: "South",
    appeals: { id: "ca11", short: "11th Cir.", full: "U.S. Court of Appeals for the Eleventh Circuit" },
    districts: [
      { id: "almd", short: "M.D. Ala.", full: "Middle District of Alabama" },
      { id: "alnd", short: "N.D. Ala.", full: "Northern District of Alabama" },
      { id: "alsd", short: "S.D. Ala.", full: "Southern District of Alabama" },
      { id: "flmd", short: "M.D. Fla.", full: "Middle District of Florida" },
      { id: "flnd", short: "N.D. Fla.", full: "Northern District of Florida" },
      { id: "flsd", short: "S.D. Fla.", full: "Southern District of Florida" },
      { id: "gamd", short: "M.D. Ga.", full: "Middle District of Georgia" },
      { id: "gand", short: "N.D. Ga.", full: "Northern District of Georgia" },
      { id: "gasd", short: "S.D. Ga.", full: "Southern District of Georgia" },
    ],
  },
  {
    circuit: "D.C. Circuit",
    region: "Federal seat",
    appeals: { id: "cadc", short: "D.C. Cir.", full: "U.S. Court of Appeals for the D.C. Circuit" },
    districts: [
      { id: "dcd", short: "D.D.C.", full: "District of the District of Columbia" },
    ],
  },
  {
    circuit: "Federal Circuit",
    region: "Specialty",
    appeals: { id: "cafc", short: "Fed. Cir.", full: "U.S. Court of Appeals for the Federal Circuit" },
    districts: [],
  },
];

export const SUPREME: Court = {
  id: "scotus",
  short: "SCOTUS",
  full: "Supreme Court of the United States",
};

export const SPECIALTY: Court[] = [
  { id: "cit", short: "USCIT", full: "U.S. Court of International Trade" },
  { id: "tax", short: "U.S. Tax Ct.", full: "United States Tax Court" },
  { id: "cavc", short: "Vet. App.", full: "U.S. Court of Appeals for Veterans Claims" },
  { id: "cfc", short: "Fed. Cl.", full: "U.S. Court of Federal Claims" },
  { id: "uscma", short: "C.A.A.F.", full: "U.S. Court of Appeals for the Armed Forces" },
];

export const TOTALS = {
  districts: CIRCUITS.reduce((n, c) => n + c.districts.length, 0),
  circuits: CIRCUITS.length,
  appeals: CIRCUITS.length,
  specialty: SPECIALTY.length,
  // Approximate — RECAP covers most of the bankruptcy courts as well; we
  // don't enumerate all 90 here.
  bankruptcy: 90,
};
