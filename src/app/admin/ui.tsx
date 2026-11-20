"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type RecipeRow = { id: string; title: string; slug: string; status: string; updatedAt: string };

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const router = useRouter();

  async function loadRecipes() {
    try {
      const response = await fetch("/api/admin/recipes", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load recipes.");
      setRecipes(data.recipes);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load recipes.");
    }
  }

  useEffect(() => { void loadRecipes(); }, []);

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
        body: JSON.stringify({ title, slug, excerpt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create recipe.");
      router.push(`/admin/recipes/${data.recipe.id}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function importRecipe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!importFile) { setImportMessage("Choose a recipe JSON file first."); return; }
    setImportBusy(true);
    setImportMessage("");
    try {
      const raw = await importFile.text();
      const payload = JSON.parse(raw);
      const response = await fetch("/api/admin/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not import this file.");
      const warnings = data.missingCategories?.length
        ? " Missing categories: " + data.missingCategories.join(", ") + "."
        : "";
      setImportMessage("Imported as draft. " + (data.imageManifest?.length || 0) + " image references found." + warnings + " Opening editor…");
      router.push(`/admin/recipes/${data.recipe.id}`);
      router.refresh();
    } catch (error) {
      setImportMessage(error instanceof SyntaxError ? "This file is not valid JSON." : error instanceof Error ? error.message : "Import failed.");
    } finally {
      setImportBusy(false);
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
        <Link className="admin-brand" href="/">Recipes by Maren</Link>
        <span className="admin-side-label">WORKSPACE</span>
        <a className="admin-side-link active" href="/admin">Overview</a>
        <a className="admin-side-link" href="#new-recipe">New recipe</a>
        <a className="admin-side-link" href="#recipe-library">Recipe library</a>
        <Link className="admin-side-link" href="/">View website ↗</Link>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <section className="admin-main">
        <div className="admin-topline"><span className="eyebrow">Content studio</span><span className="admin-status">Private admin</span></div>
        <h1>Good morning.</h1>
        <p className="admin-intro">Your kitchen, your content. Manage your recipe library from here.</p>
        <div className="admin-stats">
          <div><span>RECIPES</span><strong>{recipes.length}</strong><small>Entries in your recipe library</small></div>
          <div><span>WORKFLOW</span><strong>Draft first</strong><small>Review every recipe before publishing</small></div>
          <div><span>MEDIA</span><strong>Image setup needed</strong><small>Connect Cloudinary before adding recipe photos</small></div>
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
            <select id="recipe-status" value="DRAFT" disabled><option value="DRAFT">Save as draft</option></select>
            <button className="button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Create recipe"}</button>
            {message && <p className="admin-message" role="status">{message}</p>}
          </form>
        </section>
        <section className="admin-panel" id="json-import">\n          <div className="admin-panel-heading"><div><span className="eyebrow">Fast publishing workflow</span><h2>Import a recipe from JSON</h2></div><span className="draft-pill">DRAFT ONLY</span></div>\n          <p className="admin-intro">Upload the structured JSON prepared for Recipes by Maren. We validate the fields and create a draft so you can review every detail before publishing.</p>\n          <form className="admin-form" onSubmit={importRecipe}>\n            <label htmlFor="recipe-json-file">Recipe JSON file</label>\n            <input id="recipe-json-file" type="file" accept=".json,application/json" onChange={(event) => setImportFile(event.target.files?.[0] || null)} />\n            <button className="button-primary" type="submit" disabled={importBusy || !importFile}>{importBusy ? "Importing…" : "Validate & import draft"}</button>\n            {importMessage && <p className="admin-message" role="status">{importMessage}</p>}\n          </form>\n          <p className="admin-footnote">Photo files are not uploaded by this JSON import yet. Add the original hero and step photos in the editor; image references in the JSON are returned for review.</p>\n        </section>\n        <section className="admin-panel recipe-library" id="recipe-library">
          <div className="admin-panel-heading"><div><span className="eyebrow">Your content</span><h2>Recipe library</h2></div><span className="draft-pill">{recipes.length} TOTAL</span></div>
          {loadError && <p className="form-error">{loadError}</p>}
          {!loadError && recipes.length === 0 && <p className="admin-empty">No recipes yet. Create your first entry above.</p>}
          {recipes.length > 0 && <div className="recipe-table-wrap"><table className="recipe-table"><thead><tr><th>Recipe</th><th>Status</th><th>Updated</th><th>Editor</th></tr></thead><tbody>{recipes.map((recipe) => <tr key={recipe.id}><td><strong>{recipe.title}</strong><small>/{recipe.slug}</small></td><td><span className={recipe.status === "PUBLISHED" ? "table-status published" : "table-status"}>{recipe.status}</span></td><td>{new Date(recipe.updatedAt).toLocaleDateString("en-US")}</td><td><Link href={`/admin/recipes/${recipe.id}`} className="admin-edit-link">Edit recipe →</Link></td></tr>)}</tbody></table></div>}
        </section>
        <p className="admin-footnote">Before publishing, review ingredient quantities, method, images, nutrition details, and SEO information. Do not publish placeholder or untested recipe content.</p>
      </section>
    </main>
  );
}
