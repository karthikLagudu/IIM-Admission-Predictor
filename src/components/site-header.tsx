import Image from "next/image";
import Link from "next/link";
import thinkplusLogo from "../../public/thinkplus-logo.png";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
          <Image src={thinkplusLogo} alt="Thinkplus" priority />
        </Link>
        <div className="header-actions">
          <Link className="header-cta" href="/predictor">Start analysis</Link>
          <Link className="header-methodology" href="/methodology">Methodology</Link>
        </div>
      </div>
    </header>
  );
}
