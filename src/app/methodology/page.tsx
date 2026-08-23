import { SourceBadge } from "@/components/ui/source-badge";
import { IIMA_CAT_2025_POLICY } from "@/lib/iima/constants";
import { humanize } from "@/lib/utils";

const policy = IIMA_CAT_2025_POLICY;
const modelWeights = policy.model.benchmarkRecencyWeights;
const modelWeightTotal = modelWeights.reduce((sum, weight) => sum + weight, 0);

const institutes = [
  { name: "IIM Bodh Gaya", code: "IIMBG", pre: "CAT overall percentile (100)", final: "CAT 50 + PI 25 + academic profile 15 + work experience 10", route: "Interview" },
  { name: "IIM Guwahati", code: "IIMG", pre: "Normalized CAT 0.65 + normalized academic rating 0.35", final: "Same composite; no PI, WAT or GD", route: "Direct merit" },
  { name: "IIM Indore", code: "IIMI", pre: "X 10 + XII 25 + VARC 16 + DILR 16 + QA 23 + diversity 7 + work 3", final: "X 5 + XII 5 + VARC 20 + DILR 10 + QA 10 + PI 45 + diversity 5", route: "Interview" },
  { name: "IIM Jammu", code: "IIMJ", pre: "CAT overall percentile (100)", final: "CAT 42 + PI 30 + academics 10 + work 10 + gender diversity 8", route: "Interview" },
  { name: "IIM Kashipur", code: "IIMKASHIPUR", pre: "CAT overall percentile (100)", final: "PI 25 + CAT 41 + X 2 + XII 2 + graduation 5 + professional 2 + work 15 + diversity 8", route: "Interview" },
  { name: "IIM Kozhikode", code: "IIMK", pre: "CAT 50 + X 15 + XII 20 + diversity 10 + work 5", final: "CAT 35 + PI 35 + WAT 20 + resume 10", route: "Interview + WAT" },
  { name: "IIM Lucknow", code: "IIML", pre: "CAT 60 + XII 10 + graduation 10 + work 10 + diversity 10", final: "CAT 30 + XII 5 + graduation 5 + diversity 5 + work 5 + WAT 10 + PI 40", route: "Interview + WAT" },
  { name: "IIM Mumbai", code: "IIMM", pre: "CAT overall percentile (100)", final: "CAT 60 + PI 20 + academic profile and work experience 20", route: "Interview" },
  { name: "IIM Nagpur", code: "IIMN", pre: "CAT overall percentile (100)", final: "CAT 45 + PI 25 + academics 6 + work 9 + academic diversity 5 + gender diversity 10", route: "Interview" },
  { name: "IIM Raipur", code: "IIMRAIPUR", pre: "CAT overall percentile (100)", final: "CAT 50 + PI 40 + X 15 + XII 15 + work 15 + gender 8 + profile 5 + academic diversity 2", route: "Interview" },
  { name: "IIM Ranchi", code: "IIMRANCHI", pre: "CAT overall percentile (100)", final: "VARC 15 + DILR 15 + QA 35 + academics 10 + work 10 + PI 15 + gender bonus 5", route: "Interview" },
  { name: "IIM Rohtak", code: "IIMROHTAK", pre: "CAT overall percentile (100)", final: "CAT 60 + PI 20 + academic and gender diversity 20", route: "Interview" },
  { name: "IIM Sambalpur", code: "IIMSAMBALPUR", pre: "CAT 40 + X 3 + XII 3 + graduation 4 + work 20 + gender 5", final: "Pre-PI 75 + PI 25", route: "Interview" },
  { name: "IIM Shillong", code: "IIMSHILLONG", pre: "CAT 65 + normalized academic rating 35", final: "Academic rating 10 + gender 10 + PI 40 + CAT 40", route: "Interview" },
  { name: "IIM Sirmaur", code: "IIMSIRMAUR", pre: "CAT overall percentile (100)", final: "VARC 12.25 + DILR 10.5 + QA 12.25 + PI 20 + academics 15 + work 20 + gender 5 + trailblazer 5", route: "Interview" },
  { name: "IIM Tiruchirappalli", code: "IIMTRICHY", pre: "CAT overall percentile (100)", final: "CAT 52 + PI 20 + work 10 + X 2 + XII 3 + UG 5 + gender 6 + academic diversity 2", route: "Interview" },
  { name: "IIM Udaipur", code: "IIMUDAIPUR", pre: "CAT and profile shortlist (100)", final: "Normalized CAT 55 + PI 25 + profile 20", route: "Interview" },
  { name: "IIM Visakhapatnam", code: "IIMV", pre: "VARC 18 + DILR 14 + QA 18 + X 10 + XII 10 + bachelor 10 + gender 10 + work/professional 10", final: "PI 48 + CAT 25 + X 4 + XII 4 + bachelor 4 + gender 5 + work 10", route: "Interview" },
] as const;

