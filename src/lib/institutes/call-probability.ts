import type { BenchmarkType, InstituteCallStatus } from "@/types/institutes";

const CALL_CURVE_STEEPNESS = 16;

function evidenceCalibratedProbability(rawProbability: number, benchmarkType: BenchmarkType): number {
  const calibration = benchmarkType === "OFFICIAL_RESULT"
    ? { weight: 1, floor: 0.02, ceiling: 0.98 }
    : benchmarkType === "HISTORICAL"
      ? { weight: 0.8, floor: 0.05, ceiling: 0.95 }
      : { weight: 0.55, floor: 0.2, ceiling: 0.8 };
  const probability = 0.5 + (rawProbability - 0.5) * calibration.weight;
  return Math.min(calibration.ceiling, Math.max(calibration.floor, probability));
}

export interface InterviewCallChance {
  probability: number | null;
  label: string;
  detail: string;
}

export function estimateInterviewCallChance(args: {
  eligible: boolean;
  score: number | null | undefined;
  maxScore: number;
  benchmark: number | null | undefined;
  benchmarkType?: BenchmarkType;
  status?: InstituteCallStatus;
  directMerit?: boolean;
}): InterviewCallChance {
  if (args.directMerit) {
    return {
      probability: 0,
      label: "0.0%",
      detail: "This programme uses direct merit ranking and has no interview-call stage, so its interview-call chance is zero.",
    };
  }

  if (!args.eligible) {
    return {
      probability: 0,
      label: "0.0%",
      detail: "An official eligibility or CAT hard gate is not cleared, so the call estimate is hard-gated to zero.",
    };
  }

  if (args.score != null && args.benchmark != null && args.maxScore > 0) {
    const normalizedMargin = (args.score - args.benchmark) / args.maxScore;
    const rawProbability = 1 / (1 + Math.exp(-CALL_CURVE_STEEPNESS * normalizedMargin));
    const benchmarkType = args.benchmarkType ?? "MODEL";
    const probability = evidenceCalibratedProbability(rawProbability, benchmarkType);
    return {
      probability,
      label: `${(probability * 100).toFixed(1)}%`,
      detail: benchmarkType === "MODEL"
        ? "Conservative planning estimate around a model benchmark; uncertainty is deliberately pulled toward 50% because the actual shortlist boundary is unpublished."
        : "Evidence-calibrated estimate from the profile's distance above or below the shortlist benchmark; it is not an official call probability.",
    };
  }

  if (args.status === "NO_CALL") {
    return {
      probability: 0,
      label: "0.0%",
      detail: "The configured rules do not predict an interview call for this profile.",
    };
  }

  return {
    probability: null,
    label: "Not enough data",
    detail: "Official minimums alone do not reveal the category-wise interview-call boundary, so a percentage is not shown.",
  };
}
