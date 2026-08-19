import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <nav aria-label="Primary navigation">
          <Link href="/methodology">Methodology</Link>
        </nav>
      </div>
    </header>
  );
}
