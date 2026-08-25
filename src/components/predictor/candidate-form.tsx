"use client";

import type { CandidateInput } from "@/types/iima";
import type { InstituteKey } from "@/types/institutes";
import { ACADEMIC_CATEGORY_LABELS, classifyDegreeForInstitutes, DEGREE_OPTIONS, estimateCat2025OverallPercentile, SAMPLE_CANDIDATE } from "@/lib/iima";
import { BookOpen, BriefcaseBusiness, ChevronLeft, ChevronRight, GraduationCap, UserRound } from "lucide-react";

interface CandidateFormProps {
  institute: InstituteKey | "ALL";
  candidate: CandidateInput;
  setCandidate: React.Dispatch<React.SetStateAction<CandidateInput>>;
  onAnalyze: () => void;
  onLoadSample: () => void;
  loading: boolean;
  error: string | null;
  mobileStep: number;
  setMobileStep: (step: number) => void;
}

const steps = ["Personal", "Academic", "Experience", "CAT"];
const displayNumber = (value: number | undefined) => value == null || value === 0 ? "" : value;

const CAT_SECTIONS = [
  {
    id: "varc",
    label: "VARC",
    maxQuestions: 24,
    correctKey: "catVarcCorrectAnswers",
    wrongKey: "catVarcWrongAnswers",
  },
  {
    id: "dilr",
    label: "DILR",
    maxQuestions: 22,
    correctKey: "catDilrCorrectAnswers",
    wrongKey: "catDilrWrongAnswers",
  },
  {
    id: "qa",
    label: "QA",
    maxQuestions: 22,
    correctKey: "catQaCorrectAnswers",
    wrongKey: "catQaWrongAnswers",
  },
] as const;

type CatSectionId = (typeof CAT_SECTIONS)[number]["id"];

