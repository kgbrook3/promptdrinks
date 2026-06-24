import type { Cocktail } from "@/lib/types";

export default function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  return (
    <article className="cocktail">
      <div className="photo">
        {cocktail.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cocktail.imageUrl} alt={cocktail.name} />
        ) : (
          <span className="placeholder">🍸</span>
        )}
      </div>
      <div className="body">
        <h2>{cocktail.name}</h2>
        {cocktail.tagline && <p className="tagline">{cocktail.tagline}</p>}
        {cocktail.description && <p className="desc">{cocktail.description}</p>}

        <div className="meta">
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
