"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarClock, ChevronRight, ListChecks, Sparkles } from "lucide-react";
import type { CandidateInput, IimaPolicyConfig, IimaPredictionResult } from "@/types/iima";
import type { InstituteKey, InstitutePredictionResult } from "@/types/institutes";
import { formatProbability, formatScore } from "@/lib/utils";
import { callStatusLabel } from "@/lib/institutes/cat2025_2026_28/shared";
import { ResultsDashboard } from "./results-dashboard";
import { InstituteResultsDashboard } from "./institute-results-dashboard";

export interface CombinedPredictionResults {
  IIMA: IimaPredictionResult;
  institutes: InstitutePredictionResult[];
}

type ChanceBand = "HIGH" | "MEDIUM" | "LOW";

interface ResultSummary {
  key: InstituteKey;
  name: string;
  programme: string;
  status: string;
  scoreLabel: string;
  score: string;
  chanceLabel: string;
  chance: string;
  chanceBand: ChanceBand;
  tone: "positive" | "negative" | "pending";
  note: string;
  callTiming: string;
  callBasis: string;
  callBasisDetail: string;
}

function seatChanceBand(probability: number | null | undefined): ChanceBand {
  if (probability != null && probability >= 0.7) return "HIGH";
  if (probability != null && probability >= 0.4) return "MEDIUM";
  return "LOW";
}

function iimaCallTiming(result: IimaPredictionResult): string {
  return result.callPrediction
    ? "At IIMA's shortlist release · Jan–Mar 2026 planning window"
    : "No call expected from the current profile";
}

function iimaCallBasis(result: IimaPredictionResult): { short: string; detail: string } {
  const route = result.callRoute === "STAGE_1" ? "Stage 1" : result.callRoute === "STAGE_2" ? "Stage 2" : "shortlist";
  const threshold = result.applicableCallThreshold == null ? "the applicable boundary" : result.applicableCallThreshold.toFixed(6);
  const margin = result.callMargin == null ? "not available" : `${result.callMargin >= 0 ? "+" : ""}${result.callMargin.toFixed(6)}`;
  return {
    short: `CAT gates + academic profile + ${route} composite`,
    detail: `IIMA first checks degree eligibility and CAT overall/sectional cut-offs. It then applies academic-category rules, Application Rating and the ${route} Composite Score. This profile is compared with ${threshold}; its calculated margin is ${margin}.`,
  };
}

function instituteCallTiming(result: InstitutePredictionResult): string {
  if (result.selectionStages.directMerit) return "No interview call · watch the category merit-list release";
  if (result.call.status === "PREDICTED_CALL") return "At the institute shortlist release · Jan–Mar 2026 planning window";
  if (result.call.status === "NO_CALL") return "No call expected from the current profile";
  if (result.call.status === "SPECIAL_CASE_REVIEW_REQUIRED") return "After the institute completes its special-case review";
  if (result.call.status === "DATA_REQUIRED") return "After the institute publishes the required shortlist data";
  return "At the official shortlist release · timing depends on applicant-pool ranking";
}

function instituteCallBasis(result: InstitutePredictionResult): { short: string; detail: string } {
  const componentLabels = result.preInterview.components
    .filter((component) => component.score != null)
    .map((component) => component.label);
  const shortComponents = componentLabels.slice(0, 3).join(" + ") || "CAT and published eligibility gates";
  const benchmark = result.call.benchmarkValue == null
    ? "No fixed current-cycle call boundary is configured, so the final decision depends on the institute's published shortlist or applicant-pool ranking."
    : `The calculated score is compared with ${formatScore(result.call.benchmarkValue, 2)} (${result.call.benchmarkType.toLowerCase().replaceAll("_", " ")}); the margin is ${result.call.margin == null ? "not available" : `${result.call.margin >= 0 ? "+" : ""}${result.call.margin.toFixed(2)}`}.`;
  return {
    short: shortComponents,
    detail: `The institute first applies category-specific CAT overall and sectional cut-offs plus its published eligibility gates. The shortlist score uses ${componentLabels.join(", ") || "the available policy inputs"}. ${benchmark} ${result.call.reason}`,
  };
}

