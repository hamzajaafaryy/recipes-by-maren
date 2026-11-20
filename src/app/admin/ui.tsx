"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };
type Recipe = {
  id: string; title: string; slug: string; excerpt: string; content: string; status: string;
  prepMinutes: number | null; cookMinutes: number | null; servings: number; difficulty: string | null;
  heroPublicId: string | null; seoTitle: string | null; seoDescription: string | null; canonicalUrl: string | null;
  updatedAt: string; publishedAt: string | null;
  ingredients: { section: string | null; quantity: string | null; item: string }[];
  instructions: { title: string | null; body: string }[];
  categories: { category: Category }[];
};
type FormState = {
  title: string; slug: string; excerpt: string; content: string; prepMinutes: string; cookMinutes: string;
  servings: string; difficulty: string; heroPublicId: string; seoTitle: string; seoDescription: string;
  canonicalUrl: string; ingredientsText: string; instructionsText: string; categoryIds: string[];
};
const emptyForm = (): FormState => ({
  title: "", slug: "", excerpt: "", content: "", prepMinutes: "", cookMinutes: "", servings: "4",
  difficulty: "Easy", heroPublicId: "", seoTitle: "", seoDescription: "", canonicalUrl: "",
  ingredientsText: "", instructionsText: "", categoryIds: []
});

