import { describe, expect, it } from "vitest";
import { INSTITUTE_HISTORICAL_REFERENCES, instituteHistoricalReference } from "@/lib/institutes/historical-references";

describe("institute historical references", () => {
  it("covers every non-IIMA institute in the predictor", () => {
    expect(Object.keys(INSTITUTE_HISTORICAL_REFERENCES)).toHaveLength(20);
    expect(Object.keys(INSTITUTE_HISTORICAL_REFERENCES)).toEqual(expect.arrayContaining([
      "IIMB", "IIMC", "IIMBG", "IIMG", "IIMI", "IIMJ", "IIMKASHIPUR", "IIMK", "IIML", "IIMM",
      "IIMN", "IIMRAIPUR", "IIMRANCHI", "IIMROHTAK", "IIMSAMBALPUR", "IIMSHILLONG", "IIMSIRMAUR", "IIMTRICHY", "IIMUDAIPUR", "IIMV",
    ]));
  });

  it("provides institute-specific previous-cycle context without inventing a cutoff", () => {
    const bangalore = instituteHistoricalReference("IIMB");
    const lucknow = instituteHistoricalReference("IIML");

    expect(bangalore.batch).toBe("PGP 2025-27");
    expect(bangalore.publicationNote).toContain("not one final minimum pre-PI composite score");
    expect(lucknow.batch).toBe("MBA 2025-27");
    expect(lucknow.publicationNote).toContain("does not publish one fixed previous-cycle composite-score boundary");
  });
});