const inputGroups = [
  ["Personal", "Admission category, PwD status, gender and date of birth", "Selects the applicable official eligibility and CAT thresholds; diversity points are applied only where policy provides them."],
  ["Academic", "Class 10, Class 12, stream, boards, bachelor degree and marks", "Feeds institute-specific academic slabs, normalization, discipline groups and minimum-degree rules."],
  ["Experience", "Completed full-time work-experience months and professional qualification", "Feeds only published work/professional components; internships and overlapping periods are not automatically treated as eligible work."],
  ["CAT", "Overall and VARC, DILR and QA percentiles, plus positive-score confirmation", "Applies overall, sectional and raw-score gates. Internal scaled-score proxies are estimated only where an institute formula requires them."],
  ["Interview scenario", "PI and WAT/AWT performance", "Used only in the individual result simulator after a call-stage result; it cannot repair a failed earlier gate."],
] as const;

export default function MethodologyPage() {
  return (
    <>
      <section className="page-hero methodology-hero">
        <div className="shell">
          <p className="eyebrow">Complete methodology · CAT · 21 IIMs</p>
          <h1 className="page-title">How every result is calculated</h1>
          <p>This page separates published admission rules, observed historical results, candidate inputs and planning assumptions—then shows exactly where each one enters the predictor.</p>
          <div className="method-hero-facts" aria-label="Methodology coverage">
            <span><strong>21</strong>IIM rule engines</span><span><strong>5</strong>binding stages</span><span><strong>4</strong>source classes</span><span><strong>0</strong>guaranteed outcomes</span>
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="shell methodology-layout">
          <nav className="panel method-nav" aria-label="Methodology sections">
            <strong>On this page</strong>
            <a href="#principles">Principles</a><a href="#sources">Evidence labels</a><a href="#inputs">Candidate inputs</a><a href="#pipeline">Calculation pipeline</a><a href="#cat">CAT estimates</a><a href="#iima">IIM Ahmedabad</a><a href="#iimb">IIM Bangalore</a><a href="#iimc">IIM Calcutta</a><a href="#other-iims">Other 18 IIMs</a><a href="#results">Result labels</a><a href="#history">Historical data</a><a href="#simulator">PI simulator</a><a href="#limitations">Limits</a><a href="#register">Source register</a>
          </nav>

          <div className="method-content">
            <article className="panel method-card" id="principles">
              <div className="method-card-heading"><div><p className="eyebrow">Start here</p><h2>Four rules govern the predictor</h2></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <div className="principle-grid">
                <div><strong>Hard gates bind</strong><p>Degree eligibility, category-specific CAT minima and required section conditions are checked first. A later strength never cancels a failed hard gate.</p></div>
                <div><strong>No invented official cutoffs</strong><p>If an institute publishes a formula but not the current applicant-pool boundary, the predictor says eligible for ranking or uses an explicitly labelled model benchmark.</p></div>
                <div><strong>Scores stay institute-specific</strong><p>A score of 70/100 at one IIM is not compared with 70/100 at another because the components, normalization and applicant pools differ.</p></div>
                <div><strong>Probability is planning support</strong><p>Seat chance is a model output around a configured historical or test benchmark—not a promise, official probability or substitute for the merit list.</p></div>
              </div>
            </article>

            <article className="panel method-card" id="sources">
              <div className="method-card-heading"><div><p className="eyebrow">Evidence discipline</p><h2>What each source label means</h2></div></div>
              <div className="source-legend">
                <div><SourceBadge source="OFFICIAL_POLICY" /><p>Published institute rules: eligibility, CAT floors, component weights, score slabs and selection stages.</p></div>
                <div><SourceBadge source="OFFICIAL_OBSERVED_RESULT" /><p>A result released after an admission cycle, such as an observed shortlist or final composite boundary.</p></div>
                <div><SourceBadge source="HISTORICAL_RTI" /><p>Prior-cycle records used only for year-by-year context and model calibration.</p></div>
                <div><SourceBadge source="MODEL_ASSUMPTION" /><p>A planning benchmark, normalization input, interpolation or probability assumption. It is never presented as institute policy.</p></div>
              </div>
            </article>

            <article className="panel method-card" id="inputs">
              <div className="method-card-heading"><div><p className="eyebrow">Input dictionary</p><h2>What the candidate profile controls</h2></div><SourceBadge source="USER_INPUT" /></div>
              <div className="method-table-wrap"><table className="policy-table input-table"><thead><tr><th>Group</th><th>What is entered</th><th>How it is used</th></tr></thead><tbody>
                {inputGroups.map(([group, fields, use]) => <tr key={group}><td><strong>{group}</strong></td><td>{fields}</td><td>{use}</td></tr>)}
              </tbody></table></div>
              <div className="notice"><strong>Input validation:</strong> percentages remain between 0 and 100, months cannot be negative and blank numeric fields stay blank rather than silently becoming zero. The saved profile is not changed by the PI simulator.</div>
            </article>

            <article className="panel method-card" id="pipeline">
              <div className="method-card-heading"><div><p className="eyebrow">Engine sequence</p><h2>One profile, five binding stages</h2></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <div className="pipeline-list">
                <div><span>1</span><strong>Eligibility</strong><p>Degree, marks, category/PwD and any institute-specific conditions.</p></div>
                <div><span>2</span><strong>CAT screen</strong><p>Overall and sectional percentiles plus published raw/scaled-score conditions.</p></div>
                <div><span>3</span><strong>Pre-PI ranking</strong><p>Institute composite using CAT, academics, diversity, work and other published components.</p></div>
                <div><span>4</span><strong>Call decision</strong><p>Observed boundary, current verified benchmark, applicant-pool ranking or an honest data-required state.</p></div>
                <div><span>5</span><strong>Final selection</strong><p>PI/WAT and non-interview components, followed by category merit and seat availability.</p></div>
              </div>
              <div className="formula">Eligibility gate × CAT gate × shortlist gate × final-score model = displayed outcome</div>
            </article>

            <article className="panel method-card" id="cat">
              <div className="method-card-heading"><div><p className="eyebrow">CAT data treatment</p><h2>Percentiles shown; scaled scores estimated only when required</h2></div><SourceBadge source="MODEL_ASSUMPTION" /></div>
              <p>The candidate enters the overall and three sectional percentiles. If an institute&apos;s published formula requires a scaled CAT score, the engine converts percentile to a planning score through piecewise-linear active-cycle anchor points. A sectional proxy uses one-third of the equivalent overall score.</p>
              <div className="formula">score(p) = linear interpolation between the two nearest active-cycle planning anchors</div>
              <div className="notice"><strong>The CAT scorecard is authoritative.</strong> Percentile-to-score conversion is not fixed across slots or years. The internal proxy is marked as a model assumption and can differ from the official normalized scaled score.</div>
            </article>

            <article className="panel method-card institute-method" id="iima">
              <div className="method-card-heading"><div><p className="eyebrow">IIMA · PGP 2026–28</p><h2>IIM Ahmedabad</h2></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <details open><summary>Eligibility, Application Rating and shortlist</summary><div className="method-detail-body">
                <p>Bachelor marks must be at least 50% for General/EWS/NC-OBC and 45% for SC/ST/PwD. Category-wise CAT minima and positive raw scores in all sections bind before academic or composite scoring.</p>
                <div className="method-table-wrap"><table className="policy-table"><thead><tr><th>Candidate group</th><th>Overall</th><th>VARC</th><th>DILR</th><th>QA</th></tr></thead><tbody>{Object.entries(policy.catCutoffs).map(([key, cutoff]) => <tr key={key}><td>{humanize(key)}</td><td>{cutoff.overall}</td><td>{cutoff.varc}</td><td>{cutoff.dilr}</td><td>{cutoff.qa}</td></tr>)}</tbody></table></div>
                <div className="formula">AR = Class 10 (10) + Class 12 (10) + Bachelor/professional (10) + Work experience (5) + Gender diversity (3)</div>
                <div className="formula">CS = 0.35 × (AR / 38) + 0.65 × (CAT scaled score / 204)</div>
                <p>Stage 1 applies academic-category/discipline consistency routes and observed boundaries. Stage 2 is an additional category-wise route requiring the published academic criteria and the observed CAT-cycle composite boundary.</p>
                <div className="method-table-wrap"><table className="policy-table"><thead><tr><th>Stage-2 group</th><th>Observed minimum CS</th><th>Evidence</th></tr></thead><tbody>{Object.entries(policy.stage2Thresholds).map(([key, value]) => <tr key={key}><td>{humanize(key)}</td><td>{value.toFixed(6)}</td><td><SourceBadge source="OFFICIAL_OBSERVED_RESULT" /></td></tr>)}</tbody></table></div>
              </div></details>
              <details><summary>Final score and seat-chance model</summary><div className="method-detail-body">
                <div className="formula">FCS = 0.50 × PI + 0.10 × AWT + 0.25 × CAT + 0.15 × AR (all normalized)</div>
                <p>IIMA does not pre-publish a fixed current category-wise final FCS guarantee. The model compares FCS with three completed-cycle minimums plus a {policy.model.safetyMargin.toFixed(2)} safety margin, using 50% / 30% / 20% recency weights.</p>
                <div className="formula">P(Seat) = Gate × Σ wᵢ / (1 + exp(−{policy.model.logisticSlope} × (FCS − (Benchmarkᵢ + margin))))</div>
                <div className="method-table-wrap"><table className="policy-table"><thead><tr><th>Group</th><th>2025–27</th><th>2024–26</th><th>2023–25</th><th>Weighted target</th></tr></thead><tbody>{Object.entries(policy.historicalFinalBenchmarkSeries).map(([key, series]) => { const target = series.reduce((sum, point, index) => sum + ((modelWeights[index] ?? 0) / modelWeightTotal) * (point.benchmark + policy.model.safetyMargin), 0); return <tr key={key}><td>{humanize(key)}</td>{series.map((point) => <td key={point.batch}>{point.benchmark.toFixed(6)}</td>)}<td>{target.toFixed(6)}</td></tr>; })}</tbody></table></div>
              </div></details>
            </article>

            <article className="panel method-card institute-method" id="iimb">
              <div className="method-card-heading"><div><p className="eyebrow">IIMB · PGP 2026–28</p><h2>IIM Bangalore</h2></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <div className="formula">Pre-PI (100) = VARC 19 + DILR 21 + QA 15 + X 10 + XII 10 + bachelor 10 + work/professional 10 + gender 5</div>
              <div className="formula">Final (100) = PI 40 + WAT 10 + VARC 8.75 + DILR 10 + QA 6.25 + X 5 + XII 5 + bachelor 5 + work/professional 10</div>
              <p>IIMB standardizes CAT sections and academics within the qualifying applicant pool; Class 10 and 12 also use board-specific 90th-percentile values. When current pool mean, standard deviation or board statistics are unavailable, policy-only mode returns <strong>DATA REQUIRED</strong> rather than fabricating the official pre-PI score.</p>
              <div className="formula">Std(value) = clamp(0, weight, weight/2 + ((value − pool mean) / pool SD) × weight/6)</div>
              <div className="notice">Top-10 automatic PI treatment is accepted only with an externally verified qualification or complete applicant-pool rank data. Test mode can supply synthetic normalization inputs and model benchmarks, always labelled as assumptions.</div>
            </article>

            <article className="panel method-card institute-method" id="iimc">
              <div className="method-card-heading"><div><p className="eyebrow">IIMC · MBA 2026–28</p><h2>IIM Calcutta</h2></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <div className="formula">Shortlist (85) = CAT scaled score 56 + Class 10 10 + Class 12 15 + Gender diversity 4</div>
              <div className="formula">Final (100) = CAT 30 + PI 48 + WAT 8 + Academic diversity 6 + Work experience 8</div>
              <p>Stage I applies category-wise CAT floors and the non-negative raw-score condition. Class 10 and 12 use published mark slabs. IIMC determines category-wise Stage-II cutoffs after reviewing the applicant pool, so without a verified boundary the official status is <strong>ELIGIBLE FOR RANKING</strong>, not a guaranteed call.</p>
              <div className="notice">A mock-mode call or seat estimate uses a separate planning benchmark. It is never described as IIMC&apos;s current official cutoff.</div>
            </article>

            <article className="panel method-card" id="other-iims">
              <div className="method-card-heading"><div><p className="eyebrow">18 additional engines</p><h2>Institute-specific score map</h2><p>Weights below are maxima from each active rule engine. “CAT overall percentile (100)” means the institute first screens/ranks on CAT before later components are applied.</p></div><SourceBadge source="OFFICIAL_POLICY" /></div>
              <div className="method-table-wrap"><table className="policy-table institute-map"><thead><tr><th>Institute</th><th>Route</th><th>Pre-PI / shortlist score</th><th>Final-selection score</th></tr></thead><tbody>
                {institutes.map((item) => <tr key={item.code}><td><span>{item.code}</span><strong>{item.name}</strong></td><td>{item.route}</td><td>{item.pre}</td><td>{item.final}</td></tr>)}
              </tbody></table></div>
              <div className="notice"><strong>Runtime data rule:</strong> a published weight does not imply that the current score is computable. Pool normalization, resume ratings, trailblazer status, applicant ranks or current-cycle boundaries remain null until a defensible input is configured.</div>
            </article>

            <article className="panel method-card" id="results">
              <div className="method-card-heading"><div><p className="eyebrow">Reading the dashboard</p><h2>What each result state means</h2></div></div>
              <div className="result-state-grid">
                <div><strong>Call predicted</strong><p>All hard gates pass and the calculated shortlist score reaches the active observed or clearly labelled planning benchmark.</p></div>
                <div><strong>Eligible for ranking</strong><p>Published minimums pass, but the institute decides the shortlist from the current applicant pool and no fixed boundary is available.</p></div>
                <div><strong>Data required</strong><p>The formula is known, but a required current-cycle normalization or pool input is unavailable. Missing is not treated as zero.</p></div>
                <div><strong>Review required</strong><p>The published rule involves an exceptional qualification or condition that cannot be safely inferred from standard fields.</p></div>
                <div><strong>Less likely</strong><p>A hard gate or active comparison boundary is not met. The detailed result identifies the specific shortfall.</p></div>
                <div><strong>Direct merit</strong><p>The institute&apos;s current route has no interview/WAT/GD stage; the profile proceeds to category-wise merit ranking.</p></div>
              </div>
              <h3>Seat-chance filters</h3>
              <div className="chance-band-method"><span className="high"><strong>High</strong>70% and above</span><span className="medium"><strong>Medium</strong>40%–69.9%</span><span className="low"><strong>Low</strong>Below 40% or not estimated</span></div>
              <p>These three filters organize the table; they are product labels, not institute admission categories. “Not estimated” is grouped under Low for filtering but does not mean a calculated zero.</p>
            </article>

            <article className="panel method-card" id="history">
              <div className="method-card-heading"><div><p className="eyebrow">Year-by-year context</p><h2>Historical comparison methodology</h2></div><SourceBadge source="HISTORICAL_RTI" /></div>
              <p>Each individual IIM report places the student&apos;s current shortlist score beside compatible records from previous cycles. The comparison is made only within the same institute and only when the historical metric uses a compatible scale.</p>
              <div className="formula">Historical gap = student&apos;s current institute score − published prior-cycle boundary</div>
              <ul className="method-list"><li>A positive gap means above that published historical reference—not a guaranteed current call.</li><li>A CAT screening percentile is labelled as a first-screen minimum, not an interview-call score.</li><li>“Not publicly published” means no compatible fixed number is configured; it is never converted to zero.</li><li>Mock planning benchmarks are kept separate from official and historical records.</li></ul>
            </article>

            <article className="panel method-card" id="simulator">
              <div className="method-card-heading"><div><p className="eyebrow">Interactive what-if</p><h2>PI simulator methodology</h2></div><SourceBadge source="MODEL_ASSUMPTION" /></div>
              <p>The simulator appears only after opening an individual IIM&apos;s detailed result. It replaces that institute&apos;s PI component with the selected 0–100 performance, keeps every non-PI input unchanged, recalculates the final score and—where a benchmark exists—updates model seat chance.</p>
              <div className="formula">PI contribution = selected PI% × institute PI weight</div>
              <div className="formula">Scenario final score = original non-PI contribution + new PI contribution</div>
              <div className="notice"><strong>Important:</strong> the simulator does not grant an interview call, bypass eligibility, alter the saved profile or predict the subjective interview panel. It is a sensitivity tool for candidates who reach the interview stage.</div>
            </article>

            <article className="panel method-card" id="limitations">
              <div className="method-card-heading"><div><p className="eyebrow">Responsible interpretation</p><h2>What the predictor cannot know</h2></div></div>
              <ul className="method-list limitation-list"><li>The current applicant pool, category ranks and seat movement before institutes publish them.</li><li>Exact board/pool normalization statistics unless officially released or explicitly configured.</li><li>Interview, WAT, resume or profile-panel judgments before evaluation.</li><li>Offer acceptance, wait-list movement, reservation roster operation and institute discretion.</li><li>A universal probability that is directly comparable across all IIMs.</li></ul>
              <div className="notice"><strong>No admission guarantee.</strong> Use the predictor to identify gates, score components, strengths, shortfalls and useful what-if scenarios. The official institute communication and final merit list always prevail.</div>
            </article>

            <article className="panel method-card" id="register">
              <div className="method-card-heading"><div><p className="eyebrow">Audit trail</p><h2>IIMA source and assumption register</h2></div></div>
              <div className="method-table-wrap"><table className="policy-table"><thead><tr><th>Dataset</th><th>Classification</th><th>Verified</th><th>Source / note</th></tr></thead><tbody>{Object.entries(policy.metadata).map(([key, metadata]) => <tr key={key}><td>{humanize(key)}</td><td><SourceBadge source={metadata.sourceType} /></td><td>{metadata.verifiedDate}</td><td>{metadata.source.startsWith("http") ? <a href={metadata.source} target="_blank" rel="noreferrer">{metadata.notes}</a> : metadata.notes}</td></tr>)}</tbody></table></div>
              <p className="method-register-note">Every other institute&apos;s detailed report links its active policy source and labels model or historical inputs beside the values they affect.</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