export function CombinedResultsDashboard({
  candidate,
  results,
  policy,
  onEditDetails,
}: {
  candidate: CandidateInput;
  results: CombinedPredictionResults;
  policy: IimaPolicyConfig;
  onEditDetails?: () => void;
}) {
  const [activeDetail, setActiveDetail] = useState<InstituteKey | null>(null);
  const [chanceFilter, setChanceFilter] = useState<"ALL" | ChanceBand>("ALL");
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const iimaChance = results.IIMA.finalSelection?.seatProbability ?? 0;
  const iimaBasis = iimaCallBasis(results.IIMA);
  const summaries: ResultSummary[] = [
    {
      key: "IIMA",
      name: "IIM Ahmedabad",
      programme: "PGP 2026-28",
      status: results.IIMA.callPrediction ? "CALL PREDICTED" : "LESS LIKELY",
      scoreLabel: "Pre-PI / shortlist score",
      score: results.IIMA.compositeScore == null ? "Not calculated" : `${formatScore(results.IIMA.compositeScore, 4)} / 1`,
      chanceLabel: "Expected seat chance (model)",
      chance: formatProbability(iimaChance),
      chanceBand: seatChanceBand(iimaChance),
      tone: results.IIMA.callPrediction ? "positive" : "negative",
      note: results.IIMA.callPrediction ? "Observed-boundary planning model" : "An official hard gate or shortlist boundary was not cleared",
      callTiming: iimaCallTiming(results.IIMA),
      callBasis: iimaBasis.short,
      callBasisDetail: iimaBasis.detail,
    },
    ...results.institutes.map((result): ResultSummary => {
      const basis = instituteCallBasis(result);
      return {
        key: result.institute,
        name: result.instituteName,
        programme: result.programme,
        status: callStatusLabel(result.call.status, result.selectionStages.directMerit),
        scoreLabel: result.scoreLabel,
        score: result.preInterview.score == null
          ? result.preInterview.status === "DATA_REQUIRED" ? "Needs cycle data" : "Not calculated"
          : `${formatScore(result.preInterview.score, 2)} / ${result.preInterview.maxScore}`,
        chanceLabel: "Expected seat chance (model)",
        chance: result.prediction.probability == null ? "Not estimated yet" : formatProbability(result.prediction.probability),
        chanceBand: seatChanceBand(result.prediction.probability),
        tone: result.call.status === "NO_CALL" ? "negative" : result.call.status === "DATA_REQUIRED" ? "pending" : "positive",
        note: result.institute === "IIMB" && result.preInterview.components.some((component) => component.sourceType === "MODEL_ASSUMPTION")
          ? "Test model; synthetic normalization inputs"
          : result.prediction.benchmarkType === "MODEL"
            ? "Test model; official score with mock planning benchmarks"
            : result.call.reason,
        callTiming: instituteCallTiming(result),
        callBasis: basis.short,
        callBasisDetail: basis.detail,
      };
    }),
  ];
  const activeSummary = summaries.find((summary) => summary.key === activeDetail) ?? null;
  const activeInstituteResult = activeDetail === "IIMA" ? null : results.institutes.find((result) => result.institute === activeDetail) ?? null;
  const filteredSummaries = chanceFilter === "ALL"
    ? summaries
    : summaries.filter((summary) => summary.chanceBand === chanceFilter);
  const chanceCounts = {
    HIGH: summaries.filter((summary) => summary.chanceBand === "HIGH").length,
    MEDIUM: summaries.filter((summary) => summary.chanceBand === "MEDIUM").length,
    LOW: summaries.filter((summary) => summary.chanceBand === "LOW").length,
  };

  useEffect(() => {
    if (!activeDetail) return;
    const frame = window.requestAnimationFrame(() => detailHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [activeDetail]);

  if (activeDetail && activeSummary) {
    return (
      <div className="institute-focus-shell" aria-live="polite">
        <div className="institute-focus-toolbar">
          <button type="button" className="focus-back-button" onClick={() => setActiveDetail(null)}>
            <ArrowLeft size={16} aria-hidden="true" />
            Back to all IIM results
          </button>
          {onEditDetails && <button type="button" className="edit-profile-button" onClick={onEditDetails}>Edit candidate details</button>}
        </div>

        <header className={`institute-report-cover ${activeSummary.tone}`}>
          <div className="report-cover-copy">
            <span className="report-cover-kicker"><Sparkles size={14} aria-hidden="true" /> {activeSummary.key} · Focused admission report</span>
            <h1 ref={detailHeadingRef} tabIndex={-1}>{activeSummary.name}</h1>
            <p>{activeSummary.programme} · Candidate-specific call and seat analysis</p>
            <div className="report-cover-status-row">
              <strong>{activeSummary.status}</strong>
              <span>Mock data active</span>
            </div>
            <small>{activeSummary.note}</small>
          </div>
          <div className="report-cover-stats" aria-label={`${activeSummary.name} key results`}>
            <div>
              <span>{activeSummary.scoreLabel}</span>
              <strong>{activeSummary.score}</strong>
            </div>
            <div>
              <span>{activeSummary.chanceLabel}</span>
              <strong>{activeSummary.chance}</strong>
            </div>
          </div>
        </header>

        <section className="report-reading-guide" aria-label="Report guide">
          <div><span>01</span><strong>Quick verdict</strong></div>
          <div><span>02</span><strong>Strengths and gaps</strong></div>
          <div><span>03</span><strong>Detailed audit</strong></div>
          <div><span>04</span><strong>Historical comparison</strong></div>
          <p>Start with the concise result below. Open <strong>More feedback</strong> only when you want the complete calculation and comparison.</p>
        </section>

        <section className="panel call-outlook-panel" aria-labelledby="call-outlook-heading">
          <div className="call-outlook-heading">
            <span>Interview-call outlook</span>
            <h2 id="call-outlook-heading">When could this student get a call—and why?</h2>
          </div>
          <div className="call-outlook-grid">
            <article>
              <CalendarClock size={21} aria-hidden="true" />
              <div>
                <span>Expected timing</span>
                <strong>{activeSummary.callTiming}</strong>
                <p>The month range is a planning estimate, not an official announcement. Always verify the institute portal and registered email.</p>
              </div>
            </article>
            <article>
              <ListChecks size={21} aria-hidden="true" />
              <div>
                <span>Basis for this result</span>
                <strong>{activeSummary.callBasis}</strong>
                <p>{activeSummary.callBasisDetail}</p>
              </div>
            </article>
          </div>
        </section>

        <section className="institute-focus-content" aria-label={`${activeDetail} detailed result`}>
          {activeDetail === "IIMA"
            ? <ResultsDashboard candidate={candidate} result={results.IIMA} policy={policy} />
            : activeInstituteResult && <InstituteResultsDashboard candidate={candidate} result={activeInstituteResult} />}
        </section>

        <button type="button" className="focus-back-button focus-back-footer" onClick={() => setActiveDetail(null)}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all IIM results
        </button>
      </div>
    );
  }

  return (
    <div className="all-results-stack" aria-live="polite">
      <section className="panel results-table-panel" aria-labelledby="all-results-heading">
        <div className="results-table-heading">
          <div>
            <h2 id="all-results-heading">Your IIM results</h2>
            <p>A clean summary of each institute. Select <strong>View more</strong> for the complete report.</p>
          </div>
          {onEditDetails && <button type="button" className="edit-profile-button" onClick={onEditDetails}>Edit candidate details</button>}
        </div>

        <div className="chance-filter-panel">
          <div className="chance-filter-copy">
            <strong>Filter by expected seat chance</strong>
            <span>High: 70%+ · Medium: 40–69.9% · Low: below 40% or not estimated</span>
          </div>
          <div className="chance-filter-list" role="group" aria-label="Filter IIMs by expected seat chance">
            <button type="button" className={chanceFilter === "ALL" ? "active all" : "all"} aria-pressed={chanceFilter === "ALL"} onClick={() => setChanceFilter("ALL")}>All <span>{summaries.length}</span></button>
            <button type="button" className={chanceFilter === "HIGH" ? "active high" : "high"} aria-pressed={chanceFilter === "HIGH"} onClick={() => setChanceFilter("HIGH")}>High <span>{chanceCounts.HIGH}</span></button>
            <button type="button" className={chanceFilter === "MEDIUM" ? "active medium" : "medium"} aria-pressed={chanceFilter === "MEDIUM"} onClick={() => setChanceFilter("MEDIUM")}>Medium <span>{chanceCounts.MEDIUM}</span></button>
            <button type="button" className={chanceFilter === "LOW" ? "active low" : "low"} aria-pressed={chanceFilter === "LOW"} onClick={() => setChanceFilter("LOW")}>Low <span>{chanceCounts.LOW}</span></button>
          </div>
        </div>

        <div className="institute-results-table-wrap">
          <table className="institute-results-table">
            <thead>
              <tr>
                <th scope="col">Institute</th>
                <th scope="col">Programme</th>
                <th scope="col">Result</th>
                <th scope="col">Pre-PI / shortlist score</th>
                <th scope="col">Expected seat chance</th>
                <th scope="col">Expected call window</th>
                <th scope="col">Call basis</th>
                <th scope="col"><span className="sr-only">Open detailed report</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredSummaries.map((summary) => (
                <tr className={summary.tone} key={summary.key}>
                  <th scope="row">
                    <span>{summary.key}</span>
                    <strong>{summary.name}</strong>
                  </th>
                  <td>{summary.programme}</td>
                  <td><span className="result-table-status">{summary.status}</span></td>
                  <td className="result-table-score">{summary.score}</td>
                  <td className="result-table-chance">
                    <span>{summary.chance}</span>
                    <small className={`seat-chance-band ${summary.chanceBand.toLowerCase()}`}>{summary.chanceBand.toLowerCase()}</small>
                  </td>
                  <td className="result-table-timing">{summary.callTiming}</td>
                  <td className="result-table-basis">{summary.callBasis}</td>
                  <td>
                    <button
                      type="button"
                      className="result-table-detail-button"
                      onClick={() => setActiveDetail(summary.key)}
                      aria-label={`View more details for ${summary.name}`}
                    >
                      <span>View more</span>
                      <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSummaries.length === 0 && (
                <tr><td className="chance-filter-empty" colSpan={8}>No IIM currently falls in this seat-chance group.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="call-window-disclaimer">Call windows are planning estimates for the CAT 2025 / 2026–28 cycle. Actual shortlist dates and decisions come only from each IIM through its official portal or registered communication channels.</p>
      </section>

    </div>
  );
}
