"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RecipeRow = { id: string; title: string; slug: string; status: string; updatedAt: string };

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function updateTitle(value: string) {
    setTitle(value);
    setSlug(value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function createRecipe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, excerpt, status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create recipe.");
      setTitle(""); setSlug(""); setExcerpt(""); setStatus("DRAFT");
      setMessage("Recipe draft created. Add ingredients and instructions in the next editing step.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">Recipes by Maren</a>
        <span className="admin-side-label">WORKSPACE</span>
        <a className="admin-side-link active" href="/admin">Overview</a>
        <a className="admin-side-link" href="#new-recipe">New recipe</a>
        <a className="admin-side-link" href="/">View website ↗</a>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <section className="admin-main">
        <div className="admin-topline"><span className="eyebrow">Content studio</span><span className="admin-status">Private admin</span></div>
        <h1>Good morning.</h1>
        <p className="admin-intro">Your kitchen, your content. Start with a new recipe draft.</p>
        <div className="admin-stats">
          <div><span>CONTENT</span><strong>Recipe studio</strong><small>Create and organize your recipe library</small></div>
          <div><span>WORKFLOW</span><strong>Draft first</strong><small>Review every recipe before publishing</small></div>
          <div><span>MEDIA</span><strong>Cloudinary ready</strong><small>Connect credentials to enable uploads</small></div>
        </div>
        <section className="admin-panel" id="new-recipe">
          <div className="admin-panel-heading"><div><span className="eyebrow">Start writing</span><h2>Create a recipe</h2></div><span className="draft-pill">NEW ENTRY</span></div>
          <form className="admin-form admin-recipe-form" onSubmit={createRecipe}>
            <label htmlFor="recipe-title">Recipe title</label>
            <input id="recipe-title" value={title} onChange={(e) => updateTitle(e.target.value)} placeholder="e.g. Creamy Garlic Chicken" required />
            <label htmlFor="recipe-slug">URL slug</label>
            <input id="recipe-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            <label htmlFor="recipe-excerpt">Short description</label>
            <textarea id="recipe-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} maxLength={320} placeholder="A helpful, specific description of this recipe…" required />
            <label htmlFor="recipe-status">Publishing status</label>
            <select id="recipe-status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="DRAFT">Save as draft</option><option value="PUBLISHED">Publish</option></select>
            <button className="button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Create recipe"}</button>
            {message && <p className="admin-message" role="status">{message}</p>}
          </form>
        </section>
        <p className="admin-footnote">Publishing should happen only after the recipe, ingredient quantities, method, images, and SEO details have been reviewed.</p>
      </section>
    </main>
  );
}
