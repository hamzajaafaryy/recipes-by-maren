import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Recipes by Maren."
};

export default function ContactPage() {
  return (
    <main className="section" style={{ maxWidth: 760, minHeight: "65vh" }}>
      <span className="eyebrow">Say hello</span>
      <h1 style={{ font: "clamp(42px, 7vw, 66px) Georgia, serif", letterSpacing: "-.05em" }}>Contact</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Have a recipe question, partnership inquiry, or a note to share? We would love to hear from you.
      </p>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Email: <a className="text-link" href="mailto:hello@recipesbymaren.com">hello@recipesbymaren.com</a>
      </p>
      <p style={{ color: "var(--muted)", fontSize: 12 }}>Before launch, replace this address with an inbox you control.</p>
      <a className="text-link" href="/">Back to the homepage</a>
    </main>
  );
}
