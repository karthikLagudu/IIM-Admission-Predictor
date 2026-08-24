"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import thinkplusLogo from "../../public/thinkplus-logo-clean.png";

export function SiteHeader() {
  const [showResultsTitle, setShowResultsTitle] = useState(false);

  useEffect(() => {
    const red = [182, 59, 70];
    const amber = [167, 101, 17];
    const green = [20, 128, 93];
    let animationFrame = 0;

    const mixColor = (from: number[], to: number[], amount: number) => (
      from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount))
    );

    const updateScrollbarColor = () => {
      animationFrame = 0;
      const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const progress = maximumScroll === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / maximumScroll));
      const color = progress <= 0.5
        ? mixColor(red, amber, progress * 2)
        : mixColor(amber, green, (progress - 0.5) * 2);
      document.documentElement.style.setProperty("--scroll-thumb-color", `rgb(${color.join(", ")})`);
    };

    const scheduleUpdate = () => {
      if (animationFrame === 0) animationFrame = window.requestAnimationFrame(updateScrollbarColor);
    };

    updateScrollbarColor();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
      document.documentElement.style.removeProperty("--scroll-thumb-color");
    };
  }, []);

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
        <Link className="site-wordmark" href="/" aria-label="CAT IIM Predictor home">
          <Image src={thinkplusLogo} alt="Thinkplus" priority />
        </Link>
        {showResultsTitle ? <strong className="header-results-title">Your IIM results</strong> : <span aria-hidden="true" />}
        <div className="header-tools">
          <div className="header-results-filter-host" id="header-results-filter-host" />
          <div className="header-actions">
            {showResultsTitle ? (
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
