import type {
  CandidateInput,
  IimaPolicyConfig,
  IimaPredictionResult,
  PredictionStatus,
  Stage1PoolContext,
} from "@/types/iima";
import { calculateApplicationRating } from "./application-rating";
import { evaluateC2 } from "./c1-c6";
import { calculateCompositeScore, requiredCatScaledScore } from "./composite-score";
import { estimateCat2025OverallPercentile } from "./cat-percentile";
import { IIMA_CAT_2025_POLICY, SOURCE_CLASSIFICATIONS } from "./constants";
import { evaluateBasicEligibility, evaluateCatEligibility } from "./eligibility";
import { buildPredictionDiagnostics } from "./diagnostics";
import { evaluateStage1 } from "./stage1";
import { evaluateStage2 } from "./stage2";

function rejectedAtBasic(
  candidate: CandidateInput,
  policy: IimaPolicyConfig,
): IimaPredictionResult {
  const basicEligibility = evaluateBasicEligibility(candidate, policy);
  return {
    policyVersion: policy.version,
    admissionCycle: policy.admissionCycle,
    basicEligibility,
    catEligibility: null,
    applicationRating: null,
    academicConsistency: null,
    compositeScore: null,
    stage1: null,
    stage2: null,
    callPrediction: false,
    callRoute: null,
    applicableCallThreshold: null,
    callMargin: null,
    requiredCatScaledScore: null,
    status: "NOT_ELIGIBLE",
    explanation: [
      "Basic eligibility failed.",
      ...basicEligibility.reasons,
      "An interview call cannot be predicted after a failed hard gate.",
    ],
    sourceClassifications: { ...SOURCE_CLASSIFICATIONS },
  };
}

