"use client";

import { useState } from "react";
import type { CandidateInput, IimaPolicyConfig, IimaPredictionResult } from "@/types/iima";
import type { InstitutePredictionResult } from "@/types/institutes";
import { IIMA_CAT_2025_POLICY, predictIimaAdmission } from "@/lib/iima";
import { predictAllNonIimaInstitutes } from "@/lib/institutes";
import { candidateInputSchema } from "@/lib/validation/iima";
import { CandidateForm, cloneSample, createEmptyCandidate } from "./candidate-form";
import { CombinedResultsDashboard, type CombinedPredictionResults } from "./combined-results-dashboard";

type InstituteCollectionApiResponse = {
  resultKind: "INSTITUTE_COLLECTION";
  results: InstitutePredictionResult[];
  error?: string;
  issues?: Array<{ path: string; message: string }>;
};

type IimaApiResponse = IimaPredictionResult & {
  policyConfig?: IimaPolicyConfig;
  error?: string;
  issues?: Array<{ path: string; message: string }>;
};

const MOCK_DATA_TEST_MODE = true;

function calculateLocalResults(candidate: CandidateInput, policy: IimaPolicyConfig): CombinedPredictionResults {
  return {
    IIMA: predictIimaAdmission(candidate, policy),
    institutes: predictAllNonIimaInstitutes(candidate, MOCK_DATA_TEST_MODE),
  };
}

export function PredictorWorkbench() {
  const initialCandidate = MOCK_DATA_TEST_MODE ? cloneSample() : createEmptyCandidate();
  const [candidate, setCandidate] = useState<CandidateInput>(initialCandidate);
  const [policy, setPolicy] = useState<IimaPolicyConfig>(IIMA_CAT_2025_POLICY);
  const [results, setResults] = useState<CombinedPredictionResults | null>(() => (
    MOCK_DATA_TEST_MODE ? calculateLocalResults(initialCandidate, IIMA_CAT_2025_POLICY) : null
  ));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState(0);
  const [showForm, setShowForm] = useState(true);

  const analyze = async () => {
    const validated = candidateInputSchema.safeParse(candidate);
    if (!validated.success) {
      setError(validated.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" · "));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const requests = [
        fetch("/api/iima/predict", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ candidate: validated.data }),
        }),
        fetch("/api/predict", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ institute: "ALL", candidate: validated.data, useTestModel: MOCK_DATA_TEST_MODE }),
        }),
      ];
      const responses = await Promise.all(requests);
      const payloads = await Promise.all(responses.map((response) => response.json())) as [IimaApiResponse, InstituteCollectionApiResponse];
      const failedIndex = responses.findIndex((response) => !response.ok);
      if (failedIndex >= 0) {
        const failed = payloads[failedIndex];
        throw new Error(failed.issues?.map((issue) => `${issue.path}: ${issue.message}`).join(" · ") || failed.error || "Prediction failed.");
      }
      const [iima, instituteCollection] = payloads;
      setCandidate(validated.data);
      setResults({ IIMA: iima, institutes: instituteCollection.results });
      if (iima.policyConfig) setPolicy(iima.policyConfig);
      setShowForm(false);
      setMobileStep(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    const sample = cloneSample();
    setCandidate(sample);
    setResults(calculateLocalResults(sample, policy));
    setError(null);
  };

  return (
    <div className="institute-workbench">
      <section className="panel multi-institute-intro" aria-labelledby="multi-institute-heading">
        <div>
          <span>Combined institute predictor</span>
          <strong id="multi-institute-heading">One profile for all 21 IIMs</strong>
        </div>
        <p>Enter the candidate details once to generate a separate result for every institute.</p>
      </section>
      <div className={`workspace combined-workspace ${showForm ? "form-only" : "results-only"}`}>
        {showForm && (
          <CandidateForm
            institute="ALL"
            candidate={candidate}
            setCandidate={setCandidate}
            onAnalyze={analyze}
            onLoadSample={loadSample}
            loading={loading}
            error={error}
            mobileStep={mobileStep}
            setMobileStep={setMobileStep}
          />
        )}
        {!showForm && results && (
          <CombinedResultsDashboard
            candidate={candidate}
            results={results}
            policy={policy}
            onEditDetails={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  );
}
