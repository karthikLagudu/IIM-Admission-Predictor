import type { InstituteKey } from "@/types/institutes";

export type NonIimaInstituteKey = Exclude<InstituteKey, "IIMA">;

export interface InstituteHistoricalReference {
  batch: string;
  catYear: number;
  recordLabel: string;
  boundaryLabel: string;
  studentScoreLabel: string;
  publicationNote: string;
  officialUrl?: string;
}

const UNPUBLISHED_COMPOSITE = "The institute does not publish one fixed previous-cycle composite-score boundary that can be compared safely with this profile.";

export const INSTITUTE_HISTORICAL_REFERENCES: Record<NonIimaInstituteKey, InstituteHistoricalReference> = {
  IIMB: {
    batch: "PGP 2025-27",
    catYear: 2024,
    recordLabel: "Previous PGP interview-shortlist cycle",
    boundaryLabel: "Previous minimum pre-PI score",
    studentScoreLabel: "Current pre-PI estimate",
    publicationNote: "IIM Bangalore published its admissions process, but not one final minimum pre-PI composite score for every shortlisted candidate.",
    officialUrl: "https://www.iimb.ac.in/sites/default/files/inline-files/PGP-2025-admissions-process_0.pdf",
  },
  IIMC: {
    batch: "MBA 2024-26",
    catYear: 2023,
    recordLabel: "Previous MBA interview-shortlist result",
    boundaryLabel: "Previous minimum Stage-II CS",
    studentScoreLabel: "Current Stage-II CS",
    publicationNote: "IIM Calcutta published the shortlist result, but not one category-wide minimum Stage-II composite score in advance.",
    officialUrl: "https://application.iimcal.ac.in/check-results/interview-shortlist--mba-202426-batch",
  },
  IIMBG: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMG: previousCycle("MBA 2025-27", "Previous PGP admission cycle", "Current shortlist score"),
  IIMI: previousCycle("PGP 2025-27", "Previous PGP interview-shortlist cycle", "Current shortlist score"),
  IIMJ: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMKASHIPUR: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMK: previousCycle("PGP 2025-27", "Previous PGP interview-shortlist cycle", "Current shortlist score"),
  IIML: previousCycle("MBA 2025-27", "Previous MBA interview-shortlist cycle", "Current shortlist score"),
  IIMM: previousCycle("MBA 2025-27", "Previous MBA interview-shortlist cycle", "Current shortlist score"),
  IIMN: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMRAIPUR: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMRANCHI: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMROHTAK: previousCycle("PGP 2025-27", "Previous PGP admission cycle", "Current shortlist score"),
  IIMSAMBALPUR: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMSHILLONG: previousCycle("PGP 2025-27", "Previous PGP interview-shortlist cycle", "Current shortlist score"),
  IIMSIRMAUR: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMTRICHY: previousCycle("PGPM 2025-27", "Previous PGPM admission cycle", "Current shortlist score"),
  IIMUDAIPUR: previousCycle("MBA 2025-27", "Previous MBA admission cycle", "Current shortlist score"),
  IIMV: previousCycle("PGP 2025-27", "Previous PGP admission cycle", "Current shortlist score"),
};

function previousCycle(batch: string, recordLabel: string, studentScoreLabel: string): InstituteHistoricalReference {
  return {
    batch,
    catYear: 2024,
    recordLabel,
    boundaryLabel: "Previous minimum shortlist score",
    studentScoreLabel,
    publicationNote: UNPUBLISHED_COMPOSITE,
  };
}

export function instituteHistoricalReference(institute: NonIimaInstituteKey): InstituteHistoricalReference {
  return INSTITUTE_HISTORICAL_REFERENCES[institute];
}
