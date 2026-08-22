import Link from "next/link";

export default function HomePage() {
  return (
    <div className="cat-landing-page">
      <section className="cat-product-hero">
        <div className="shell cat-product-hero-grid">
          <div className="cat-product-copy">
            <p className="cat-product-kicker">CAT 2025 · IIM admissions intelligence</p>
            <h1>
              Turn your <span className="cat-gradient-word">CAT</span> profile into a{" "}
              <span className="cat-clear-word">clear</span>{" "}
              <span className="cat-gradient-word">IIM strategy.</span>
            </h1>
            <p className="cat-product-lead">Enter one academic and CAT profile to understand interview-call routes, shortlist scores and modelled seat chances across all 21 IIMs.</p>
            <div className="cat-product-benefits" aria-label="Predictor benefits">
              <span><i>01</i>Official hard-gate checks</span>
              <span><i>02</i>Institute-specific scoring</span>
              <span><i>03</i>Historical comparisons</span>
            </div>
            <div className="cat-product-actions">
              <Link className="cat-primary-cta" href="/predictor">Start your analysis</Link>
              <Link className="cat-secondary-cta" href="/methodology">Explore methodology</Link>
            </div>
          </div>

          <div className="cat-intelligence-card" aria-label="CAT admission predictor overview">
            <div className="cat-intelligence-topline"><span>Admission intelligence</span><strong>LIVE MODEL</strong></div>
            <div className="cat-score-preview">
              <div><span>Profile coverage</span><strong>21 IIMs</strong><small>One candidate profile</small></div>
              <div className="cat-score-orbit" aria-hidden="true"><strong>CAT</strong><span>2025</span></div>
            </div>
            <div className="cat-preview-grid">
              <article><span>Shortlist</span><strong>Pre-PI</strong><small>Official weights</small></article>
              <article><span>Interview</span><strong>Call route</strong><small>Gate-by-gate</small></article>
              <article><span>Selection</span><strong>Seat chance</strong><small>Model estimate</small></article>
            </div>
            <p>Official policy, historical facts and model assumptions are clearly separated.</p>
          </div>
        </div>
      </section>

      <section className="cat-proof-strip" aria-label="Predictor coverage">
        <div className="shell cat-proof-grid">
          <div><strong>21</strong><span>IIM rule engines</span></div>
          <div><strong>239</strong><span>Calculation checks</span></div>
          <div><strong>3</strong><span>CAT sections evaluated</span></div>
          <div><strong>1</strong><span>Profile for every result</span></div>
        </div>
      </section>

    </div>
  );
}
