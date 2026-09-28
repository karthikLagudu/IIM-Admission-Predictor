import { describe, expect, it } from "vitest";
import { predictIimaAdmission, SAMPLE_CANDIDATE } from "@/lib/iima";

describe("master prediction orchestrator", () => {
  it("stops at basic eligibility", () => {
    const result = predictIimaAdmission({ ...SAMPLE_CANDIDATE, bachelorPercent: 40 });
    expect(result.status).toBe("NOT_ELIGIBLE");
    expect(result.callPrediction).toBe(false);
    expect(result.catEligibility).toBeNull();
    expect(result.diagnostics?.gaps.map((gap) => gap.title)).toContain("Bachelor eligibility deficit");
  });

  it("stops at CAT eligibility", () => {
    const result = predictIimaAdmission({ ...SAMPLE_CANDIDATE, catVarcPercentile: 84.99 });
    expect(result.status).toBe("CAT_CUTOFF_FAILED");
    expect(result.applicationRating).toBeNull();
    expect(result.diagnostics?.gaps).toContainEqual(expect.objectContaining({
      title: "VARC cutoff deficit",
      metric: "-0.01 pp",
    }));
    expect(result.diagnostics?.nextSteps.join(" ")).toContain("Clear every failed");
  });

  it("produces an explained Stage-1 interview call", () => {
    const result = predictIimaAdmission(SAMPLE_CANDIDATE);
    expect(result.callPrediction).toBe(true);
    expect(result.callRoute).toBe("STAGE_1");
    expect(result.status).toBe("INTERVIEW_CALL_PREDICTED");
    expect(result).not.toHaveProperty("finalSelection");
    expect(result).not.toHaveProperty("sensitivity");
    expect(result.explanation.join(" ")).toContain("Interview call prediction: YES");
    expect(result.diagnostics?.strengths.map((strength) => strength.title)).toContain("Interview call route qualified");
    expect(result.diagnostics?.gaps).toHaveLength(0);
  });

  it("uses Stage 2 when Stage 1 C3 is not met but CS clears the category threshold", () => {
    const result = predictIimaAdmission({
      ...SAMPLE_CANDIDATE,
      bachelorPercent: 84,
      catOverallScaledScore: 160,
    });
    expect(result.stage1?.predictedShortlist).toBe(false);
    expect(result.stage2?.predictedShortlist).toBe(true);
    expect(result.callRoute).toBe("STAGE_2");
    expect(result.status).toBe("INTERVIEW_CALL_PREDICTED");
    expect(result.diagnostics?.gaps).toHaveLength(0);
    expect(result.diagnostics?.strengths.map((strength) => strength.title)).toContain("Stage 2 score cushion");
  });

  it("returns a call-only negative result when no shortlist route clears", () => {
    const result = predictIimaAdmission({
      ...SAMPLE_CANDIDATE,
      bachelorPercent: 84,
      catOverallScaledScore: 80,
    });
    expect(result.callPrediction).toBe(false);
    expect(result).not.toHaveProperty("finalSelection");
    expect(result.explanation.join(" ")).toContain("Interview call prediction: NO");
    expect(result.diagnostics?.gaps.map((gap) => gap.title)).toContain("Stage 2 score deficit");
    expect(result.diagnostics?.nextSteps.join(" ")).toContain("CAT scaled points");
  });
});
