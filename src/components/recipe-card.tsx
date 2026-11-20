"use client";

import { useMemo, useState } from "react";

type Ingredient = { id: string; section: string | null; quantity: string | null; item: string };
type Step = { id: string; title: string | null; body: string };
type Props = {
  title: string;
  description: string;
  pageUrl: string;
  imageUrl: string | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  totalMinutes: number | null;
  servings: number;
  difficulty: string | null;
  ingredients: Ingredient[];
  instructions: Step[];
};

function scaledQuantity(quantity: string | null, factor: number) {
  if (!quantity || factor === 1) return quantity || "";
  const match = quantity.match(/^\s*(\d+(?:\.\d+)?|\d+\/\d+)(.*)$/);
  if (!match) return quantity;
  const raw = match[1];
  const value = raw.includes("/") ? Number(raw.split("/")[0]) / Number(raw.split("/")[1]) : Number(raw);
  if (!Number.isFinite(value)) return quantity;
  const scaled = Math.round(value * factor * 100) / 100;
  return String(scaled) + match[2];
}

export default function RecipeCard({ title, description, pageUrl, imageUrl, prepMinutes, cookMinutes, totalMinutes, servings, difficulty, ingredients, instructions }: Props) {
  const [currentServings, setCurrentServings] = useState(Math.max(1, servings || 4));
  const [checked, setChecked] = useState<string[]>([]);
  const factor = currentServings / Math.max(1, servings || 4);
  const grouped = useMemo(() => {
    const map = new Map<string, Ingredient[]>();
    ingredients.forEach((item) => {
      const key = item.section || "Ingredients";
      map.set(key, [...(map.get(key) || []), item]);
    });
    return [...map.entries()];
  }, [ingredients]);

  const pinterestUrl = new URL("https://www.pinterest.com/pin/create/button/");
  if (imageUrl) pinterestUrl.searchParams.set("media", imageUrl);
  pinterestUrl.searchParams.set("url", pageUrl);
  pinterestUrl.searchParams.set("description", title + " — " + description);

  async function shareInstagramStory() {
    const shareData = { title, text: description, url: pageUrl };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(pageUrl);
        window.alert("Recipe link copied. Open Instagram, create a Story, and add the link.");
      } else {
        window.prompt("Copy this recipe link for your Instagram Story:", pageUrl);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        window.prompt("Copy this recipe link for your Instagram Story:", pageUrl);
      }
    }
  }

  return (
    <>
      <div className="recipe-share-bar" aria-label="Share this recipe">
        <a className="recipe-share-button recipe-share-pin" href={pinterestUrl.toString()} target="_blank" rel="noopener noreferrer">Pin It</a>
        <a className="recipe-share-button recipe-share-facebook" href={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageUrl)} target="_blank" rel="noopener noreferrer">Share on Facebook</a>
        <button className="recipe-share-button recipe-share-instagram" type="button" onClick={shareInstagramStory}>Share to Instagram Story</button>
      </div>

      <section className="print-recipe-card" id="recipe-card" aria-labelledby="print-recipe-title">
        <div className="print-card-topline"><span className="recipe-card-eyebrow">THE RECIPE</span><span className="recipe-card-brand">Recipes by Maren</span></div>
        <h2 id="print-recipe-title">{title}</h2>
        <p className="print-card-description">{description}</p>
        <div className="print-card-toolbar">
          <div className="print-card-stats">
            {prepMinutes !== null && <span><small>PREP</small><strong>{prepMinutes} min</strong></span>}
            {cookMinutes !== null && <span><small>COOK</small><strong>{cookMinutes} min</strong></span>}
            {totalMinutes !== null && <span><small>TOTAL</small><strong>{totalMinutes} min</strong></span>}
            {difficulty && <span><small>LEVEL</small><strong>{difficulty}</strong></span>}
          </div>
          <button className="recipe-print-button" type="button" onClick={() => window.print()}>Print Recipe</button>
        </div>
        <div className="recipe-serving-control">
          <span>Servings</span>
          <div>
            <button type="button" aria-label="Decrease servings" onClick={() => setCurrentServings(v => Math.max(1, v - 1))}>−</button>
            <strong>{currentServings}</strong>
            <button type="button" aria-label="Increase servings" onClick={() => setCurrentServings(v => Math.min(48, v + 1))}>+</button>
          </div>
        </div>
        <div className="print-card-columns">
          <div className="print-card-ingredients">
            <h3>Ingredients</h3>
            {grouped.map(([section, items]) => (
              <div className="recipe-ingredient-group" key={section}>
                {section !== "Ingredients" && <h4>{section}</h4>}
                <ul>
                  {items.map(item => (
                    <li key={item.id} className={checked.includes(item.id) ? "is-checked" : ""}>
                      <label><input type="checkbox" checked={checked.includes(item.id)} onChange={e => setChecked(old => e.target.checked ? [...old, item.id] : old.filter(id => id !== item.id))} /><span>{scaledQuantity(item.quantity, factor)} {item.item}</span></label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="print-card-instructions">
            <h3>Instructions</h3>
            <ol>
              {instructions.map((step, index) => <li key={step.id}><span className="print-step-number">{index + 1}</span><div>{step.title && <h4>{step.title}</h4>}<p>{step.body}</p></div></li>)}
            </ol>
          </div>
        </div>
        <p className="print-card-footer">Made with care by Recipes by Maren · {pageUrl}</p>
      </section>
    </>
  );
}