function predictCore(
  candidate: CandidateInput,
  policy: IimaPolicyConfig,
  poolContext?: Stage1PoolContext,
): IimaPredictionResult {
  const basicEligibility = evaluateBasicEligibility(candidate, policy);
  if (!basicEligibility.passed) return rejectedAtBasic(candidate, policy);

  const catEligibility = evaluateCatEligibility(candidate, policy);
  if (!catEligibility.catEligible) {
    const failed = [
      !catEligibility.overallPass && "overall percentile",
      !catEligibility.varcPass && "VARC",
      !catEligibility.dilrPass && "DILR",
      !catEligibility.qaPass && "QA",
      !catEligibility.positiveRawScoresPass && "positive raw scores",
    ]
      .filter(Boolean)
      .join(", ");
    return {
      policyVersion: policy.version,
      admissionCycle: policy.admissionCycle,
      basicEligibility,
      catEligibility,
      applicationRating: null,
      academicConsistency: null,
      compositeScore: null,
      stage1: null,
      stage2: null,
      callPrediction: false,
      callRoute: null,
      applicableCallThreshold: null,
      callMargin: null,
      requiredCatScaledScore: null,
      status: "CAT_CUTOFF_FAILED",
      explanation: [
        "Basic eligibility is satisfied.",
        `CAT screening failed: ${failed}.`,
        "No later-stage score can override a failed CAT hard gate.",
      ],
      sourceClassifications: { ...SOURCE_CLASSIFICATIONS },
    };
  }

  const applicationRating = calculateApplicationRating(candidate, policy);
  const academicConsistency = evaluateC2(candidate, policy);
  const compositeScore = calculateCompositeScore(
    applicationRating.total,
    candidate.catOverallScaledScore,
    policy,
  );
  const stage1 = evaluateStage1({
    candidate,
    applicationRating,
    catEligibility,
    compositeScore,
    policy,
    poolContext,
    c2: academicConsistency,
  });
  const stage2 = stage1.predictedShortlist
    ? null
    : evaluateStage2({
        candidate,
        catEligibility,
        compositeScore,
        policy,
        c2: academicConsistency,
      });
  const callRoute = stage1.predictedShortlist
    ? "STAGE_1"
    : stage2?.predictedShortlist
      ? "STAGE_2"
      : null;
  const callPrediction = callRoute != null;
  const applicableCallThreshold =
    callRoute === "STAGE_1" ? stage1.threshold : (stage2?.threshold ?? null);
  const callMargin =
    applicableCallThreshold == null ? null : compositeScore - applicableCallThreshold;
  const stage2Threshold = policy.stage2Thresholds[
    candidate.pwd ? `PWD_${candidate.category}` : candidate.category
  ];
  const requiredCat = requiredCatScaledScore(
    applicationRating.total,
    stage2Threshold,
    candidate.catOverallScaledScore,
    policy,
  );
  let status: PredictionStatus;
  if (!callPrediction) {
    status = !academicConsistency.passed ? "ACADEMIC_GATE_FAILED" : "STAGE_2_NOT_QUALIFIED";
  } else {
    status = "INTERVIEW_CALL_PREDICTED";
  }

  const explanation = [
    "Basic degree eligibility and CAT hard gates are satisfied.",
    `Class 10/12 average is ${academicConsistency.average.toFixed(2)}% against ${academicConsistency.required?.toFixed(2)}%.`,
    `Application Rating is ${applicationRating.total.toFixed(1)}/${policy.arNormalizationDenominator}.`,
    `Composite Score is ${compositeScore.toFixed(6)}.`,
    stage1.reason,
  ];
  if (stage2) explanation.push(stage2.reason);
  if (callPrediction) {
    explanation.push(`Interview call prediction: YES via ${callRoute === "STAGE_1" ? "Stage 1" : "Stage 2"}.`);
  } else {
    explanation.push("Interview call prediction: NO. The current profile does not clear an available shortlist route.");
  }
  return {
    policyVersion: policy.version,
    admissionCycle: policy.admissionCycle,
    basicEligibility,
    catEligibility,
    applicationRating,
    academicConsistency,
    compositeScore,
    stage1,
    stage2,
    callPrediction,
    callRoute,
    applicableCallThreshold,
    callMargin,
    requiredCatScaledScore: requiredCat,
    status,
    explanation,
    sourceClassifications: { ...SOURCE_CLASSIFICATIONS },
  };
}

export function predictIimaAdmission(
  candidate: CandidateInput,
  policy: IimaPolicyConfig = IIMA_CAT_2025_POLICY,
  poolContext?: Stage1PoolContext,
): IimaPredictionResult {
  const result = predictCore(candidate, policy, poolContext);
  return { ...result, diagnostics: buildPredictionDiagnostics(candidate, result, policy) };
}

export const SAMPLE_CANDIDATE: CandidateInput = {
  category: "GENERAL",
  pwd: false,
  gender: "MALE",
  dateOfBirth: "2003-05-12",
  finalYearStudent: false,
  degreeName: "B.Tech Computer Science",
  degreeDurationYears: 4,
  class10Percent: 92,
  class10Board: "CBSE",
  class12Percent: 90,
  class12Board: "CBSE",
  class12Stream: "SCIENCE",
  academicCategory: "AC_4",
  bachelorPercent: 86,
  professionalQualification: "NONE",
  workExperienceMonths: 24,
  iimbAcademicDiscipline: "ENGINEERING_TECHNOLOGY",
  iimbAutomaticPiQualification: "UNKNOWN",
  iimbWorkExperienceQuality: 1,
  iimcAcademicProfile: "1",
  catOverallPercentile: estimateCat2025OverallPercentile(150),
  catVarcPercentile: 95,
  catDilrPercentile: 95,
  catQaPercentile: 95,
  catVarcScaledScore: 50,
  catDilrScaledScore: 50,
  catQaScaledScore: 50,
  catOverallScaledScore: 150,
  positiveRawVarc: true,
  positiveRawDilr: true,
  positiveRawQa: true,
};
