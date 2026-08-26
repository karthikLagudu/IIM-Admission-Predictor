"use client";

import type { CandidateInput } from "@/types/iima";
import type { InstituteKey } from "@/types/institutes";
import { ACADEMIC_CATEGORY_LABELS, calculateCatSectionProjection, classifyDegreeForInstitutes, DEGREE_OPTIONS, estimateCat2025OverallPercentile, SAMPLE_CANDIDATE } from "@/lib/iima";
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
    mcqCorrectKey: "catVarcCorrectAnswers",
    mcqWrongKey: "catVarcWrongAnswers",
    titaCorrectKey: "catVarcCorrectTitaAnswers",
    titaWrongKey: "catVarcWrongTitaAnswers",
    percentileKey: "catVarcPercentile",
  },
  {
    id: "dilr",
    label: "DILR",
    maxQuestions: 22,
    mcqCorrectKey: "catDilrCorrectAnswers",
    mcqWrongKey: "catDilrWrongAnswers",
    titaCorrectKey: "catDilrCorrectTitaAnswers",
    titaWrongKey: "catDilrWrongTitaAnswers",
    percentileKey: "catDilrPercentile",
  },
  {
    id: "qa",
    label: "QA",
    maxQuestions: 22,
    mcqCorrectKey: "catQaCorrectAnswers",
    mcqWrongKey: "catQaWrongAnswers",
    titaCorrectKey: "catQaCorrectTitaAnswers",
    titaWrongKey: "catQaWrongTitaAnswers",
    percentileKey: "catQaPercentile",
  },
] as const;

