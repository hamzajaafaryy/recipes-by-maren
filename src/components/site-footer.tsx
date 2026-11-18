import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link className="site-footer-brand" href="/">Recipes by Maren</Link>
          <p className="site-footer-tagline">Real food. Simple recipes. Made with care.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/#latest">Recipes</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/disclosure">Affiliate disclosure</Link>
        </nav>
      </div>
      <div className="site-footer-bottom">© {new Date().getFullYear()} Recipes by Maren. All rights reserved.</div>
    </footer>
  );
}
