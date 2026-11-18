import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Easy Dinner Ideas, Cozy Bakes & Everyday Recipes",
  description:
    "Find approachable dinner ideas, comforting one-pot meals, fresh seasonal inspiration, and simple bakes for everyday home cooking.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Recipes by Maren — Real Food for Real Life",
    description:
      "Approachable dinner ideas, cozy bakes, and simple recipes for everyday home cooking.",
    type: "website"
  }
};

const categories = [
  {
    name: "Weeknight Dinners",
    count: "Easy ideas for busy evenings",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80",
    alt: "A colorful, freshly prepared dinner served at home"
  },
  {
    name: "One-Pot Favorites",
    count: "Less cleanup, more comfort",
    image: "https://images.unsplash.com/photo-1476124369491-e7da6fcca9a8?auto=format&fit=crop&w=700&q=80",
    alt: "A comforting one-pot meal ready to serve"
  },
  {
    name: "Something Sweet",
    count: "Bakes, treats & little joys",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80",
    alt: "A sweet dessert with fresh fruit"
  },
  {
    name: "Fresh & Feel-Good",
    count: "Bright, colorful everyday meals",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    alt: "A fresh salad with colorful seasonal vegetables"
  }
];

const recipes = [
  {
    title: "Creamy Tuscan Chicken",
    category: "Weeknight favorite",
    description: "Golden chicken in a cozy garlic cream sauce with spinach and sun-dried tomatoes.",
    time: "30 minutes",
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=900&q=85",
    alt: "Creamy chicken dinner with herbs and vegetables"
  },
  {
    title: "Lemon Butter Orzo",
    category: "One-pot comfort",
    description: "A bright, silky orzo dinner with lemon, herbs, and a little parmesan.",
    time: "25 minutes",
    image: "https://images.unsplash.com/photo-1476124369491-e7da6fcca9a8?auto=format&fit=crop&w=900&q=85",
    alt: "A bowl of orzo pasta ready to enjoy"
  },
  {
    title: "Strawberry Crumble Bars",
    category: "Something sweet",
    description: "Buttery oat layers, juicy berries, and crisp golden edges in every bite.",
    time: "45 minutes",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85",
    alt: "Homemade strawberry dessert bars"
  }
];

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Recipes by Maren",
    url: siteUrl,
    description: "Real food. Simple recipes. Made with care."
  };

  return (
    <main className="site-shell" id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="home-heading">
        <div className="hero-copy">
          <span className="eyebrow">Welcome to my kitchen</span>
          <h1 id="home-heading">Good food for <em>real life.</em></h1>
          <p className="hero-description">
            Simple, feel-good recipes made for the moments that matter — from quick weeknight dinners to something sweet just because.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#latest">Explore recipes</a>
            <a className="text-link" href="/about">A note from Maren</a>
          </div>
        </div>
        <div className="hero-image" role="img" aria-label="A colorful table of fresh, homemade food">
          <div className="hero-note">
            <strong>Made for sharing.</strong>
            <span>Simple ingredients · Happy tables</span>
          </div>
        </div>
      </section>

      <section className="section" id="categories" aria-labelledby="categories-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Find your next favorite</span>
            <h2 id="categories-heading">What sounds good today?</h2>
          </div>
          <p>A little something for every kind of craving.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <div className="category-photo-wrap">
                <div className="category-photo" role="img" aria-label={category.alt} style={{ backgroundImage: `url("${category.image}")` }} />
              </div>
              <h3>{category.name}</h3>
              <span>{category.count}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="featured-section" id="latest" aria-labelledby="latest-heading">
        <div className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">From the recipe box</span>
              <h2 id="latest-heading">A few things to make soon</h2>
            </div>
            <a className="text-link" href="#categories">Explore categories</a>
          </div>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <article className="recipe-card" key={recipe.title}>
                <div className="recipe-photo" role="img" aria-label={recipe.alt} style={{ backgroundImage: `url("${recipe.image}")` }} />
                <div className="recipe-info">
                  <span className="recipe-meta">{recipe.category}</span>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.description}</p>
                  <span className="recipe-time"><span aria-hidden="true">◷</span> &nbsp; {recipe.time}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-strip" id="about" aria-labelledby="about-heading">
        <div className="about-photo" role="img" aria-label="A warm, light-filled home kitchen" />
        <div className="about-copy">
          <span className="eyebrow">A seat at my table</span>
          <h2 id="about-heading">Cooking should feel like coming home.</h2>
          <p>
            Around here, good food does not need to be complicated. This is a place for dependable favorites, fresh inspiration, and recipes that make everyday cooking feel a little more special.
          </p>
          <a className="text-link" href="/about">Get to know this kitchen</a>
        </div>
      </section>

      <section className="newsletter" id="newsletter" aria-labelledby="newsletter-heading">
        <span className="eyebrow">A good thing in your inbox</span>
        <h2 id="newsletter-heading">Let’s make something lovely.</h2>
        <p>Our newsletter sign-up is being prepared. In the meantime, explore the recipe collection and find a new favorite.</p>
        <a className="button-primary newsletter-link" href="#latest">Explore the recipe box</a>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
    </main>
  );
}
