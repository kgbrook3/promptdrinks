#!/bin/bash
# PromptDrinks — one-click deploy.
# Double-click this file in Finder (or run: bash deploy.command).
# It commits the current code and pushes to GitHub, which triggers the
# connected Netlify build automatically.

set -e
cd "$(dirname "$0")"

REPO_URL="https://github.com/kgbrook3/promptdrinks.git"

echo "==> Deploying PromptDrinks from: $(pwd)"

# Initialise git + remote on first run.
if [ ! -d .git ]; then
  echo "==> Initialising git repository..."
  git init
  git branch -M main
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "==> Adding GitHub remote..."
  git remote add origin "$REPO_URL"
else
  git remote set-url origin "$REPO_URL"
fi

echo "==> Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "==> No new changes to commit (will still push current commit)."
else
  git commit -m "Deploy PromptDrinks update"
fi

echo "==> Pushing to GitHub (branch: main)..."
git push -u origin main

echo ""
echo "✅ Pushed. Netlify will detect the push and rebuild automatically."
echo "   Watch the deploy at: https://app.netlify.com  (project: fluffy-zuccutto-5cd546)"
echo ""
echo "Press any key to close this window."
read -n 1 -s
