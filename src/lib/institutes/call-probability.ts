import type { InstituteCallStatus } from "@/types/institutes";

const CALL_CURVE_STEEPNESS = 16;
const MODEL_FLOOR = 0.005;
const MODEL_CEILING = 0.995;

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
  status?: InstituteCallStatus;
  directMerit?: boolean;
}): InterviewCallChance {
  if (args.directMerit) {
    return {
      probability: null,
      label: "Not applicable",
      detail: "This programme uses direct merit ranking and does not issue an interview call.",
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
    const probability = Math.min(MODEL_CEILING, Math.max(MODEL_FLOOR, rawProbability));
    return {
      probability,
      label: `${(probability * 100).toFixed(1)}%`,
      detail: "Model estimate from the profile's distance above or below the configured shortlist benchmark; it is not an official call probability.",
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
    label: args.status === "PREDICTED_CALL" ? "Criteria met" : "Pool-dependent",
    detail: "A numeric percentage is not shown because the institute has not published a compatible fixed shortlist boundary.",
  };
}
