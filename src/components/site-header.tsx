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
    <header className={`site-header ${isHome ? "home-site-header" : ""}`}>
      <div className="shell site-header-inner">
        <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
          <Image src={thinkplusLogo} alt="Thinkplus" priority />
        </Link>
        {isHome ? (
          <nav className="home-header-nav" aria-label="Homepage navigation">
            <Link href="#about">About</Link>
            <Link href="#features">Features</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/methodology">FAQ</Link>
          </nav>
        ) : showResultsTitle ? <strong className="header-results-title">Your IIM results</strong> : <span aria-hidden="true" />}
        <div className="header-tools">
          <div className="header-results-filter-host" id="header-results-filter-host" />
          <div className="header-actions">
            {isHome ? (
              <>
                <Link className="home-header-primary" href="/predictor">Enter your details</Link>
                <Link className="home-header-join" href="/predictor">Join now</Link>
              </>
            ) : showResultsTitle ? (
              <button type="button" className="header-cta" onClick={() => window.dispatchEvent(new Event("iim-edit-candidate"))}>Enter candidate details</button>
            ) : (
              <Link className="header-cta" href="/predictor">Enter candidate details</Link>
            )}
            <Link className="header-methodology" href="/methodology">Methodology</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
