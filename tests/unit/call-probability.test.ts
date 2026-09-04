import { describe, expect, it } from "vitest";
import { estimateInterviewCallChance } from "@/lib/institutes/call-probability";

describe("interview-call chance", () => {
  it("is 50% at the configured shortlist benchmark", () => {
    const result = estimateInterviewCallChance({ eligible: true, score: 60, maxScore: 100, benchmark: 60 });
    expect(result.probability).toBe(0.5);
    expect(result.label).toBe("50.0%");
  });

  it("rises when the shortlist score is above the benchmark", () => {
    const result = estimateInterviewCallChance({ eligible: true, score: 70, maxScore: 100, benchmark: 60 });
    expect(result.probability).toBeGreaterThan(0.5);
  });

  it("hard-gates the estimate when eligibility fails", () => {
    const result = estimateInterviewCallChance({ eligible: false, score: 80, maxScore: 100, benchmark: 60 });
    expect(result.probability).toBe(0);
    expect(result.label).toBe("0.0%");
  });

  it("does not invent a percentage without a fixed benchmark", () => {
    const result = estimateInterviewCallChance({ eligible: true, score: 80, maxScore: 100, benchmark: null, status: "ELIGIBLE_FOR_RANKING" });
    expect(result.probability).toBeNull();
    expect(result.label).toBe("Not enough data");
  });

  it("caps model-benchmark confidence to avoid false precision", () => {
    const high = estimateInterviewCallChance({ eligible: true, score: 100, maxScore: 100, benchmark: 40, benchmarkType: "MODEL" });
    const low = estimateInterviewCallChance({ eligible: true, score: 0, maxScore: 100, benchmark: 60, benchmarkType: "MODEL" });
    expect(high.probability).toBeLessThanOrEqual(0.8);
    expect(low.probability).toBeGreaterThanOrEqual(0.2);
  });

  it("shows zero call chance for direct-merit programmes without interviews", () => {
    const result = estimateInterviewCallChance({ eligible: true, score: 90, maxScore: 100, benchmark: null, directMerit: true });
    expect(result.probability).toBe(0);
    expect(result.label).toBe("0.0%");
  });
});
