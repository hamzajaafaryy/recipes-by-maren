import LoginForm from "./ui";

export const metadata = { title: "Admin login | Recipes by Maren", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <a className="admin-brand" href="/">Recipes by Maren</a>
      <section className="admin-login-card">
        <span className="eyebrow">Private workspace</span>
        <h1>Welcome back.</h1>
        <p>Sign in to manage recipes and site content.</p>
        <LoginForm />
      </section>
    </main>
  );
}