export default function AdminDashboard() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("basics");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const [rr, cr] = await Promise.all([
      fetch("/api/admin/recipes", { cache: "no-store" }),
      fetch("/api/admin/categories", { cache: "no-store" })
    ]);
    const rd = await rr.json(); const cd = await cr.json();
    if (!rr.ok) throw new Error(rd.error || "Could not load recipes.");
    if (!cr.ok) throw new Error(cd.error || "Could not load categories.");
    setRecipes(rd.recipes); setCategories(cd.categories);
  }
  useEffect(() => { loadData().catch(e => setError(e.message)); }, []);

  const visibleRecipes = useMemo(() => recipes.filter(r =>
    (filter === "ALL" || r.status === filter) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.slug.includes(search.toLowerCase()))
  ), [recipes, filter, search]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }
  function newRecipe() {
    setEditingId(null); setForm(emptyForm()); setTab("basics"); setError(""); setMessage("");
    document.getElementById("recipe-editor")?.scrollIntoView({ behavior: "smooth" });
  }
  function editRecipe(recipe: Recipe) {
    setEditingId(recipe.id);
    setForm({
      title: recipe.title, slug: recipe.slug, excerpt: recipe.excerpt, content: recipe.content || "",
      prepMinutes: recipe.prepMinutes?.toString() || "", cookMinutes: recipe.cookMinutes?.toString() || "",
      servings: String(recipe.servings || 4), difficulty: recipe.difficulty || "Easy",
      heroPublicId: recipe.heroPublicId || "", seoTitle: recipe.seoTitle || "",
      seoDescription: recipe.seoDescription || "", canonicalUrl: recipe.canonicalUrl || "",
      ingredientsText: recipe.ingredients.map(x => [x.section || "", x.quantity || "", x.item].filter(Boolean).join(" | ")).join("\n"),
      instructionsText: recipe.instructions.map(x => [x.title || "", x.body].filter(Boolean).join(" | ")).join("\n"),
      categoryIds: recipe.categories.map(x => x.category.id)
    });
    setTab("basics"); setError(""); setMessage("");
    document.getElementById("recipe-editor")?.scrollIntoView({ behavior: "smooth" });
  }
  function payload(status: string) {
    const ingredients = form.ingredientsText.split("\n").map(line => {
      const parts = line.split("|").map(x => x.trim());
      return parts.length >= 3 ? { section: parts[0], quantity: parts[1], item: parts.slice(2).join(" | ") } :
        { section: "", quantity: parts.length > 1 ? parts[0] : "", item: parts.length > 1 ? parts.slice(1).join(" | ") : parts[0] };
    }).filter(x => x.item);
    const instructions = form.instructionsText.split("\n").map(line => {
      const parts = line.split("|").map(x => x.trim());
      return parts.length > 1 ? { title: parts[0], body: parts.slice(1).join(" | ") } : { title: "", body: parts[0] };
    }).filter(x => x.body);
    return {
      title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
      prepMinutes: form.prepMinutes ? Number(form.prepMinutes) : null,
      cookMinutes: form.cookMinutes ? Number(form.cookMinutes) : null,
      servings: Number(form.servings || 4), difficulty: form.difficulty,
      heroPublicId: form.heroPublicId, seoTitle: form.seoTitle, seoDescription: form.seoDescription,
      canonicalUrl: form.canonicalUrl, ingredients, instructions, categoryIds: form.categoryIds, status
    };
  }
  async function saveRecipe(status: "DRAFT" | "PUBLISHED") {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(editingId ? "/api/admin/recipes/" + editingId : "/api/admin/recipes", {
        method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(status))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save recipe.");
      setEditingId(data.recipe.id);
      setMessage(status === "PUBLISHED" ? "Recipe published." : "Draft saved.");
      await loadData(); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save recipe."); }
    finally { setBusy(false); }
  }
  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setError("Choose an image file smaller than 10 MB."); return;
    }
    setUploading(true); setError("");
    try {
      const sr = await fetch("/api/admin/upload-signature", { method: "POST" });
      const sign = await sr.json();
      if (!sr.ok) throw new Error(sign.error || "Cloudinary is not configured.");
      const body = new FormData();
      body.append("file", file); body.append("api_key", sign.apiKey);
      body.append("timestamp", String(sign.timestamp)); body.append("folder", sign.folder);
      body.append("signature", sign.signature);
      const response = await fetch("https://api.cloudinary.com/v1_1/" + sign.cloudName + "/image/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "Image upload failed.");
      set("heroPublicId", result.public_id); setMessage("Image uploaded. Save the recipe to attach it.");
    } catch (e) { setError(e instanceof Error ? e.message : "Image upload failed."); }
    finally { setUploading(false); }
  }
  async function removeRecipe(recipe: Recipe) {
    if (!window.confirm("Delete " + recipe.title + "? This cannot be undone.")) return;
    try {
      const response = await fetch("/api/admin/recipes/" + recipe.id, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed.");
      if (editingId === recipe.id) newRecipe();
      await loadData(); setMessage("Recipe deleted.");
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login"); router.refresh();
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/">Recipes by Maren</Link>
        <span className="admin-side-label">CONTENT STUDIO</span>
        <a className="admin-side-link active" href="#overview">Overview</a>
        <a className="admin-side-link" href="#recipe-editor">Recipe editor</a>
        <a className="admin-side-link" href="#recipe-library">Recipe library</a>
        <Link className="admin-side-link" href="/categories">Categories</Link>
        <Link className="admin-side-link" href="/">View website ↗</Link>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <section className="admin-main" id="overview">
        <div className="admin-topline"><span className="eyebrow">YOUR KITCHEN WORKSPACE</span><span className="admin-status">Private admin</span></div>
        <div className="admin-welcome-row"><div><h1>Content studio</h1><p className="admin-intro">Create, organize, review, and publish your recipes.</p></div><button className="admin-primary-button" onClick={newRecipe}>＋ New recipe</button></div>
        <div className="admin-stats">
          <div><span>ALL RECIPES</span><strong>{recipes.length}</strong><small>In your library</small></div>
          <div><span>DRAFTS</span><strong>{recipes.filter(x => x.status === "DRAFT").length}</strong><small>Waiting for review</small></div>
          <div><span>PUBLISHED</span><strong>{recipes.filter(x => x.status === "PUBLISHED").length}</strong><small>Live on your website</small></div>
        </div>
        {error && <p className="admin-alert error" role="alert">{error}</p>}
        {message && <p className="admin-alert success" role="status">{message}</p>}

        <section className="admin-panel admin-editor-panel" id="recipe-editor">
          <div className="admin-panel-heading"><div><span className="eyebrow">{editingId ? "EDIT RECIPE" : "CREATE CONTENT"}</span><h2>{editingId ? "Edit your recipe" : "Build a new recipe"}</h2></div><span className="draft-pill">{editingId ? "EDITING" : "NEW DRAFT"}</span></div>
          <div className="admin-tabs" role="tablist" aria-label="Recipe editor sections">
            <button className={tab === "basics" ? "active" : ""} onClick={() => setTab("basics")}>Basics</button>
            <button className={tab === "ingredients" ? "active" : ""} onClick={() => setTab("ingredients")}>Ingredients</button>
            <button className={tab === "instructions" ? "active" : ""} onClick={() => setTab("instructions")}>Instructions</button>
            <button className={tab === "seo" ? "active" : ""} onClick={() => setTab("seo")}>SEO</button>
          </div>
          {tab === "basics" && <div className="admin-form-grid">
            <div className="admin-field full"><label>Recipe title *</label><input value={form.title} onChange={e => { const v=e.target.value; set("title",v); if(!editingId) set("slug",v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")); }} maxLength={140} /></div>
            <div className="admin-field"><label>URL slug *</label><input value={form.slug} onChange={e => set("slug",e.target.value)} /></div>
            <div className="admin-field"><label>Short description *</label><input value={form.excerpt} onChange={e => set("excerpt",e.target.value)} maxLength={320} /></div>
            <div className="admin-field full"><label>Article introduction and notes</label><textarea rows={5} value={form.content} onChange={e => set("content",e.target.value)} placeholder="Add helpful context, cooking tips, substitutions, and storage advice." /></div>
            <div className="admin-field"><label>Prep time (minutes)</label><input type="number" min="0" value={form.prepMinutes} onChange={e => set("prepMinutes",e.target.value)} /></div>
            <div className="admin-field"><label>Cook time (minutes)</label><input type="number" min="0" value={form.cookMinutes} onChange={e => set("cookMinutes",e.target.value)} /></div>
            <div className="admin-field"><label>Servings</label><input type="number" min="1" value={form.servings} onChange={e => set("servings",e.target.value)} /></div>
            <div className="admin-field"><label>Difficulty</label><select value={form.difficulty} onChange={e => set("difficulty",e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            <div className="admin-field full"><label>Categories</label><div className="admin-category-picker">{categories.map(c => <label key={c.id}><input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={e => set("categoryIds",e.target.checked ? [...form.categoryIds,c.id] : form.categoryIds.filter(id => id !== c.id))} />{c.name}</label>)}</div></div>
            <div className="admin-field full"><label>Recipe hero image</label><div className="admin-upload-row"><input value={form.heroPublicId} onChange={e => set("heroPublicId",e.target.value)} placeholder="Cloudinary public ID" /><label className="admin-upload-button">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/*" disabled={uploading} onChange={e => void uploadImage(e.target.files?.[0])} /></label></div><small>Image file up to 10 MB. Requires Cloudinary credentials in Vercel.</small></div>
          </div>}
          {tab === "ingredients" && <div className="admin-field full"><label>Ingredients — one per line *</label><textarea rows={12} value={form.ingredientsText} onChange={e => set("ingredientsText",e.target.value)} placeholder={"2 cups | all-purpose flour\n1 tsp | kosher salt\nFor the sauce | 1/2 cup | heavy cream"} /><small>Format: quantity | ingredient. Optional format: section | quantity | ingredient.</small></div>}
          {tab === "instructions" && <div className="admin-field full"><label>Cooking steps — one per line *</label><textarea rows={12} value={form.instructionsText} onChange={e => set("instructionsText",e.target.value)} placeholder={"Preheat the oven to 375°F.\nSeason the chicken on both sides.\nBake until the center reaches a safe temperature."} /><small>Format: Step title | instructions. You can also write the full step without a title.</small></div>}
          {tab === "seo" && <div className="admin-form-grid">
            <div className="admin-field full"><label>SEO title</label><input value={form.seoTitle} onChange={e => set("seoTitle",e.target.value)} maxLength={180} /><small>{form.seoTitle.length}/180 characters</small></div>
            <div className="admin-field full"><label>Meta description</label><textarea rows={3} value={form.seoDescription} onChange={e => set("seoDescription",e.target.value)} maxLength={320} /><small>{form.seoDescription.length}/320 characters</small></div>
            <div className="admin-field full"><label>Canonical URL (optional)</label><input type="url" value={form.canonicalUrl} onChange={e => set("canonicalUrl",e.target.value)} placeholder="Leave blank to use the recipe URL" /></div>
          </div>}
          <div className="admin-editor-actions">
            <button className="admin-secondary-button" onClick={() => void saveRecipe("DRAFT")} disabled={busy}>{busy ? "Saving…" : "Save draft"}</button>
            <button className="admin-primary-button" onClick={() => void saveRecipe("PUBLISHED")} disabled={busy}>{busy ? "Saving…" : "Publish recipe"}</button>
            {editingId && <Link className="admin-preview-link" href={"/recipes/" + form.slug} target="_blank">Preview page ↗</Link>}
          </div>
          <p className="admin-footnote">Publishing requires at least one ingredient, one instruction, and a hero image. Review the complete recipe before making it public.</p>
        </section>

        <section className="admin-panel recipe-library" id="recipe-library">
          <div className="admin-panel-heading"><div><span className="eyebrow">YOUR CONTENT</span><h2>Recipe library</h2></div><span className="draft-pill">{recipes.length} TOTAL</span></div>
          <div className="admin-library-tools"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes…" /><select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All statuses</option><option value="DRAFT">Drafts</option><option value="PUBLISHED">Published</option></select></div>
          {visibleRecipes.length === 0 && <p className="admin-empty">No recipes match this view.</p>}
          {visibleRecipes.length > 0 && <div className="recipe-table-wrap"><table className="recipe-table"><thead><tr><th>Recipe</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{visibleRecipes.map(recipe => <tr key={recipe.id}><td><strong>{recipe.title}</strong><small>/{recipe.slug}</small></td><td><span className={recipe.status === "PUBLISHED" ? "table-status published" : "table-status"}>{recipe.status}</span></td><td>{new Date(recipe.updatedAt).toLocaleDateString("en-US")}</td><td><div className="admin-row-actions"><button onClick={() => editRecipe(recipe)}>Edit</button><button onClick={() => void removeRecipe(recipe)}>Delete</button></div></td></tr>)}</tbody></table></div>}
        </section>
      </section>
    </main>
  );
}
