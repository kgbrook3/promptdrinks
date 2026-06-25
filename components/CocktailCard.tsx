import type { Cocktail } from "@/lib/types";
import { cdnImage } from "@/lib/img";

export default function CocktailCard({
  cocktail,
  imageLoading = false,
}: {
  cocktail: Cocktail;
  imageLoading?: boolean;
}) {
  return (
    <article className="cocktail">
      <div className="photo">
        {cocktail.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cdnImage(cocktail.imageUrl, { w: 800, q: 80 })}
            alt={cocktail.name}
            decoding="async"
          />
        ) : imageLoading ? (
          <div className="photo-loading">
            <span className="shaker">🍸</span>
            <p>Pouring your photo…</p>
          </div>
        ) : (
          <span className="placeholder">🍸</span>
        )}
      </div>
      <div className="body">
        <h2>{cocktail.name}</h2>
        {cocktail.tagline && <p className="tagline">{cocktail.tagline}</p>}
        {cocktail.description && <p className="desc">{cocktail.description}</p>}

        <div className="meta">
          {cocktail.mocktail && <span className="badge">Mocktail 🚫🍸</span>}
          {cocktail.glassware && (
            <span>
              <b>Glass:</b> {cocktail.glassware}
            </span>
          )}
          {cocktail.garnish && (
            <span>
              <b>Garnish:</b> {cocktail.garnish}
            </span>
          )}
          {cocktail.prepTime && (
            <span>
              <b>Prep:</b> {cocktail.prepTime}
            </span>
          )}
          {cocktail.difficulty && (
            <span>
              <b>Difficulty:</b> {cocktail.difficulty}
            </span>
          )}
        </div>

        <h3>Ingredients</h3>
        <ul>
          {cocktail.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>

        <h3>Instructions</h3>
        <ol>
          {cocktail.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </article>
  );
}
