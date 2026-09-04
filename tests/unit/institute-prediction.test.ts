import { describe, expect, it } from "vitest";
import { calculateInstituteSeatPrediction } from "@/lib/institutes/prediction";

describe("institute seat probability calibration", () => {
  it("keeps model-only estimates within a conservative range", () => {
    const high = calculateInstituteSeatPrediction({
      eligibilityGate: true,
      callGate: true,
      finalScore: 100,
      benchmark: { value: 40, benchmarkType: "MODEL", label: "Planning benchmark" },
    });
    const low = calculateInstituteSeatPrediction({
      eligibilityGate: true,
      callGate: true,
      finalScore: 0,
      benchmark: { value: 60, benchmarkType: "MODEL", label: "Planning benchmark" },
    });

    expect(high.probability).toBeLessThanOrEqual(0.8);
    expect(low.probability).toBeGreaterThanOrEqual(0.2);
  });

  it("still hard-gates the estimate when eligibility or call gates fail", () => {
    const result = calculateInstituteSeatPrediction({
      eligibilityGate: true,
      callGate: false,
      finalScore: 80,
      benchmark: { value: 60, benchmarkType: "MODEL", label: "Planning benchmark" },
    });

    expect(result.probability).toBe(0);
  });
});
