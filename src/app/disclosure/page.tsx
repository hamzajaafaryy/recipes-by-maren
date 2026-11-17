import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How affiliate links may support Recipes by Maren."
};

export default function DisclosurePage() {
  return (
    <main className="section" style={{ maxWidth: 820, minHeight: "65vh" }}>
      <span className="eyebrow">A note about recommendations</span>
      <h1 style={{ font: "clamp(42px, 7vw, 66px) Georgia, serif", letterSpacing: "-.05em" }}>Affiliate Disclosure</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Some pages may include affiliate links. If you purchase through one of these links, this website may earn a commission at no additional cost to you. We will identify affiliate relationships clearly near relevant recommendations.
      </p>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Recommendations should be selected for their usefulness and relevance. Affiliate relationships do not guarantee a positive review or endorsement.
      </p>
      <a className="text-link" href="/">Back to the homepage</a>
    </main>
  );
}