export function CandidateForm({
  institute,
  candidate,
  setCandidate,
  onAnalyze,
  onLoadSample,
  loading,
  error,
  mobileStep,
  setMobileStep,
}: CandidateFormProps) {
  const instituteShortName = institute === "ALL" ? "all 21 IIMs" : institute;
  const update = <K extends keyof CandidateInput>(key: K, value: CandidateInput[K]) => {
    setCandidate((current) => ({ ...current, [key]: value }));
  };
  const number = <K extends keyof CandidateInput>(key: K, raw: string, optional = false) => {
    update(key, (optional && raw === "" ? undefined : Number(raw)) as CandidateInput[K]);
  };
  const replaceZeroOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === "0") event.currentTarget.select();
  };
  const updateCatAnswers = (sectionId: CatSectionId, answerType: "correct" | "wrong", raw: string) => {
    const section = CAT_SECTIONS.find((item) => item.id === sectionId)!;
    const requested = raw === "" ? 0 : Math.max(0, Math.floor(Number(raw)));
    setCandidate((current) => {
      const key = answerType === "correct" ? section.correctKey : section.wrongKey;
      const otherKey = answerType === "correct" ? section.wrongKey : section.correctKey;
      const otherAnswers = Number(current[otherKey] ?? 0);
      const value = Math.min(requested, section.maxQuestions - otherAnswers);
      const next: CandidateInput = { ...current, [key]: value };
      const sectionScores = CAT_SECTIONS.map((item) => {
        const correct = Number(next[item.correctKey] ?? 0);
        const wrong = Number(next[item.wrongKey] ?? 0);
        return correct * 3 - wrong;
      });
      const overall = sectionScores.reduce((total, score) => total + score, 0);
      return {
        ...next,
        catVarcScaledScore: sectionScores[0],
        catDilrScaledScore: sectionScores[1],
        catQaScaledScore: sectionScores[2],
        catVarcPercentile: estimateCat2025OverallPercentile(sectionScores[0] * 3),
        catDilrPercentile: estimateCat2025OverallPercentile(sectionScores[1] * 3),
        catQaPercentile: estimateCat2025OverallPercentile(sectionScores[2] * 3),
        catOverallScaledScore: overall,
        catOverallPercentile: estimateCat2025OverallPercentile(overall),
        positiveRawVarc: sectionScores[0] > 0,
        positiveRawDilr: sectionScores[1] > 0,
        positiveRawQa: sectionScores[2] > 0,
      };
    });
  };
  const selectDegree = (degreeName: string) => {
    const selected = DEGREE_OPTIONS.find((option) => option.value === degreeName);
    if (!selected) return;
    const classification = classifyDegreeForInstitutes(selected);
    setCandidate((current) => ({
      ...current,
      degreeName: selected.value,
      ...classification,
      professionalQualification: selected.professionalQualification ?? "NONE",
      professionalInterPercent: selected.academicCategory === "AC_2" ? current.professionalInterPercent : undefined,
      professionalFinalPercent: selected.academicCategory === "AC_2" ? current.professionalFinalPercent : undefined,
    }));
  };

  const catRows = CAT_SECTIONS.map((section) => {
    const correct = Number(candidate[section.correctKey] ?? 0);
    const wrong = Number(candidate[section.wrongKey] ?? 0);
    return {
      ...section,
      correct,
      wrong,
      attempted: correct + wrong,
      marks: correct * 3 - wrong,
    };
  });
  const catTotals = catRows.reduce((totals, row) => ({
    correct: totals.correct + row.correct,
    wrong: totals.wrong + row.wrong,
    attempted: totals.attempted + row.attempted,
    marks: totals.marks + row.marks,
  }), { correct: 0, wrong: 0, attempted: 0, marks: 0 });

  return (
    <section className="panel form-panel" aria-labelledby="candidate-form-heading">
      <div className="panel-header">
        <div>
          <h3 id="candidate-form-heading">Candidate profile</h3>
          <p>Complete the official profile and CAT inputs.</p>
        </div>
        <button type="button" className="sample-button" onClick={onLoadSample}>Load sample</button>
      </div>

      <div className="mobile-stepper" aria-label="Form steps">
        {steps.map((step, index) => (
          <span key={step} style={{ display: "contents" }}>
            {index > 0 && <span aria-hidden="true" />}
            <button
              type="button"
              aria-label={`Go to ${step}`}
              className={mobileStep === index ? "active" : ""}
              onClick={() => setMobileStep(index)}
            >
              {index + 1}
            </button>
          </span>
        ))}
      </div>

      <div className="form-body">
        <div className={`form-section ${mobileStep === 0 ? "active-mobile-step" : ""}`}>
          <div className="section-kicker"><UserRound size={14} /> Personal</div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="category">Admission category</label>
              <select id="category" value={candidate.category} onChange={(event) => update("category", event.target.value as CandidateInput["category"])}>
                <option value="GENERAL">General</option>
                <option value="EWS">EWS</option>
                <option value="NC_OBC">NC-OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={candidate.gender} onChange={(event) => update("gender", event.target.value as CandidateInput["gender"])}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="TRANSGENDER">Transgender</option>
                <option value="OTHER">Other qualifying category</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input id="dob" type="date" value={candidate.dateOfBirth ?? ""} onChange={(event) => update("dateOfBirth", event.target.value || undefined)} />
            </div>
            <div className="field">
              <span>PwD status</span>
              <div className="inline-check">
                <input id="pwd" type="checkbox" checked={candidate.pwd} onChange={(event) => update("pwd", event.target.checked)} />
                <label htmlFor="pwd">Benchmark disability (PwD)</label>
              </div>
            </div>
          </div>
        </div>

        <div className={`form-section ${mobileStep === 1 ? "active-mobile-step" : ""}`}>
          <div className="section-kicker"><GraduationCap size={14} /> Academic record</div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="class10">Class 10 percentage</label>
              <input id="class10" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.class10Percent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("class10Percent", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="class12">Class 12 percentage</label>
              <input id="class12" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.class12Percent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("class12Percent", event.target.value)} />
            </div>
            {(institute === "IIMB" || institute === "ALL") && (
              <>
                <div className="field">
                  <label htmlFor="class10-board">Class 10 board</label>
                  <select id="class10-board" value={candidate.class10Board ?? ""} onChange={(event) => update("class10Board", event.target.value || undefined)}>
                    <option value="">Select board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="CISCE">CISCE / ISC</option>
                    <option value="STATE_BOARD">State board</option>
                    <option value="INTERNATIONAL_BOARD">International board</option>
                    <option value="OTHER">Other board</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="class12-board">Class 12 board</label>
                  <select id="class12-board" value={candidate.class12Board ?? ""} onChange={(event) => update("class12Board", event.target.value || undefined)}>
                    <option value="">Select board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="CISCE">CISCE / ISC</option>
                    <option value="STATE_BOARD">State board</option>
                    <option value="INTERNATIONAL_BOARD">International board</option>
                    <option value="OTHER">Other board</option>
                  </select>
                </div>
              </>
            )}
            <div className="field field-full">
              <label htmlFor="stream">Class 12 stream</label>
              <select id="stream" value={candidate.class12Stream} onChange={(event) => update("class12Stream", event.target.value as CandidateInput["class12Stream"])}>
                <option value="SCIENCE">Science</option>
                <option value="COMMERCE">Commerce</option>
                <option value="ARTS_HUMANITIES">Arts / Humanities</option>
              </select>
            </div>
            <div className="field field-full">
              <label htmlFor="degree">Bachelor&apos;s degree / qualification</label>
              <select id="degree" value={candidate.degreeName} onChange={(event) => selectDegree(event.target.value)}>
                {(Object.keys(ACADEMIC_CATEGORY_LABELS) as CandidateInput["academicCategory"][]).map((category) => (
                  <optgroup label={ACADEMIC_CATEGORY_LABELS[category]} key={category}>
                    {DEGREE_OPTIONS.filter((option) => option.academicCategory === category).map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="form-help">This one selection automatically sets the relevant academic classification for IIMA, IIMB and IIMC.</p>
            </div>
            <div className="field">
              <label htmlFor="bachelor">Bachelor / professional %</label>
              <input id="bachelor" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.bachelorPercent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("bachelorPercent", event.target.value)} />
            </div>
            <div className="field field-full">
              <label htmlFor="professional">Professional qualification</label>
              <select id="professional" value={candidate.professionalQualification} onChange={(event) => update("professionalQualification", event.target.value as CandidateInput["professionalQualification"])}>
                <option value="NONE">None</option>
                <option value="CA">CA</option>
                <option value="ICWA">ICWA</option>
                <option value="CMA">CMA</option>
                <option value="CS">CS</option>
                <option value="FIAI">FIAI</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            {candidate.academicCategory === "AC_2" && ["CA", "ICWA", "CMA", "CS"].includes(candidate.professionalQualification) && (
              <>
                <div className="field">
                  <label htmlFor="professional-inter">Intermediate marks %</label>
                  <input id="professional-inter" type="number" min="0" max="100" value={displayNumber(candidate.professionalInterPercent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("professionalInterPercent", event.target.value, true)} />
                </div>
                <div className="field">
                  <label htmlFor="professional-final">Final marks %</label>
                  <input id="professional-final" type="number" min="0" max="100" value={displayNumber(candidate.professionalFinalPercent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("professionalFinalPercent", event.target.value, true)} />
                </div>
              </>
            )}
            {(institute === "IIMB" || institute === "ALL") && candidate.professionalQualification !== "NONE" && (
              <div className="field field-full">
                <label htmlFor="professional-aggregate">Completed professional-course marks %</label>
                <input id="professional-aggregate" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.professionalAggregatePercent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("professionalAggregatePercent", event.target.value, true)} />
                <p className="form-help">Used only when the final CA/ICWA/CMA/CS course is complete; normalization data is still required.</p>
              </div>
            )}
            <div className="field field-full">
              <span>Study status</span>
              <div className="inline-check">
                <input id="final-year" type="checkbox" checked={candidate.finalYearStudent} onChange={(event) => update("finalYearStudent", event.target.checked)} />
                <label htmlFor="final-year">Currently in the final year</label>
              </div>
            </div>
          </div>
        </div>

        <div className={`form-section ${mobileStep === 2 ? "active-mobile-step" : ""}`}>
          <div className="section-kicker"><BriefcaseBusiness size={14} /> Work experience</div>
          <div className="field-grid">
            <div className="field field-full">
              <label htmlFor="workex">Eligible completed work-experience months</label>
              <input id="workex" type="number" min="0" max="600" step="1" value={displayNumber(candidate.workExperienceMonths)} onFocus={replaceZeroOnFocus} onChange={(event) => number("workExperienceMonths", event.target.value)} />
              <p className="form-help">{institute === "ALL" ? "The engines apply each institute's own official work-experience cut-off date." : institute === "IIMC" ? "Count only eligible full-time post-bachelor work completed by the official cut-off date." : "Counted as on the official work-experience cut-off date. Rating reaches its maximum at 36 months."}</p>
            </div>
          </div>
        </div>

        <div className={`form-section ${mobileStep === 3 ? "active-mobile-step" : ""}`}>
          <div className="section-kicker"><BookOpen size={14} /> CAT</div>
          <div className="cat-score-grid-wrap">
            <table className="cat-score-grid">
              <thead>
                <tr>
                  <th scope="col">CAT section</th>
                  <th scope="col">Right answers</th>
                  <th scope="col">Wrong answers</th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Expected marks</th>
                </tr>
              </thead>
              <tbody>
                {catRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row"><strong>{row.label}</strong><span>{row.maxQuestions} questions</span></th>
                    <td>
                      <label className="sr-only" htmlFor={`cat-${row.id}-correct`}>{row.label} right answers</label>
                      <input id={`cat-${row.id}-correct`} type="number" min="0" max={row.maxQuestions - row.wrong} step="1" inputMode="numeric" value={displayNumber(row.correct)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "correct", event.target.value)} />
                    </td>
                    <td>
                      <label className="sr-only" htmlFor={`cat-${row.id}-wrong`}>{row.label} wrong answers</label>
                      <input id={`cat-${row.id}-wrong`} type="number" min="0" max={row.maxQuestions - row.correct} step="1" inputMode="numeric" value={displayNumber(row.wrong)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "wrong", event.target.value)} />
                    </td>
                    <td className="cat-calculated-cell">{row.attempted} / {row.maxQuestions}</td>
                    <td className={`cat-marks-cell ${row.marks < 0 ? "negative" : ""}`}>{row.marks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td>{catTotals.correct}</td>
                  <td>{catTotals.wrong}</td>
                  <td>{catTotals.attempted} / 68</td>
                  <td className={catTotals.marks < 0 ? "negative" : ""}>{catTotals.marks}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="cat-percentile-summary" aria-live="polite">
            <div>
              <span>Expected percentile</span>
              <small>Estimated automatically from the expected marks</small>
            </div>
            <strong>{candidate.catOverallPercentile === 0 ? "—" : `${candidate.catOverallPercentile.toFixed(2)}%`}</strong>
          </div>
          <p className="form-help cat-score-note">Marks use +3 for each right answer and −1 for each wrong answer. TITA questions with no negative marking should not be included in the wrong-answer count. The official CAT scorecard remains authoritative.</p>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-actions">
          <button className="primary-button" type="button" onClick={onAnalyze} disabled={loading}>
            {loading ? "Analysing…" : `Analyse ${instituteShortName} chances`}
          </button>
        </div>

        <div className="mobile-nav-actions">
          {mobileStep > 0 && (
            <button className="secondary-button" type="button" onClick={() => setMobileStep(mobileStep - 1)}><ChevronLeft size={14} /> Back</button>
          )}
          {mobileStep < steps.length - 1 ? (
            <button className="primary-button" type="button" onClick={() => setMobileStep(mobileStep + 1)}>Next <ChevronRight size={14} /></button>
          ) : (
            <button className="primary-button" type="button" onClick={onAnalyze} disabled={loading}>{loading ? "Analysing…" : "Analyse"}</button>
          )}
        </div>
      </div>
    </section>
  );
}

export function cloneSample(): CandidateInput {
  const sectionScore = 48;
  const sectionPercentile = estimateCat2025OverallPercentile(sectionScore * 3);
  const overallScore = sectionScore * 3;
  return {
    ...SAMPLE_CANDIDATE,
    catVarcCorrectAnswers: 16,
    catVarcWrongAnswers: 0,
    catDilrCorrectAnswers: 16,
    catDilrWrongAnswers: 0,
    catQaCorrectAnswers: 16,
    catQaWrongAnswers: 0,
    catVarcPercentile: sectionPercentile,
    catDilrPercentile: sectionPercentile,
    catQaPercentile: sectionPercentile,
    catVarcScaledScore: sectionScore,
    catDilrScaledScore: sectionScore,
    catQaScaledScore: sectionScore,
    catOverallScaledScore: overallScore,
    catOverallPercentile: estimateCat2025OverallPercentile(overallScore),
  };
}

export function createEmptyCandidate(): CandidateInput {
  return {
    category: "GENERAL",
    pwd: false,
    gender: "MALE",
    dateOfBirth: undefined,
    finalYearStudent: false,
    degreeName: "B.Tech Computer Science",
    degreeDurationYears: undefined,
    class10Percent: 0,
    class12Percent: 0,
    class12Stream: "SCIENCE",
    academicCategory: "AC_4",
    bachelorPercent: 0,
    professionalQualification: "NONE",
    workExperienceMonths: 0,
    catOverallPercentile: 0,
    catVarcPercentile: 0,
    catDilrPercentile: 0,
    catQaPercentile: 0,
    catVarcCorrectAnswers: 0,
    catVarcWrongAnswers: 0,
    catDilrCorrectAnswers: 0,
    catDilrWrongAnswers: 0,
    catQaCorrectAnswers: 0,
    catQaWrongAnswers: 0,
    catVarcScaledScore: 0,
    catDilrScaledScore: 0,
    catQaScaledScore: 0,
    catOverallScaledScore: 0,
    positiveRawVarc: false,
    positiveRawDilr: false,
    positiveRawQa: false,
    class10Board: "CBSE",
    class12Board: "CBSE",
    iimbAcademicDiscipline: "ENGINEERING_TECHNOLOGY",
    iimbAutomaticPiQualification: "UNKNOWN",
    iimbWorkExperienceQuality: 1,
    iimcAcademicProfile: "1",
    normalizedPi: 0.75,
    normalizedAwt: 0.75,
  };
}
