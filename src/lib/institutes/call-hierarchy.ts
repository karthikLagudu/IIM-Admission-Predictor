import type { InstituteKey, InstitutePredictionResult } from "@/types/institutes";

/**
 * Planning order supplied for cross-IIM call consistency, from easier to harder.
 * IIM Amritsar is not currently implemented by this predictor, while IIM Guwahati
 * was not present in the supplied order, so neither can be calibrated here.
 */
export const IIM_CALL_DIFFICULTY_ORDER: InstituteKey[] = [
  "IIMBG",
  "IIMSIRMAUR",
  "IIMJ",
  "IIMSAMBALPUR",
  "IIMV",
  "IIMKASHIPUR",
  "IIMRAIPUR",
  "IIMRANCHI",
  "IIMUDAIPUR",
  "IIMN",
  "IIMTRICHY",
  "IIMROHTAK",
  "IIMSHILLONG",
  "IIMI",
  "IIMK",
  "IIML",
  "IIMM",
  "IIMC",
  "IIMB",
  "IIMA",
];

export function applyCallDifficultyConsistency(
  institutes: InstitutePredictionResult[],
  iimaCallPredicted: boolean,
): InstitutePredictionResult[] {
  const rank = new Map(IIM_CALL_DIFFICULTY_ORDER.map((key, index) => [key, index]));
  const predictedKeys: InstituteKey[] = institutes
    .filter((result) => result.call.status === "PREDICTED_CALL" && result.selectionStages.interview)
    .map((result) => result.institute);

  if (iimaCallPredicted) predictedKeys.push("IIMA");

  const hardestPredicted = predictedKeys
    .map((key) => ({ key, index: rank.get(key) }))
    .filter((entry): entry is { key: InstituteKey; index: number } => entry.index != null)
    .sort((a, b) => b.index - a.index)[0];

  if (!hardestPredicted) return institutes;

  return institutes.map((result) => {
    const resultRank = rank.get(result.institute);
    const shouldPromote = resultRank != null
      && resultRank < hardestPredicted.index
      && result.eligibility.passed
      && result.selectionStages.interview
      && result.call.status === "NO_CALL"
      && result.call.benchmarkType === "MODEL";

    if (!shouldPromote) return result;

    const sourceName = hardestPredicted.key === "IIMA"
      ? "IIM Ahmedabad"
      : institutes.find((candidate) => candidate.institute === hardestPredicted.key)?.instituteName
        ?? hardestPredicted.key;
    const reason = `Call predicted after cross-IIM consistency calibration: the profile is predicted to receive a call from the harder-ranked ${sourceName}, and all official ${result.instituteName} eligibility gates are cleared. The conflicting mock benchmark was not used.`;

    return {
      ...result,
      call: {
        ...result.call,
        status: "PREDICTED_CALL",
        benchmarkType: "OFFICIAL_POLICY_REFERENCE",
        benchmarkValue: null,
        margin: null,
        reason,
      },
      strengths: [...result.strengths, reason],
      gaps: result.gaps.filter((gap) => !gap.toLowerCase().includes("testing estimate only")),
      explanation: [...result.explanation, reason],
    };
  });
}
