"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Category = { id: string; name: string };
type JsonEntry = string | { title?: string; text?: string; answer?: string; question?: string; name?: string; body?: string; description?: string };
type RecipeData = {
  title: string; slug: string; excerpt: string; servings: number; status: string;
  content?: string | null; introduction?: string | null;
  whyLove?: JsonEntry[] | null; ingredientNotes?: JsonEntry[] | null; equipment?: JsonEntry[] | null;
  expertTips?: JsonEntry[] | null; variations?: JsonEntry[] | null; servingSuggestions?: JsonEntry[] | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  storageReheating?: string | null; authorNotes?: string | null;
  prepMinutes?: number | null; cookMinutes?: number | null; totalMinutes?: number | null;
  difficulty?: string | null; recipeTemperature?: string | null; recipeYield?: string | null;
  heroPublicId?: string | null; heroAltText?: string | null; seoTitle?: string | null;
  seoDescription?: string | null; seoFocusKeyword?: string | null; seoKeywords?: string[] | null;
  canonicalUrl?: string | null; relatedRecipeSlugs?: string[]; 
  ingredients: Array<{ quantity?: string | null; item: string; section?: string | null }>;
  instructions: Array<{ title?: string | null; body: string; imagePublicId?: string | null }>;
  categories: Array<{ categoryId: string }>;
};
const lines = (value: unknown): string[] => Array.isArray(value) ? value.map((item: unknown) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    return [record.title, record.text ?? record.answer ?? record.description].filter((part): part is string => typeof part === "string").join(" | ");
  }
  return "";
}).filter(Boolean) : [];
const parseTextList = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);
const parsePairs = (value: string, separator: string) => parseTextList(value).map((line) => {
  const [first, ...rest] = line.split(separator);
  return { first: first.trim(), second: rest.join(separator).trim() };
});

