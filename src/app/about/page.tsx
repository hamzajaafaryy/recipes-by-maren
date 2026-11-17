import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Recipes by Maren and our approach to simple, everyday home cooking."
};

export default function AboutPage() {
  return (
    <main className="section" style={{ maxWidth: 820, minHeight: "65vh" }}>
      <span className="eyebrow">A seat at the table</span>
      <h1 style={{ font: "clamp(42px, 7vw, 66px) Georgia, serif", letterSpacing: "-.05em" }}>About Recipes by Maren</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Recipes by Maren is a home for approachable recipes, practical kitchen ideas, and everyday inspiration. Our goal is to make cooking feel welcoming, useful, and enjoyable—whether you are making a quick dinner or baking something to share.
      </p>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>
        Maren is the editorial pen name behind this publication. Recipes and editorial content will be reviewed before publication, and we will be clear about sources, partnerships, and how content is created.
      </p>
      <a className="text-link" href="/">Back to the homepage</a>
    </main>
  );
}
