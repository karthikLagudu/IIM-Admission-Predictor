import Link from "next/link";
import { ArrowRight, BarChart3, History, Landmark, ShieldCheck } from "lucide-react";
import heroBackground from "../../public/home-background-reference.webp";

export default function HomePage() {
  return (
    <div className="cat-landing-page" style={{ backgroundImage: `url(${heroBackground.src})` }}>
      <section className="cat-product-hero" id="about">
        <div className="shell cat-product-hero-grid">
          <div className="cat-product-copy">
            <h1>
              <span className="cat-clear-word">Which IIM will you land?</span>
              <span className="cat-gradient-word">Predict for yourself</span>
            </h1>
            <p className="cat-product-lead">Enter your CAT score and academic profile to get clear, explainable estimates of interview calls across all 21 IIMs.</p>
            <div className="cat-product-actions">
              <Link className="cat-primary-cta" href="/predictor">Predict my IIM calls <ArrowRight size={22} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cat-benefit-strip" id="features" aria-label="Predictor benefits">
        <div className="shell cat-product-benefits">
          <article><div><ShieldCheck size={20} aria-hidden="true" /><strong>Official gates</strong></div><span>Hard-gate checks</span></article>
          <article><div><Landmark size={20} aria-hidden="true" /><strong>21 IIMs</strong></div><span>Institute scoring</span></article>
          <article><div><History size={20} aria-hidden="true" /><strong>Past cycles</strong></div><span>Historical context</span></article>
          <article><div><BarChart3 size={20} aria-hidden="true" /><strong>Clear outlook</strong></div><span>Interview-call prediction</span></article>
        </div>
      </section>

    </div>
  );
}
