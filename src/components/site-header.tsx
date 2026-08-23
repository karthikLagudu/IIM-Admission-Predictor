"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import thinkplusLogo from "../../public/thinkplus-logo-clean.png";

export function SiteHeader() {
  const [showResultsTitle, setShowResultsTitle] = useState(false);

  useEffect(() => {
    const syncResultsTitle = (event?: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "boolean") {
        setShowResultsTitle(event.detail);
        return;
      }
      setShowResultsTitle(Boolean(document.querySelector("[data-iim-results-active='true']")));
    };
    syncResultsTitle();
    window.addEventListener("iim-results-visibility", syncResultsTitle);
    return () => window.removeEventListener("iim-results-visibility", syncResultsTitle);
  }, []);

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <div className="header-brand-cluster">
          <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
            <Image src={thinkplusLogo} alt="Thinkplus" priority />
          </Link>
          {showResultsTitle && <strong className="header-results-title">Your IIM results</strong>}
        </div>
        <div className="header-actions">
          <Link className="header-cta" href="/predictor">Start analysis</Link>
          <Link className="header-methodology" href="/methodology">Methodology</Link>
        </div>
      </div>
    </header>
  );
}
