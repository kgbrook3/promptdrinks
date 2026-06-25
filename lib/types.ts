export interface Cocktail {
  id: string;
  prompt: string;
  name: string;
  tagline: string;
  description: string;
  glassware: string;
  garnish: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  createdAt: string;
  prepTime?: string;
  difficulty?: string;
  mocktail?: boolean;
  cheers?: number;
}

export type CocktailSummary = Pick<
  Cocktail,
  "id" | "name" | "tagline" | "prompt" | "imageUrl" | "createdAt" | "mocktail" | "cheers"
>;
