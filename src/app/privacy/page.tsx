import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for visitors to Recipes by Maren."
};

export default function PrivacyPage() {
  return (
    <main className="section" style={{ maxWidth: 820, minHeight: "65vh" }}>
      <span className="eyebrow">Your privacy matters</span>
      <h1 style={{ font: "clamp(42px, 7vw, 66px) Georgia, serif", letterSpacing: "-.05em" }}>Privacy Policy</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>This starter privacy page explains the topics that must be completed before launch. The final policy should reflect the actual services, data collection, advertising partners, analytics, newsletter provider, and cookie choices used by this website.</p>
      <h2>Information you provide</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>If you subscribe to emails or contact us, we may process the information you submit to respond or deliver the requested updates.</p>
      <h2>Cookies, analytics, and advertising</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>This website may use essential cookies and, if enabled, analytics or advertising technologies. Details, consent controls, retention periods, and opt-out instructions must be added to match the live configuration.</p>
      <h2>Your choices</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.9 }}>Contact us to ask about your information or email preferences. This page is a draft and is not legal advice.</p>
      <p style={{ color: "var(--muted)", fontSize: 12 }}>Last updated: November 17, 2026.</p>
      <a className="text-link" href="/">Back to the homepage</a>
    </main>
  );
}
