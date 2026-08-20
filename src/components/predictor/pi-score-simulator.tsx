"use client";

import { useEffect, useId, useState } from "react";
import { RotateCcw } from "lucide-react";
import { formatProbability, formatScore, humanize } from "@/lib/utils";

export interface PiSimulationResult {
  piPoints: number;
  finalScore: number | null;
  seatProbability: number | null;
  band: string | null;
}

export function PiScoreSimulator({
  instituteName,
  simulatorKey,
  initialPercent,
  piMaxScore,
  finalMaxScore,
  scorePrecision = 2,
  benchmarkLabel,
  simulate,
  unavailableReason,
}: {
  instituteName: string;
  simulatorKey: string;
  initialPercent: number;
  piMaxScore: number;
  finalMaxScore: number;
  scorePrecision?: number;
  benchmarkLabel: string;
  simulate: (piPercent: number) => PiSimulationResult;
  unavailableReason?: string;
}) {
  const [piPercent, setPiPercent] = useState(initialPercent);
  const sliderId = useId();
  const inputId = useId();

  useEffect(() => setPiPercent(initialPercent), [initialPercent, simulatorKey]);

  const updatePi = (value: number) => {
    if (!Number.isFinite(value)) return;
    setPiPercent(Math.min(100, Math.max(0, value)));
  };
  const scenario = simulate(piPercent);

  return (
    <section className="panel pi-simulator" aria-labelledby={`${sliderId}-heading`}>
      <div className="pi-simulator-heading">
        <div>
          <span>Interactive final-selection simulator</span>
          <h3 id={`${sliderId}-heading`}>Try a different PI score for {instituteName}</h3>
          <p>Move the slider or type a PI performance from 0 to 100. Results update immediately.</p>
        </div>
        <button type="button" onClick={() => setPiPercent(initialPercent)}>
          <RotateCcw size={14} aria-hidden="true" /> Reset
        </button>
      </div>

      {unavailableReason ? (
        <div className="pi-simulator-unavailable"><strong>Numeric PI simulation is not available for this result.</strong><span>{unavailableReason}</span></div>
      ) : (
        <>
          <div className="pi-simulator-controls">
            <div className="pi-slider-field">
              <label htmlFor={sliderId}>PI performance</label>
              <input id={sliderId} type="range" min="0" max="100" step="1" value={piPercent} onChange={(event) => updatePi(Number(event.target.value))} />
              <div><span>0</span><strong>{piPercent.toFixed(0)}%</strong><span>100</span></div>
            </div>
            <div className="pi-number-field">
              <label htmlFor={inputId}>Type PI score (%)</label>
              <div><input id={inputId} type="number" inputMode="decimal" min="0" max="100" step="1" value={piPercent} onFocus={(event) => event.currentTarget.select()} onChange={(event) => updatePi(Number(event.target.value))} /><span>/ 100</span></div>
            </div>
          </div>

          <div className="pi-simulator-results" aria-live="polite">
            <article><span>PI contribution</span><strong>{formatScore(scenario.piPoints, 2)} / {formatScore(piMaxScore, 0)}</strong><small>Uses this IIM&apos;s PI weight</small></article>
            <article><span>Recalculated final score</span><strong>{scenario.finalScore == null ? "Needs other data" : `${formatScore(scenario.finalScore, scorePrecision)} / ${formatScore(finalMaxScore, scorePrecision)}`}</strong><small>All non-PI inputs stay unchanged</small></article>
            <article><span>Estimated seat chance</span><strong className={scenario.seatProbability === 0 ? "simulator-negative" : ""}>{scenario.seatProbability == null ? "Not estimated" : formatProbability(scenario.seatProbability)}</strong><small>{scenario.band == null ? benchmarkLabel : humanize(scenario.band)}</small></article>
          </div>
          <p className="pi-simulator-note"><strong>Scenario only:</strong> this does not alter the saved profile. PI affects final selection only after the candidate receives and attends an interview; it cannot override failed eligibility or shortlist gates. {benchmarkLabel}</p>
        </>
      )}
    </section>
  );
}
