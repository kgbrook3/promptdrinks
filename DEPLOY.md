# Deploying PromptDrinks

The full app is built and in this folder. Two things blocked full automation from my side:
the connected GitHub app can't create repositories, and the Netlify connector was
unresponsive. Here's the fast manual path — about 5 minutes.

## 1. Put the code on GitHub

Option A — from your machine (recommended):

```bash
cd PromptDrinks
git init
git add .
git commit -m "Initial commit: PromptDrinks"
gh repo create promptdrinks --public --source=. --push
# (or create an empty 'promptdrinks' repo on github.com, then:)
# git remote add origin https://github.com/kgbrook3/promptdrinks.git
# git branch -M main && git push -u origin main
```

Once an empty `promptdrinks` repo exists under your account, I can also push the files for
you — just say the word.

## 2. Connect Netlify

1. Netlify dashboard → **Add new site → Import an existing project → GitHub**.
2. Pick the `promptdrinks` repo. Netlify auto-detects Next.js (config is in `netlify.toml`).
3. Click **Deploy**. The first build installs deps and the Next.js runtime plugin.

## 3. Add environment variables (required)

Netlify → Site settings → **Environment variables** → add:

| Key                 | Value                         |
| ------------------- | ----------------------------- |
| `ANTHROPIC_API_KEY` | your Claude API key           |
| `OPENAI_API_KEY`    | your image-API key            |

Optional overrides: `CLAUDE_MODEL` (default `claude-sonnet-4-6`),
`IMAGE_MODEL` (default `gpt-image-1`), `IMAGE_SIZE` (default `1024x1024`).

Trigger a redeploy after adding them. Netlify Blobs needs **no** setup — it's auto-provisioned.

## 4. Point promptdrinks.com at it

Netlify → Domain management → add `promptdrinks.com` and follow the DNS steps (or use
Netlify DNS). HTTPS is automatic.

## Notes

- The image step is wired for OpenAI's image API by default. To use a different provider
  (Stability, Replicate, etc.), edit `generateImage()` in `lib/ai.ts`.
- If recipes generate but images don't, check `OPENAI_API_KEY` and the model name — the app
  intentionally still returns the recipe even if the image call fails.
