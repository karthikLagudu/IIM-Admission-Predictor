"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CalculationMode, IimbUgCandidateInput, Programme } from "@/types/iimb-ug";
import { IIMB_UG_2027_POLICY } from "@/lib/iimb-ug/2027_31/policy";

interface CandidateFormProps {
  candidate: IimbUgCandidateInput;
  setCandidate: Dispatch<SetStateAction<IimbUgCandidateInput>>;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  targetFinalComposite: number;
  setTargetFinalComposite: (value: number) => void;
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoadExample: () => void;
}

const PROGRAMMES: Array<{ key: Programme; label: string }> = [
  { key: "DATA_SCIENCES", label: "B.Sc. (Hons) Data Sciences" },
  { key: "ECONOMICS", label: "B.Sc. (Hons) Economics" },
];

export function CandidateForm(props: CandidateFormProps) {
  const { candidate, setCandidate } = props;
  const update = <K extends keyof IimbUgCandidateInput>(key: K, value: IimbUgCandidateInput[K]) => {
    setCandidate((current) => ({ ...current, [key]: value }));
  };
  const number = (key: keyof IimbUgCandidateInput, raw: string) => {
    update(key, (raw === "" ? undefined : Number(raw)) as never);
  };
  const toggleProgramme = (programme: Programme, checked: boolean) => {
    const targets = checked
      ? [...new Set([...candidate.targetProgrammes, programme])]
      : candidate.targetProgrammes.filter((item) => item !== programme);
    setCandidate((current) => ({
      ...current,
      targetProgrammes: targets,
      firstPreference: targets.length === 2 ? current.firstPreference ?? targets[0] : targets[0],
      secondPreference: targets.length === 2 ? targets.find((item) => item !== (current.firstPreference ?? targets[0])) : undefined,
    }));
  };
  const examSections = IIMB_UG_2027_POLICY.exam.sections;

  return (
    <form className="ug-candidate-form" onSubmit={props.onSubmit} noValidate>
      <div className="ug-form-heading"><div><span>Candidate profile</span><h2>Build your planning snapshot</h2></div><button type="button" onClick={props.onLoadExample}>Load worked example</button></div>

      <fieldset>
        <legend>Programme choices</legend>
        <div className="ug-check-grid">{PROGRAMMES.map((programme) => <label className="ug-check-card" key={programme.key}><input type="checkbox" checked={candidate.targetProgrammes.includes(programme.key)} onChange={(event) => toggleProgramme(programme.key, event.target.checked)} /><span>{programme.label}</span></label>)}</div>
        {candidate.targetProgrammes.length === 2 && <div className="ug-field-grid"><label><span>First preference</span><select value={candidate.firstPreference} onChange={(event) => setCandidate((current) => ({ ...current, firstPreference: event.target.value as Programme, secondPreference: current.targetProgrammes.find((item) => item !== event.target.value) }))}>{PROGRAMMES.map((programme) => <option key={programme.key} value={programme.key}>{programme.label}</option>)}</select></label><label><span>Second preference</span><input value={PROGRAMMES.find((item) => item.key === candidate.secondPreference)?.label ?? ""} readOnly /></label></div>}
      </fieldset>

      <fieldset>
        <legend>Eligibility</legend>
        <div className="ug-field-grid">
          <label><span>Date of birth</span><input type="date" value={candidate.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} required /></label>
          <label><span>Category</span><select value={candidate.category} onChange={(event) => update("category", event.target.value as IimbUgCandidateInput["category"])}><option value="GENERAL">General</option><option value="EWS">EWS</option><option value="NC_OBC">NC-OBC</option><option value="SC">SC</option><option value="ST">ST</option></select></label>
          <label><span>Gender</span><select value={candidate.gender} onChange={(event) => update("gender", event.target.value as IimbUgCandidateInput["gender"])}><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="TRANSGENDER">Transgender</option><option value="NON_BINARY">Non-binary</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></label>
          <label><span>Gender-diversity eligibility</span><select value={candidate.genderDiversityEligibility} onChange={(event) => update("genderDiversityEligibility", event.target.value as IimbUgCandidateInput["genderDiversityEligibility"])}><option value="UNKNOWN">Unknown — show 0–5 range</option><option value="ELIGIBLE">Eligible</option><option value="NOT_ELIGIBLE">Not eligible</option></select></label>
          <label><span>Class X overall %</span><input type="number" min="0" max="100" step="0.01" value={candidate.class10OverallPercent} onChange={(event) => number("class10OverallPercent", event.target.value)} required /></label>
          <label><span>Class X Mathematics %</span><input type="number" min="0" max="100" step="0.01" value={candidate.class10MathPercent ?? ""} onChange={(event) => number("class10MathPercent", event.target.value)} /></label>
          <label><span>Class XII status</span><select value={candidate.class12Status} onChange={(event) => update("class12Status", event.target.value as IimbUgCandidateInput["class12Status"])}><option value="PASSED">Passed</option><option value="APPEARING">Appearing</option><option value="RESULT_AWAITED">Result awaited</option></select></label>
          <label><span>Class XII % (optional)</span><input type="number" min="0" max="100" step="0.01" value={candidate.class12Percent ?? ""} onChange={(event) => number("class12Percent", event.target.value)} /></label>
        </div>
        <div className="ug-inline-checks"><label><input type="checkbox" checked={candidate.studiedMathClass11} onChange={(event) => update("studiedMathClass11", event.target.checked)} /> Mathematics in Class XI</label><label><input type="checkbox" checked={candidate.studiedMathClass12} onChange={(event) => update("studiedMathClass12", event.target.checked)} /> Mathematics in Class XII</label><label><input type="checkbox" checked={candidate.pwd} onChange={(event) => update("pwd", event.target.checked)} /> PwD candidate</label></div>
      </fieldset>

      <fieldset>
        <legend>UG Admission Test attempts</legend>
        <p className="ug-form-help">Counts must total 15 for VARC, 15 for LR, and 30 for QADI. The app calculates both +1/−⅓ and equivalent +3/−1 scores.</p>
        <div className="ug-attempt-grid">
          {([
            ["VARC", "varcCorrect", "varcWrong", "varcUnattempted", examSections.VARC.questions],
            ["LR", "lrCorrect", "lrWrong", "lrUnattempted", examSections.LR.questions],
            ["QADI", "qadiCorrect", "qadiWrong", "qadiUnattempted", examSections.QADI.questions],
          ] as const).map(([label, correct, wrong, unattempted, total]) => <div key={label}><strong>{label} · {total} questions</strong><label><span>Correct</span><input aria-label={`${label} correct`} type="number" min="0" max={total} value={candidate[correct] ?? ""} onChange={(event) => number(correct, event.target.value)} /></label><label><span>Wrong</span><input aria-label={`${label} wrong`} type="number" min="0" max={total} value={candidate[wrong] ?? ""} onChange={(event) => number(wrong, event.target.value)} /></label><label><span>Unattempted</span><input aria-label={`${label} unattempted`} type="number" min="0" max={total} value={candidate[unattempted] ?? ""} onChange={(event) => number(unattempted, event.target.value)} /></label></div>)}
        </div>
        <div className="ug-field-grid"><label><span>QADI percentile (historical comparison)</span><input type="number" min="0" max="100" step="0.001" value={candidate.qadiPercentile ?? ""} onChange={(event) => number("qadiPercentile", event.target.value)} /></label><label><span>PI scenario %</span><input type="number" min="0" max="100" step="1" value={candidate.piPerformancePercent ?? ""} onChange={(event) => number("piPerformancePercent", event.target.value)} /></label></div>
      </fieldset>

      <fieldset>
        <legend>Planning controls</legend>
        <div className="ug-field-grid"><label><span>Calculation mode</span><select value={props.mode} onChange={(event) => props.setMode(event.target.value as CalculationMode)}><option value="PLANNING">Planning — transparent linear conversion</option><option value="EXACT">Exact — require official runtime statistics</option></select></label><label><span>Target final composite</span><input type="number" min="0" max="100" step="0.1" value={props.targetFinalComposite} onChange={(event) => props.setTargetFinalComposite(Number(event.target.value))} /></label></div>
      </fieldset>

      <details className="ug-readiness-inputs">
        <summary>Application document checklist</summary>
        <div className="ug-inline-checks">{([
          ["sopReady", "Statement of purpose"], ["class10DocumentReady", "Class X document"], ["class12DocumentReady", "Class XII document"], ["categoryCertificateReady", "Category certificate"], ["pwdCertificateReady", "PwD certificate"], ["udidReady", "UDID"], ["reference1Ready", "Reference 1"], ["reference2Ready", "Reference 2"],
        ] as const).map(([key, label]) => <label key={key}><input type="checkbox" checked={candidate[key] ?? false} onChange={(event) => update(key, event.target.checked)} /> {label}</label>)}</div>
      </details>

      <button className="ug-submit" type="submit" disabled={props.busy || candidate.targetProgrammes.length === 0}>{props.busy ? "Calculating…" : "Analyse my profile"}</button>
    </form>
  );
}
