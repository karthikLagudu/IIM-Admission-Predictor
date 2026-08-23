"use client";

import type { CandidateInput } from "@/types/iima";
import type { InstituteKey } from "@/types/institutes";
import { ACADEMIC_CATEGORY_LABELS, classifyDegreeForInstitutes, DEGREE_OPTIONS, estimateCat2025OverallPercentile, estimateCat2025SectionScaledScore, SAMPLE_CANDIDATE } from "@/lib/iima";
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
  const sectionalPercentile = (
    key: "catVarcPercentile" | "catDilrPercentile" | "catQaPercentile",
    raw: string,
  ) => {
    const value = raw === "" ? 0 : Number(raw);
    setCandidate((current) => {
      const next = { ...current, [key]: value };
      const varcScore = estimateCat2025SectionScaledScore(next.catVarcPercentile);
      const dilrScore = estimateCat2025SectionScaledScore(next.catDilrPercentile);
      const qaScore = estimateCat2025SectionScaledScore(next.catQaPercentile);
      const overall = Number((
        varcScore
        + dilrScore
        + qaScore
      ).toFixed(2));
      return {
        ...next,
        catVarcScaledScore: varcScore,
        catDilrScaledScore: dilrScore,
        catQaScaledScore: qaScore,
        catOverallScaledScore: overall,
        catOverallPercentile: estimateCat2025OverallPercentile(overall),
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
          <div className="field-grid">
            <div className="field">
              <label htmlFor="cat-overall">Expected overall percentile (%)</label>
              <input id="cat-overall" className="calculated-input" type="number" value={candidate.catOverallPercentile === 0 ? "" : candidate.catOverallPercentile.toFixed(2)} readOnly aria-describedby="cat-overall-help" />
              <p className="form-help" id="cat-overall-help">Automatically estimated from the three sectional percentiles. Internal scaled-score estimates are retained only for institute formulas; the official CAT scorecard may differ.</p>
            </div>
            <div className="field">
              <label htmlFor="cat-varc">VARC percentile</label>
              <input id="cat-varc" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.catVarcPercentile)} onFocus={replaceZeroOnFocus} onChange={(event) => sectionalPercentile("catVarcPercentile", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="cat-dilr">DILR percentile</label>
              <input id="cat-dilr" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.catDilrPercentile)} onFocus={replaceZeroOnFocus} onChange={(event) => sectionalPercentile("catDilrPercentile", event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="cat-qa">QA percentile</label>
              <input id="cat-qa" type="number" min="0" max="100" step="0.01" value={displayNumber(candidate.catQaPercentile)} onFocus={replaceZeroOnFocus} onChange={(event) => sectionalPercentile("catQaPercentile", event.target.value)} />
            </div>
            <div className="field field-full">
              <span>{institute === "ALL" ? "Positive raw score in every section" : institute === "IIMC" ? "Non-negative raw score in every section" : "Positive raw score in every section"}</span>
              <div className="raw-checks">
                {(["Varc", "Dilr", "Qa"] as const).map((section) => {
                  const key = `positiveRaw${section}` as keyof CandidateInput;
                  return (
                    <div className="inline-check" key={section}>
                      <input id={`raw-${section.toLowerCase()}`} type="checkbox" checked={Boolean(candidate[key])} onChange={(event) => update(key, event.target.checked as never)} />
                      <label htmlFor={`raw-${section.toLowerCase()}`}>{section.toUpperCase()}</label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
  const sectionPercentile = 99.995;
  const sectionScore = estimateCat2025SectionScaledScore(sectionPercentile);
  const overallScore = Number((sectionScore * 3).toFixed(2));
  return {
    ...SAMPLE_CANDIDATE,
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