export default function RecipeEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string | number>>({
    title: "", slug: "", excerpt: "", introduction: "", whyLove: "", ingredientNotes: "",
    equipment: "", ingredients: "", instructions: "", expertTips: "", variations: "",
    storageReheating: "", servingSuggestions: "", faqs: "", authorNotes: "",
    prepMinutes: "", cookMinutes: "", totalMinutes: "", servings: 4, difficulty: "",
    recipeTemperature: "", recipeYield: "", heroPublicId: "", heroAltText: "",
    seoTitle: "", seoDescription: "", seoFocusKeyword: "", seoKeywords: "",
    canonicalUrl: "", relatedRecipeSlugs: ""
  });
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const set = (key: string, value: string | number) => setForm((old) => ({ ...old, [key]: value }));
  const wordCount = useMemo(() => String(form.introduction || "").trim().split(/\s+/).filter(Boolean).length, [form.introduction]);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/recipes/${id}`, { cache: "no-store" }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load recipe.");
      if (!active) return;
      const r: RecipeData = data.recipe;
      setCategories(data.categories || []);
      setSelectedCategories(r.categories.map((x) => x.categoryId));
      setStatus(r.status);
      setForm({
        title: r.title || "", slug: r.slug || "", excerpt: r.excerpt || "",
        introduction: r.introduction || r.content || "",
        whyLove: lines(r.whyLove).join("\n"), ingredientNotes: lines(r.ingredientNotes).join("\n"),
        equipment: lines(r.equipment).join("\n"),
        ingredients: r.ingredients.map((x) => [x.quantity || "", x.item, x.section || ""].join(" | ")).join("\n"),
        instructions: r.instructions.map((x) => [x.title || "", x.body, x.imagePublicId || ""].join(" | ")).join("\n"),
        expertTips: lines(r.expertTips).join("\n"), variations: lines(r.variations).join("\n"),
        storageReheating: r.storageReheating || "", servingSuggestions: lines(r.servingSuggestions).join("\n"),
        faqs: Array.isArray(r.faqs) ? r.faqs.map((x) => [x.question, x.answer].join(" || ")).join("\n") : "",
        authorNotes: r.authorNotes || "", prepMinutes: r.prepMinutes ?? "", cookMinutes: r.cookMinutes ?? "",
        totalMinutes: r.totalMinutes ?? "", servings: r.servings || 4, difficulty: r.difficulty || "",
        recipeTemperature: r.recipeTemperature || "", recipeYield: r.recipeYield || "",
        heroPublicId: r.heroPublicId || "", heroAltText: r.heroAltText || "",
        seoTitle: r.seoTitle || "", seoDescription: r.seoDescription || "",
        seoFocusKeyword: r.seoFocusKeyword || "", seoKeywords: (r.seoKeywords || []).join(", "),
        canonicalUrl: r.canonicalUrl || "", relatedRecipeSlugs: (r.relatedRecipeSlugs || []).join("\n")
      });
      setLoaded(true);
    }).catch((error) => { if (active) { setMessage(error.message); setLoaded(true); } });
    return () => { active = false; };
  }, [id]);

  function payload(nextStatus: string) {
    const ingredients = parsePairs(String(form.ingredients ?? ""), "|").map((x) => ({
      quantity: x.first, item: x.second.split("|")[0]?.trim() || "", section: x.second.split("|")[1]?.trim() || undefined
    })).filter((x) => x.item);
    const instructions = parsePairs(String(form.instructions ?? ""), "|").map((x) => {
      const parts = x.second.split("|");
      return { title: x.first || undefined, body: parts[0]?.trim() || "", imagePublicId: parts[1]?.trim() || undefined };
    }).filter((x) => x.body);
    const faqs = parsePairs(String(form.faqs ?? ""), "||").map((x) => ({ question: x.first, answer: x.second })).filter((x) => x.question && x.answer);
    return {
      title: String(form.title ?? ""), slug: String(form.slug ?? ""), excerpt: String(form.excerpt ?? ""), introduction: String(form.introduction ?? ""),
      whyLove: parseTextList(String(form.whyLove ?? "")), ingredientNotes: parseTextList(String(form.ingredientNotes ?? "")),
      equipment: parseTextList(String(form.equipment ?? "")), ingredients, instructions,
      expertTips: parseTextList(String(form.expertTips ?? "")), variations: parseTextList(String(form.variations ?? "")),
      storageReheating: String(form.storageReheating ?? ""), servingSuggestions: parseTextList(String(form.servingSuggestions ?? "")),
      faqs, authorNotes: String(form.authorNotes ?? ""),
      prepMinutes: form.prepMinutes === "" ? null : Number(form.prepMinutes),
      cookMinutes: form.cookMinutes === "" ? null : Number(form.cookMinutes),
      totalMinutes: form.totalMinutes === "" ? null : Number(form.totalMinutes),
      servings: Number(form.servings), difficulty: String(form.difficulty ?? ""),
      recipeTemperature: String(form.recipeTemperature ?? ""), recipeYield: String(form.recipeYield ?? ""),
      heroPublicId: String(form.heroPublicId ?? ""), heroAltText: String(form.heroAltText ?? ""),
      seoTitle: String(form.seoTitle ?? ""), seoDescription: String(form.seoDescription ?? ""),
      seoFocusKeyword: String(form.seoFocusKeyword ?? ""),
      seoKeywords: parseTextList(String(form.seoKeywords ?? "").replace(/,/g, "\n")),
      canonicalUrl: String(form.canonicalUrl ?? ""), relatedRecipeSlugs: parseTextList(String(form.relatedRecipeSlugs ?? "")),
      categoryIds: selectedCategories, status: nextStatus
    };
  }

  async function save(nextStatus: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/recipes/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(nextStatus))
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save recipe.");
      setStatus(data.recipe.status);
      setMessage(nextStatus === "PUBLISHED" ? "Recipe published successfully." : "Draft saved successfully.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  if (!loaded) return <main className="admin-editor-shell"><p>Loading recipe editor…</p></main>;

  const field = (label: string, key: string, placeholder = "", type = "text") => (
    <label className="editor-field"><span>{label}</span><input type={type} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} /></label>
  );
  const area = (label: string, key: string, placeholder: string, hint: string) => (
    <label className="editor-field editor-field-full"><span>{label}</span><textarea rows={4} value={form[key] ?? ""} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} /><small>{hint}</small></label>
  );

  return (
    <main className="admin-editor-shell">
      <header className="admin-editor-header">
        <div><Link href="/admin" className="admin-back-link">← Back to Content Studio</Link><p className="eyebrow">Recipe workspace</p><h1>Edit recipe</h1><p>Build a useful, well-tested recipe page. Empty sections stay hidden on the public article.</p></div>
        <div className="admin-editor-status"><span className={status === "PUBLISHED" ? "table-status published" : "table-status"}>{status}</span><Link href={`/recipes/${form.slug}`} target="_blank">Preview page ↗</Link></div>
      </header>

      <div className="admin-editor-layout">
        <div className="admin-editor-main">
          <section className="admin-editor-panel">
            <div className="admin-editor-section-head"><span>01</span><div><h2>Recipe basics</h2><p>The details readers see first.</p></div></div>
            <div className="editor-grid">
              {field("Recipe title", "title", "e.g. Air Fryer Honey Garlic Salmon")}
              {field("URL slug", "slug", "air-fryer-honey-garlic-salmon")}
              {area("Short description", "excerpt", "A specific, helpful summary of the recipe…", "Keep it clear and accurate. Maximum 320 characters.")}
              {area("Recipe introduction", "introduction", "Introduce the dish, flavor, texture, and when it works well…", "Write naturally. Aim for useful context, not a forced word count.")}
              <div className="editor-field editor-field-full"><span>Recipe categories</span><div className="editor-category-list">{categories.map((category) => <label key={category.id}><input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={(e) => setSelectedCategories((old) => e.target.checked ? [...old, category.id] : old.filter((id) => id !== category.id))} />{category.name}</label>)}</div></div>
            </div>
          </section>

          <section className="admin-editor-panel">
            <div className="admin-editor-section-head"><span>02</span><div><h2>Ingredients & method</h2><p>Structured data for the recipe card and step-by-step guide.</p></div></div>
            <div className="editor-grid">
              {area("Ingredients", "ingredients", "1/2 cup | honey | Sauce\n2 | salmon fillets | Main", "One ingredient per line: quantity | ingredient | optional group name.")}
              {area("Step-by-step instructions", "instructions", "Prepare the sauce | Whisk honey, garlic, and soy sauce. | step-image-public-id\nCook the salmon | Air fry until cooked through.", "One step per line: optional title | full instruction | optional Cloudinary image public ID.")}
            </div>
          </section>

          <details className="admin-editor-panel" open>
            <summary className="admin-editor-section-head"><span>03</span><div><h2>Helpful editorial sections</h2><p>Only complete sections with real, recipe-specific information.</p></div></summary>
            <div className="editor-grid editor-grid-spaced">
              {area("Why readers will love it", "whyLove", "Quick weeknight dinner\nMinimal cleanup\nFamily-friendly flavor", "One useful point per line.")}
              {area("Ingredient notes & substitutions", "ingredientNotes", "Salmon | Use similar-thickness fillets for even cooking.\nSoy sauce | Use tamari for a gluten-free option.", "One note per line. Use “Label | explanation” when helpful.")}
              {area("Equipment needed", "equipment", "Air fryer\nMixing bowl\nInstant-read thermometer", "List only equipment actually needed.")}
              {area("Expert tips", "expertTips", "Pat the salmon dry before adding the glaze.\nCheck doneness at the thickest point.", "Practical tips, not generic filler.")}
              {area("Variations", "variations", "Add chili flakes for heat.\nUse maple syrup instead of honey.", "Only include tested or sensible alternatives.")}
              {area("Storage & reheating", "storageReheating", "Explain safe cooling, refrigerator storage time, and the best reheating method based on this recipe.", "Do not guess food-safety timelines. Verify before publishing.")}
              {area("Serving suggestions", "servingSuggestions", "Steamed rice\nRoasted broccoli\nCucumber salad", "One side or sauce per line. Add links later through related recipes.")}
              {area("Frequently asked questions", "faqs", "Can I use the oven? || Yes. Add the tested oven method and temperature.\nCan I make it ahead? || Explain which parts can be prepared early.", "One FAQ per line: question || answer.")}
              {area("Author notes", "authorNotes", "Any real testing notes, helpful context, or serving observations…", "Never claim personal testing unless it actually happened.")}
            </div>
          </details>

          <section className="admin-editor-panel">
            <div className="admin-editor-section-head"><span>04</span><div><h2>Recipe card details</h2><p>Accurate cook times, yield, and print-friendly information.</p></div></div>
            <div className="editor-grid">
              {field("Prep time (minutes)", "prepMinutes", "15", "number")}
              {field("Cook time (minutes)", "cookMinutes", "20", "number")}
              {field("Total time (minutes)", "totalMinutes", "35", "number")}
              {field("Servings", "servings", "4", "number")}
              {field("Difficulty", "difficulty", "Easy")}
              {field("Temperature", "recipeTemperature", "400°F")}
              {field("Recipe yield", "recipeYield", "4 servings")}
            </div>
          </section>

          <section className="admin-editor-panel">
            <div className="admin-editor-section-head"><span>05</span><div><h2>Images & accessibility</h2><p>Descriptive image information supports accessibility and image search.</p></div></div>
            <div className="editor-grid">
              {field("Hero image Cloudinary public ID", "heroPublicId", "recipes/salmon/honey-garlic-salmon")}
              {field("Hero image alt text", "heroAltText", "Honey garlic salmon fillets served with rice")}
            </div>
          </section>

          <section className="admin-editor-panel">
            <div className="admin-editor-section-head"><span>06</span><div><h2>Search engine optimization</h2><p>Write for people first. Keep metadata unique and accurate.</p></div></div>
            <div className="editor-grid">
              {field("SEO title", "seoTitle", "Air Fryer Honey Garlic Salmon")}
              {field("Focus keyword", "seoFocusKeyword", "air fryer honey garlic salmon")}
              {area("Meta description", "seoDescription", "Make tender honey garlic salmon in the air fryer…", "Aim for a concise search snippet; do not stuff keywords.")}
              {area("Related keywords", "seoKeywords", "air fryer salmon, honey garlic glaze, easy salmon dinner", "Separate terms with commas.")}
              {field("Canonical URL (optional)", "canonicalUrl", "https://recipesbymaren.com/recipes/...")}
              {area("Related recipe slugs", "relatedRecipeSlugs", "easy-garlic-rice\nroasted-broccoli", "Add existing published recipe slugs, one per line.")}
            </div>
            <div className="seo-preview"><span>SEARCH PREVIEW</span><strong>{form.seoTitle || form.title || "Recipe title"}</strong><p>https://recipesbymaren.com/recipes/{form.slug || "recipe-slug"}</p><small>{form.seoDescription || form.excerpt || "Your meta description will appear here."}</small></div>
          </section>
        </div>

        <aside className="admin-editor-rail">
          <div className="admin-editor-panel editor-checklist"><span className="eyebrow">Editorial checklist</span><h3>Before publishing</h3>
            <p><strong>{wordCount}</strong> intro words</p>
            <p><strong>{parseTextList(form.ingredients).length}</strong> ingredient lines</p>
            <p><strong>{parseTextList(form.instructions).length}</strong> instruction steps</p>
            <p><strong>{selectedCategories.length}</strong> categories selected</p>
            <small>Confirm measurements, method, doneness, storage guidance, and all images before publishing.</small>
          </div>
          <div className="admin-editor-panel editor-save-panel">
            <button className="button-primary" disabled={busy} onClick={() => save("DRAFT")}>{busy ? "Saving…" : "Save draft"}</button>
            <button className="button-secondary" disabled={busy} onClick={() => save("PUBLISHED")}>Publish recipe</button>
            {message ? <p role="status" className="admin-message">{message}</p> : null}
            <small>Publishing requires ingredients, instructions, and a hero image. Empty optional sections are not displayed.</small>
          </div>
        </aside>
      </div>
    </main>
  );
}
