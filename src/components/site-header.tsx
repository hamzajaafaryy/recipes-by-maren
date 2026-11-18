"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/recipes", label: "All recipes" },
  { href: "/#latest", label: "Latest recipes" },
  { href: "/#categories", label: "Browse" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement">A little inspiration for your everyday table</div>
      <header className="site-header">
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          <span className="mobile-menu-label">Menu</span>
        </button>
        <nav id="site-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="site-brand" href="/" aria-label="Recipes by Maren home" onClick={() => setMenuOpen(false)}>
          <span className="site-brand-name">Recipes by Maren</span>
          <span className="site-brand-tagline">Real food. Simple recipes. Made with care.</span>
        </Link>
        <div className="site-header-actions">
          <Link className="site-header-cta" href="/search">Find a recipe</Link>
        </div>
      </header>
    </>
  );
}
