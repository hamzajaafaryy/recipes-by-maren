import LoginForm from "./ui";
import Link from "next/link";

export const metadata = { title: "Admin login | Recipes by Maren", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <Link className="admin-brand" href="/">Recipes by Maren</Link>
      <section className="admin-login-card">
        <span className="eyebrow">Private workspace</span>
        <h1>Welcome back.</h1>
        <p>Sign in to manage recipes and site content.</p>
        <LoginForm />
      </section>
    </main>
  );
}
