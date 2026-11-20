"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Recipe = { id: string; title: string; slug: string; excerpt: string; status: string; updatedAt: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<{id:string;name:string}[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const [r,c] = await Promise.all([fetch("/api/admin/recipes",{cache:"no-store"}),fetch("/api/admin/categories",{cache:"no-store"})]);
    const rd=await r.json(); const cd=await c.json();
    if(!r.ok) throw new Error(rd.error || "Could not load recipes");
    if(!c.ok) throw new Error(cd.error || "Could not load categories");
    setRecipes(rd.recipes); setCategories(cd.categories);
  }
  useEffect(()=>{load().catch(e=>setError(e.message));},[]);
  function reset(){setEditingId(null);setTitle("");setSlug("");setExcerpt("");setMessage("");}
  async function save(e: React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await fetch(editingId?"/api/admin/recipes/"+editingId:"/api/admin/recipes",{method:editingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,slug,excerpt,status:"DRAFT",ingredients:[],instructions:[],categoryIds:[]})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Save failed");setMessage("Draft saved.");setEditingId(d.recipe.id);await load();}catch(e){setError(e instanceof Error?e.message:"Save failed");}finally{setBusy(false);}}
  async function logout(){await fetch("/api/admin/logout",{method:"POST"});router.replace("/admin/login");router.refresh();}
  return <main className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href="/">Recipes by Maren</Link><span className="admin-side-label">CONTENT STUDIO</span><a className="admin-side-link active" href="#overview">Overview</a><a className="admin-side-link" href="#editor">Recipe editor</a><a className="admin-side-link" href="#library">Recipe library</a><Link className="admin-side-link" href="/categories">Categories</Link><button className="admin-logout" onClick={logout}>Sign out</button></aside><section className="admin-main" id="overview"><div className="admin-topline"><span className="eyebrow">YOUR KITCHEN WORKSPACE</span><span className="admin-status">Private admin</span></div><h1>Content studio</h1><p className="admin-intro">Manage your recipe library.</p><div className="admin-stats"><div><span>ALL RECIPES</span><strong>{recipes.length}</strong><small>In your library</small></div><div><span>DRAFTS</span><strong>{recipes.filter(x=>x.status==="DRAFT").length}</strong><small>Waiting for review</small></div><div><span>CATEGORIES</span><strong>{categories.length}</strong><small>Available categories</small></div></div>{error&&<p className="form-error">{error}</p>}{message&&<p className="admin-message">{message}</p>}<section className="admin-panel" id="editor"><div className="admin-panel-heading"><div><span className="eyebrow">CREATE CONTENT</span><h2>{editingId?"Edit recipe":"New recipe draft"}</h2></div><button type="button" className="button-primary" onClick={reset}>New recipe</button></div><form className="admin-form admin-recipe-form" onSubmit={save}><label>Recipe title</label><input value={title} onChange={e=>{setTitle(e.target.value);if(!editingId)setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));}} required/><label>URL slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} required/><label>Short description</label><textarea rows={3} maxLength={320} value={excerpt} onChange={e=>setExcerpt(e.target.value)} required/><button className="button-primary" disabled={busy}>{busy?"Saving…":"Save draft"}</button></form></section><section className="admin-panel recipe-library" id="library"><div className="admin-panel-heading"><div><span className="eyebrow">YOUR CONTENT</span><h2>Recipe library</h2></div></div>{recipes.length===0?<p className="admin-empty">No recipes found.</p>:<div className="recipe-table-wrap"><table className="recipe-table"><thead><tr><th>Recipe</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{recipes.map(x=><tr key={x.id}><td><strong>{x.title}</strong><small>/{x.slug}</small></td><td>{x.status}</td><td>{new Date(x.updatedAt).toLocaleDateString("en-US")}</td><td><button onClick={()=>{setEditingId(x.id);setTitle(x.title);setSlug(x.slug);setExcerpt(x.excerpt);}}>Edit</button></td></tr>)}</tbody></table></div>}</section></section></main>;
}