type CatSectionId = (typeof CAT_SECTIONS)[number]["id"];
type CatAnswerType = "mcqCorrect" | "mcqWrong" | "titaCorrect" | "titaWrong";

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
  const analyzeLabel = institute === "ALL"
    ? "Want to know your expected CAT percentile and analyse all 21 IIM chances?"
    : `Analyse ${institute} chances`;
  const update = <K extends keyof CandidateInput>(key: K, value: CandidateInput[K]) => {
    setCandidate((current) => ({ ...current, [key]: value }));
  };
  const number = <K extends keyof CandidateInput>(key: K, raw: string, optional = false) => {
    update(key, (optional && raw === "" ? undefined : Number(raw)) as CandidateInput[K]);
  };
  const replaceZeroOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === "0") event.currentTarget.select();
  };
  const updateCatAnswers = (sectionId: CatSectionId, answerType: CatAnswerType, raw: string) => {
    const section = CAT_SECTIONS.find((item) => item.id === sectionId)!;
    const requested = raw === "" ? 0 : Math.max(0, Math.floor(Number(raw)));
    setCandidate((current) => {
      const answerKeys = {
        mcqCorrect: section.mcqCorrectKey,
        mcqWrong: section.mcqWrongKey,
        titaCorrect: section.titaCorrectKey,
        titaWrong: section.titaWrongKey,
      } as const;
      const key = answerKeys[answerType];
      const otherAnswers = Object.values(answerKeys)
        .filter((answerKey) => answerKey !== key)
        .reduce((total, answerKey) => total + Number(current[answerKey] ?? 0), 0);
      const value = Math.min(requested, Math.max(0, section.maxQuestions - otherAnswers));
      const next: CandidateInput = { ...current, [key]: value };
      const sectionScores = CAT_SECTIONS.map((item) => {
        return calculateCatSectionProjection({
          mcqCorrect: Number(next[item.mcqCorrectKey] ?? 0),
          mcqWrong: Number(next[item.mcqWrongKey] ?? 0),
          titaCorrect: Number(next[item.titaCorrectKey] ?? 0),
          titaWrong: Number(next[item.titaWrongKey] ?? 0),
        }).marks;
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
    const projection = calculateCatSectionProjection({
      mcqCorrect: Number(candidate[section.mcqCorrectKey] ?? 0),
      mcqWrong: Number(candidate[section.mcqWrongKey] ?? 0),
      titaCorrect: Number(candidate[section.titaCorrectKey] ?? 0),
      titaWrong: Number(candidate[section.titaWrongKey] ?? 0),
    });
    return {
      ...section,
      ...projection,
      percentile: candidate[section.percentileKey],
    };
  });
  const catTotals = catRows.reduce((totals, row) => ({
    mcqCorrect: totals.mcqCorrect + row.mcqCorrect,
    mcqWrong: totals.mcqWrong + row.mcqWrong,
    titaCorrect: totals.titaCorrect + row.titaCorrect,
    titaWrong: totals.titaWrong + row.titaWrong,
    attempted: totals.attempted + row.attempted,
    marks: totals.marks + row.marks,
  }), { mcqCorrect: 0, mcqWrong: 0, titaCorrect: 0, titaWrong: 0, attempted: 0, marks: 0 });

  return (
    <section className="panel form-panel" aria-labelledby="candidate-form-heading">
      <div className="panel-header">
        <div>
          <h3 id="candidate-form-heading">Candidate profile</h3>
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
            </div>
            <div className="field">
              <label htmlFor="bachelor">Bachelor / professional %</label>
              <input id="bachelor" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.bachelorPercent)} onFocus={replaceZeroOnFocus} onChange={(event) => number("bachelorPercent", event.target.value)} />
            </div>
            <div className="field">
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
              <p className="form-help"><span className="required-star" aria-hidden="true">*</span>{institute === "ALL" ? "The engines apply each institute's own official work-experience cut-off date." : institute === "IIMC" ? "Count only eligible full-time post-bachelor work completed by the official cut-off date." : "Counted as on the official work-experience cut-off date. Rating reaches its maximum at 36 months."}</p>
            </div>
          </div>
        </div>

        <div className={`form-section ${mobileStep === 3 ? "active-mobile-step" : ""}`}>
          <div className="section-kicker"><BookOpen size={14} /> CAT Percentile Predictor</div>
          <div className="cat-marking-key" aria-label="CAT marking scheme">
            <span><strong>68</strong> questions · <strong>204</strong> marks</span>
            <span>Correct MCQ <strong>+3</strong></span>
            <span>Wrong MCQ <strong>−1</strong></span>
            <span>Correct TITA <strong>+3</strong></span>
            <span>Wrong TITA / unattempted <strong>0</strong></span>
          </div>
          <div className="cat-score-grid-wrap">
            <table className="cat-score-grid">
              <thead>
                <tr>
                  <th scope="col">CAT section</th>
                  <th scope="col">MCQ <span>+3 / −1</span></th>
                  <th scope="col">TITA <span>+3 / 0</span></th>
                  <th scope="col">Attempted</th>
                  <th scope="col">Expected marks</th>
                  <th scope="col">Sectional percentile</th>
                </tr>
              </thead>
              <tbody>
                {catRows.map((row) => (
                  <tr key={row.id}>
                    <th scope="row"><strong>{row.label}</strong><span>{row.maxQuestions} questions</span></th>
                    <td>
                      <div className="cat-answer-pair">
                        <label htmlFor={`cat-${row.id}-mcq-correct`}><span>Right</span><input id={`cat-${row.id}-mcq-correct`} type="number" min="0" max={row.maxQuestions - (row.attempted - row.mcqCorrect)} step="1" inputMode="numeric" value={displayNumber(row.mcqCorrect)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "mcqCorrect", event.target.value)} /></label>
                        <label htmlFor={`cat-${row.id}-mcq-wrong`}><span>Wrong</span><input id={`cat-${row.id}-mcq-wrong`} type="number" min="0" max={row.maxQuestions - (row.attempted - row.mcqWrong)} step="1" inputMode="numeric" value={displayNumber(row.mcqWrong)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "mcqWrong", event.target.value)} /></label>
                      </div>
                    </td>
                    <td>
                      <div className="cat-answer-pair">
                        <label htmlFor={`cat-${row.id}-tita-correct`}><span>Right</span><input id={`cat-${row.id}-tita-correct`} type="number" min="0" max={row.maxQuestions - (row.attempted - row.titaCorrect)} step="1" inputMode="numeric" value={displayNumber(row.titaCorrect)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "titaCorrect", event.target.value)} /></label>
                        <label htmlFor={`cat-${row.id}-tita-wrong`}><span>Wrong</span><input id={`cat-${row.id}-tita-wrong`} type="number" min="0" max={row.maxQuestions - (row.attempted - row.titaWrong)} step="1" inputMode="numeric" value={displayNumber(row.titaWrong)} onFocus={replaceZeroOnFocus} onChange={(event) => updateCatAnswers(row.id, "titaWrong", event.target.value)} /></label>
                      </div>
                    </td>
                    <td className="cat-calculated-cell">{row.attempted} / {row.maxQuestions}</td>
                    <td className={`cat-marks-cell ${row.marks < 0 ? "negative" : ""}`}>{row.marks}</td>
                    <td className="cat-percentile-cell">{row.percentile === 0 ? "—" : `${row.percentile.toFixed(2)}%`}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td><span className="cat-total-pair"><b>{catTotals.mcqCorrect} right</b><b>{catTotals.mcqWrong} wrong</b></span></td>
                  <td><span className="cat-total-pair"><b>{catTotals.titaCorrect} right</b><b>{catTotals.titaWrong} wrong</b></span></td>
                  <td>{catTotals.attempted} / 68</td>
                  <td className={catTotals.marks < 0 ? "negative" : ""}>{catTotals.marks}</td>
                  <td>—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-actions">
          <button className="primary-button analyze-all-button" type="button" onClick={onAnalyze} disabled={loading}>
            {loading ? "Analysing…" : analyzeLabel}
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
    catVarcCorrectTitaAnswers: 0,
    catVarcWrongTitaAnswers: 0,
    catDilrCorrectAnswers: 16,
    catDilrWrongAnswers: 0,
    catDilrCorrectTitaAnswers: 0,
    catDilrWrongTitaAnswers: 0,
    catQaCorrectAnswers: 16,
    catQaWrongAnswers: 0,
    catQaCorrectTitaAnswers: 0,
    catQaWrongTitaAnswers: 0,
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
    catVarcCorrectTitaAnswers: 0,
    catVarcWrongTitaAnswers: 0,
    catDilrCorrectAnswers: 0,
    catDilrWrongAnswers: 0,
    catDilrCorrectTitaAnswers: 0,
    catDilrWrongTitaAnswers: 0,
    catQaCorrectAnswers: 0,
    catQaWrongAnswers: 0,
    catQaCorrectTitaAnswers: 0,
    catQaWrongTitaAnswers: 0,
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
