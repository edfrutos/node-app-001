#!/usr/bin/env bash
set -euo pipefail

# Uso:
#   ./scripts/release.sh patch   -> v0.1.2
#   ./scripts/release.sh minor   -> v0.2.0
#   ./scripts/release.sh major   -> v1.0.0
#
# Requisitos:
# - git limpio (sin cambios sin commit)
# - tag que vas a crear no exista
# - npm instalado

bump="${1:-}"

if [[ "$bump" != "patch" && "$bump" != "minor" && "$bump" != "major" ]]; then
  echo "Uso: $0 {patch|minor|major}"
  exit 1
fi

# 1) Comprobar repo limpio
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Tienes cambios sin commit. Haz commit o stashea antes."
  git status --porcelain
  exit 1
fi

# 2) Asegurar main y actualizado
branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "main" ]]; then
  echo "ERROR: Estás en '$branch'. Cambia a 'main' para release."
  exit 1
fi

git fetch origin main --tags
git pull --ff-only origin main

# 3) Bump versión (sin tag todavía)
# npm version:
# - actualiza package.json (+ lock)
# - crea commit y tag si no le dices lo contrario
# Aquí lo hacemos en dos pasos para controlar el mensaje.
new_version="$(npm version "$bump" --no-git-tag-version)"
# new_version viene como "v0.1.2"
version_no_v="${new_version#v}"

echo "Nueva versión: $new_version"

# 4) Commit de versión
git add package.json package-lock.json 2>/dev/null || true
git commit -m "release: $new_version"

# 5) Crear tag (si ya existiera, aborta)
if git rev-parse "$new_version" >/dev/null 2>&1; then
  echo "ERROR: El tag $new_version ya existe."
  exit 1
fi

git tag "$new_version"

# 6) Push main + tag
git push origin main
git push origin "$new_version"

echo "OK: Release $new_version publicado (commit + tag)."
echo "Ahora GitHub Actions debería construir/pushear la imagen y crear el GitHub Release."
