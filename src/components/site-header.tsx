"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import thinkplusLogo from "../../public/thinkplus-logo-clean.png";

export function SiteHeader() {
  const [showResultsTitle, setShowResultsTitle] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isIimbUg = pathname.startsWith("/iimb-ug") || pathname.startsWith("/admin/iimb-ug");

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
    <header className={`site-header ${isHome ? "home-site-header" : isIimbUg ? "ipmat-site-header" : ""}`}>
      <div className="shell site-header-inner">
        <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
          <Image src={thinkplusLogo} alt="Thinkplus" priority />
        </Link>
        {isHome ? <span aria-hidden="true" /> : isIimbUg ? <strong className="header-results-title">IIMB UG · 2027–31</strong> : showResultsTitle ? <strong className="header-results-title">Your IIM results</strong> : <span aria-hidden="true" />}
        <div className="header-tools">
          <div className="header-results-filter-host" id="header-results-filter-host" />
          <div className="header-actions">
            {isHome ? (
              <Link className="home-header-join" href="/predictor">Join now</Link>
            ) : isIimbUg ? (
              <Link className="header-cta" href="/predictor">CAT predictor</Link>
            ) : showResultsTitle ? (
              <button type="button" className="header-cta" onClick={() => window.dispatchEvent(new Event("iim-edit-candidate"))}>Enter candidate details</button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
