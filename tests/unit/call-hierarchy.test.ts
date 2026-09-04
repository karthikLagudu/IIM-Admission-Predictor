import { describe, expect, it } from "vitest";
import { SAMPLE_CANDIDATE } from "@/lib/iima";
import {
  applyCallDifficultyConsistency,
  predictAllNonIimaInstitutes,
} from "@/lib/institutes";

const strongestGeneralMaleProfile = {
  ...SAMPLE_CANDIDATE,
  category: "GENERAL" as const,
  gender: "MALE" as const,
  workExperienceMonths: 0,
  class10Percent: 100,
  class12Percent: 100,
  bachelorPercent: 100,
  catOverallPercentile: 100,
  catVarcPercentile: 100,
  catDilrPercentile: 100,
  catQaPercentile: 100,
};

describe("cross-IIM call difficulty consistency", () => {
  it("promotes eligible Sambalpur when harder Bangalore predicts a call", () => {
    const raw = predictAllNonIimaInstitutes(strongestGeneralMaleProfile, true);
    expect(raw.find((result) => result.institute === "IIMB")?.call.status).toBe("PREDICTED_CALL");
    expect(raw.find((result) => result.institute === "IIMSAMBALPUR")?.call.status).toBe("NO_CALL");

    const calibrated = applyCallDifficultyConsistency(raw, false);
    const sambalpur = calibrated.find((result) => result.institute === "IIMSAMBALPUR");

    expect(sambalpur?.call.status).toBe("PREDICTED_CALL");
    expect(sambalpur?.call.reason).toContain("IIM Bangalore");
    expect(sambalpur?.call.benchmarkValue).toBeNull();
  });

  it("never overrides an easier IIM's failed official eligibility gate", () => {
    const raw = predictAllNonIimaInstitutes({
      ...strongestGeneralMaleProfile,
      catOverallPercentile: 89,
    }, true);
    const sambalpurBefore = raw.find((result) => result.institute === "IIMSAMBALPUR");
    expect(sambalpurBefore?.eligibility.passed).toBe(false);

    const calibrated = applyCallDifficultyConsistency(raw, true);
    expect(calibrated.find((result) => result.institute === "IIMSAMBALPUR")?.call.status).toBe("NO_CALL");
  });
});
