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
        <nav aria-label="Primary navigation">
          <Link href="/">Predictor</Link>
          <Link href="/methodology">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
