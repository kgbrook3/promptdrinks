#!/bin/bash
# PromptDrinks — clean up the repo and deploy.
# Double-click in Finder (or run: bash fix-and-deploy.command).
#
# It removes the stray nested copies (PromptDrinks, PromptDrinks 2) that Git
# turned into broken submodules, deletes junk files, then commits and pushes a
# clean tree. Your real app files at the root are kept untouched.

set -e
cd "$(dirname "$0")"
echo "==> Repo: $(pwd)"

echo "==> Removing stray nested repos and junk files..."
rm -rf "PromptDrinks" "PromptDrinks 2"
rm -f promptdrinks-app.zip promptdrinks-source.zip promptdrinks.zip ziEf5gRh zix2VK7e .DS_Store .gitmodules

echo "==> Removing them from Git tracking..."
git rm -r --cached --ignore-unmatch "PromptDrinks" "PromptDrinks 2" >/dev/null 2>&1 || true
git rm --cached --ignore-unmatch promptdrinks-app.zip promptdrinks-source.zip promptdrinks.zip ziEf5gRh zix2VK7e .DS_Store .gitmodules >/dev/null 2>&1 || true

echo "==> Staging clean tree (includes the lib/store.ts type fix)..."
git add -A

echo "==> Committing..."
git commit -m "Clean repo: remove stray submodules and junk; app stays at root" || echo "Nothing new to commit."

echo "==> Pushing to GitHub (branch: main)..."
git push

echo ""
echo "✅ Clean tree pushed. Netlify will rebuild automatically."
echo "   Watch it at https://app.netlify.com (project: fluffy-zuccutto-5cd546)"
echo ""
echo "Press any key to close."
read -n 1 -s
