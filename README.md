# PromptDrinks

Type anything — a mood, a memory, a movie, a color — and PromptDrinks invents a bespoke
cocktail: a name, a generated photo, ingredients, and step-by-step instructions. Every
drink is saved to a growing gallery.

## Stack

- **Next.js 14** (App Router) — UI + serverless API routes
- **Claude** (`@anthropic` Messages API) — generates the cocktail recipe as structured JSON
- **Image API** (OpenAI by default) — generates the cocktail photo
- **Netlify Blobs** — stores cocktails and images; powers the gallery
- **Netlify** — hosting + deploy

## How it works

1. The hero has a single input. On submit it `POST`s to `/api/generate`.
2. `/api/generate` asks Claude (via a forced tool call) for a structured recipe, then asks
   the image API for a photo, stores both in Netlify Blobs, and returns the cocktail.
3. The gallery (`/gallery`) and the home page's "Recently mixed" strip read saved cocktails
   from Blobs via `/api/cocktails`.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Netlify Blobs runs in a local sandbox during `next dev`. For a fully Netlify-accurate local
run, use `netlify dev` (requires the Netlify CLI).

## Environment variables

| Variable            | Required | Default             | Purpose                                  |
| ------------------- | -------- | ------------------- | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | —                   | Claude recipe generation                 |
| `OPENAI_API_KEY`    | yes      | —                   | Cocktail image generation                |
| `CLAUDE_MODEL`      | no       | `claude-sonnet-4-6` | Claude model                             |
| `IMAGE_MODEL`       | no       | `gpt-image-1`       | Image model                              |
| `IMAGE_SIZE`        | no       | `1024x1024`         | Generated image size                     |

Set these in **Netlify → Site settings → Environment variables** for production.

## Deploy

Connected to GitHub and Netlify. Pushing to the default branch triggers a Netlify build via
`netlify.toml` and the Next.js plugin.

> Drink responsibly. Recipes are AI-generated; double-check ingredients and measurements.
