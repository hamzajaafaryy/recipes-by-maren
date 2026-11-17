import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <span className="eyebrow">Not found</span>
        <h1>This page isn’t here.</h1>
        <p>The admin page you requested could not be found.</p>
        <Link className="text-link" href="/">Return to Recipes by Maren</Link>
      </section>
    </main>
  );
}
