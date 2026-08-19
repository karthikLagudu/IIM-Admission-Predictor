import { IIMA_CAT_2025_POLICY } from "@/lib/iima/constants";
import { SourceBadge } from "@/components/ui/source-badge";
import { humanize } from "@/lib/utils";

const policy = IIMA_CAT_2025_POLICY;
const modelWeights = policy.model.benchmarkRecencyWeights;
const modelWeightTotal = modelWeights.reduce((sum, weight) => sum + weight, 0);

export default function MethodologyPage() {
  return (
    <>
      <section className="page-hero"><div className="shell"><p className="eyebrow">Methodology & sources</p><h1 className="page-title">What is official—and what is predictive</h1><p>Every value is classified. The rules engine uses deterministic IIMA policy where it exists; only the unpublished final conversion boundary is modelled.</p></div></section>
      <section className="content-section">
        <div className="shell methodology-layout">
          <nav className="panel method-nav" aria-label="Methodology sections">
            <a href="#pipeline">Pipeline</a><a href="#iimb">IIM Bangalore</a><a href="#iimc">IIM Calcutta</a><a href="#eligibility">IIMA eligibility & CAT</a><a href="#ar">IIMA Application Rating</a><a href="#shortlist">IIMA Stage 1 & 2</a><a href="#final">IIMA final selection</a><a href="#model">IIMA predictive model</a><a href="#sources">Source register</a>
          </nav>
          <div className="method-content">
            <article className="panel method-card" id="pipeline">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>Gated admission pipeline</h2>
              <p>The predictor never infers a seat from CAT percentile alone. It evaluates basic eligibility, CAT minima, Academic Category, Application Rating, academic consistency, Stage 1, Stage 2, AWT/PI, FCS and only then a final probability.</p>
              <div className="formula">Eligibility → CAT screen → Academic Category → AR → CS → Stage 1 / Stage 2 → AWT + PI → FCS → category merit → seat availability</div>
            </article>

            <article className="panel method-card" id="iimb">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>IIM Bangalore · PGP 2026-28</h2>
              <p>The engine first applies the official degree and CAT 2025 first-shortlist minimums. Passing these floors does not itself predict a WAT/PI call.</p>
              <div className="formula">Pre-PI = CAT 55 + Class 10 10 + Class 12 10 + Bachelor 10 + max(Work experience, Professional course) 10 + Gender diversity 5</div>
              <p>IIMB standardizes CAT sections and academic components within the qualifying applicant pool. Class 10 and 12 also require board-specific 90th-percentile values. Those private cycle statistics are never guessed: when they are unavailable, the result is <strong>DATA_REQUIRED</strong> and the application lists every missing dataset.</p>
              <div className="formula">Std(val, mean, sd, wt) = max(0, min(wt, wt/2 + ((val - mean)/sd) × wt/6))</div>
              <div className="notice"><strong>No permanent current call/final cutoff is hard-coded.</strong> Top-10 automatic PI routes require an externally verified result or complete applicant-pool rank data. <a href="https://www.iimb.ac.in/admissions/pgp-admissions/admission-process" target="_blank" rel="noreferrer">Official IIMB admission process</a>.</div>
            </article>

            <article className="panel method-card" id="iimc">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>IIM Calcutta · MBA 2026-28</h2>
              <p>The Stage-I engine applies the official category-wise CAT percentile floors and the non-negative raw-score requirement. It then calculates the complete 85-point PI/WAT ranking score.</p>
              <div className="formula">Shortlist score = (CAT total scaled / CAT 2025 maximum possible total) × 56 + Class 10 points + Class 12 points + Gender diversity</div>
              <p>Class 10 and 12 use the published slab tables; female and transgender candidates receive four gender-diversity points. Because IIMC decides category-wise Stage-II cutoffs after seeing the applicant pool, policy-only results are labelled <strong>ELIGIBLE_FOR_RANKING</strong>, not a fabricated call.</p>
              <div className="formula">Final = CAT 30 + PI 48 + WAT 8 + Academic diversity 6 + Work experience 8</div>
              <div className="notice"><strong>Official policy alone cannot produce a seat percentage without a call gate and final benchmark.</strong> While mock mode is active, the application shows a clearly labelled model estimate using configurable planning benchmarks; it must not be read as an official IIMC probability. <a href="https://www.iimcal.ac.in/programs/pgp/admission/admission-policy/admission-procedure-for-domestic-candidates" target="_blank" rel="noreferrer">Official IIMC admission policy</a>.</div>
            </article>

            <article className="panel method-card" id="eligibility">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>Eligibility and CAT hard gates</h2>
              <p>Bachelor marks must be at least 50% for General/EWS/NC-OBC and 45% for SC/ST/PwD. The source policy also records a three-year degree duration, age 19 on 30 June 2026, and provisional final-year deadlines.</p>
              <table className="policy-table"><thead><tr><th>Candidate group</th><th>Overall</th><th>VARC</th><th>DILR</th><th>QA</th></tr></thead><tbody>
                {Object.entries(policy.catCutoffs).map(([key, cutoff]) => <tr key={key}><td>{humanize(key)}</td><td>{cutoff.overall}</td><td>{cutoff.varc}</td><td>{cutoff.dilr}</td><td>{cutoff.qa}</td></tr>)}
              </tbody></table>
              <p>All three sections must also have positive raw scores. A failed hard gate forces call and seat probability to zero.</p>
            </article>

            <article className="panel method-card" id="ar">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>Application Rating</h2>
              <div className="formula">AR = Class 10 (10) + Class 12 (10) + Bachelor / Professional (10) + Work experience (5) + Gender diversity (3)</div>
              <p>Class 12 bands depend on Science, Commerce or Arts/Humanities. Bachelor bands differ across every Academic Category. AC-2 professional marks use the special IIMA percentage method where inputs are available.</p>
              <h3>Work-experience function</h3>
              <div className="formula">D = 0 if W &lt; 12; 0.20 × (W − 11) if 12 ≤ W ≤ 36; 5 if W &gt; 36</div>
            </article>

            <article className="panel method-card" id="shortlist">
              <SourceBadge source="OFFICIAL_OBSERVED_RESULT" /><h2>Shortlisting Composite Score</h2>
              <div className="formula">CS = 0.35 × (AR / 38) + 0.65 × (CAT scaled score / 204)</div>
              <h3>Stage 1 — discipline-sensitive</h3>
              <p>The ACRC route requires C1 + C2 + C3 and the relevant top-5% / upper-limit condition. Small Academic Categories use C4 + C5 + C6 and the smaller of top 100 or top 5%. Published CAT-2025 observed AC/category minimum CS values are used when available; a missing observation is never treated as zero.</p>
              <h3>Stage 2 — category-wise additional shortlist</h3>
              <p>Stage 2 requires C1 + C2 and CS at or above the actual observed CAT-2025 category boundary.</p>
              <table className="policy-table"><thead><tr><th>Group</th><th>Minimum CS</th><th>Classification</th></tr></thead><tbody>
                {Object.entries(policy.stage2Thresholds).map(([key, value]) => <tr key={key}><td>{humanize(key)}</td><td>{value.toFixed(6)}</td><td><SourceBadge source="OFFICIAL_OBSERVED_RESULT" /></td></tr>)}
              </tbody></table>
            </article>

            <article className="panel method-card" id="final">
              <SourceBadge source="OFFICIAL_POLICY" /><h2>Final Composite Score</h2>
              <div className="formula">FCS = 0.50 × Normalized PI + 0.10 × Normalized AWT + 0.25 × Normalized CAT + 0.15 × Normalized AR</div>
              <div className="notice"><strong>Official current final cutoff: Not published.</strong><br />IIMA publishes the score formula but does not pre-publish a fixed category-wise CAT-2025 final FCS guarantee. The actual outcome depends on category merit, interview performance, reservation, offers and seat availability.</div>
            </article>

            <article className="panel method-card" id="model">
              <SourceBadge source="MODEL_ASSUMPTION" /><h2>Three-cycle calibrated probability model</h2>
              <p>Each completed-cycle minimum FCS becomes a separate logistic scenario after the editable safety margin of {policy.model.safetyMargin.toFixed(2)}. The final percentage blends the latest three cycles with 50% / 30% / 20% recency weights, reducing dependence on one unusually easy or difficult year.</p>
              <div className="formula">P(Seat) = EligibilityGate × CallGate × Σ wᵢ / (1 + exp(−{policy.model.logisticSlope} × (FCS − (Benchmarkᵢ + SafetyMargin))))</div>
              <table className="policy-table"><thead><tr><th>Group</th><th>2025–27</th><th>2024–26</th><th>2023–25</th><th>Weighted target</th></tr></thead><tbody>
                {Object.entries(policy.historicalFinalBenchmarkSeries).map(([key, series]) => {
                  const weightedTarget = series.reduce((sum, point, index) => sum + ((modelWeights[index] ?? 0) / modelWeightTotal) * (point.benchmark + policy.model.safetyMargin), 0);
                  return <tr key={key}><td>{humanize(key)}</td>{series.map((point) => <td key={point.batch}>{point.benchmark.toFixed(6)}</td>)}<td>{weightedTarget.toFixed(6)}</td></tr>;
                })}
              </tbody></table>
              <p>The model also reports the minimum and maximum probability across those historical scenarios. Confidence is labelled limited because three category thresholds are not a candidate-level outcomes dataset. Probability bands remain predictor interpretations, not IIMA categories.</p>
            </article>

            <article className="panel method-card" id="sources">
              <h2>Source and assumption register</h2>
              <table className="policy-table"><thead><tr><th>Dataset</th><th>Classification</th><th>Verified</th><th>Source / note</th></tr></thead><tbody>
                {Object.entries(policy.metadata).map(([key, metadata]) => <tr key={key}><td>{humanize(key)}</td><td><SourceBadge source={metadata.sourceType} /></td><td>{metadata.verifiedDate}</td><td><a href={metadata.source.startsWith("http") ? metadata.source : undefined} target="_blank" rel="noreferrer">{metadata.notes}</a></td></tr>)}
              </tbody></table>
              <div className="notice" style={{ marginTop: 18 }}>This tool does not guarantee admission. IIMA final admission depends on the actual candidate pool, category-wise merit, interview performance, seat availability, reservation and institute decisions.</div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
