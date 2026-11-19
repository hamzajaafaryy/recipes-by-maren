"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/recipes", label: "Recipes" },
  { href: "/#categories", label: "Categories" },
  { href: "/about", label: "About Maren" },
  { href: "/contact", label: "Contact" }
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="announcement">Fresh ideas for everyday cooking · New recipes added regularly</div>
      <header className="site-header">
        <Link className="site-brand" href="/" aria-label="Recipes by Maren home" onClick={() => setMenuOpen(false)}>
          <span className="site-brand-name">Recipes by Maren<span className="site-brand-period">.</span></span>
          <span className="site-brand-tagline">Simple food. Really good days.</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          <span className="mobile-menu-label">{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <nav id="site-navigation" className={`site-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <Link className="site-header-cta" href="/search">Find a recipe <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
    </>
  );
}
