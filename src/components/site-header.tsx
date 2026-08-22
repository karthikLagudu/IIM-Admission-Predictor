import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
          <span>CAT</span>
          <strong>IIM Predictor</strong>
          <small>2025 · 21 institutes</small>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">Predictor</Link>
          <Link href="/methodology">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
