#!/bin/sh
# Zips the extension for the Chrome Web Store and a GitHub release: only what the browser loads, plus the licence.
set -eu
cd "$(dirname "$0")"
version=$(plutil -extract version raw manifest.json)
out="dist"
zip="TrustyLoop-$version.zip"
rm -rf "$out"
mkdir -p "$out"
# -X leaves out macOS extra file attributes (owner ids, metadata) that the browser never needs.
zip -q -r -X "$out/$zip" manifest.json LICENSE *.js *.html *.css icons
(cd "$out" && shasum -a 256 "$zip" > "$zip.sha256")
echo "Built: $PWD/$out/$zip"
unzip -l "$out/$zip" | tail -n +4 | sed '$d' | sed '$d' | awk '{print "  " $4}'
