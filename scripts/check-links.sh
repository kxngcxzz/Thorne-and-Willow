#!/usr/bin/env bash
# Resolve every local reference in every HTML file before the site deploys.
# Catches the failure that costs the most time: a renamed asset that still
# looks fine in the editor and 404s in production.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0
note() { printf '  %s\n' "$1"; }
bad()  { printf '  FAIL  %s\n' "$1"; fail=1; }

echo "Checking local references"

for html in $(find . -name '*.html' -not -path './.git/*' | sort); do
  echo "$html"

  # href/src targets, minus anchors, protocols and data URIs
  refs=$(grep -oE '(href|src|srcset)="[^"]+"' "$html" \
         | sed -E 's/^(href|src|srcset)="//; s/"$//' \
         | tr ',' '\n' \
         | sed -E 's/ +[0-9]+[wx]$//' \
         | sed -E 's/^ +//; s/ +$//' \
         | grep -vE '^(#|https?:|mailto:|tel:|data:)' \
         | grep -v '^$' | sort -u)

  for ref in $refs; do
    target="${ref%%#*}"
    [ -z "$target" ] && continue
    if [ "$target" = "/" ]; then continue; fi
    path="${target#/}"
    if [ -e "$path" ]; then note "ok    $ref"; else bad "$ref  (missing)"; fi
  done

  # in-page anchors must match a real id
  for anchor in $(grep -oE 'href="#[A-Za-z0-9_-]+"' "$html" \
                  | sed -E 's/href="#//; s/"$//' | sort -u); do
    if grep -q "id=\"$anchor\"" "$html"; then note "ok    #$anchor"
    else bad "#$anchor  (no matching id)"; fi
  done

  # Social card images are absolute URLs, so the loop above skips them. They
  # break silently: nothing on the page renders wrong, the preview is just
  # blank wherever the link gets shared. Check the path resolves locally.
  for meta in $(grep -oE '(property="og:image"|name="twitter:image") content="[^"]+"' "$html" \
                | grep -oE 'content="[^"]+"' | sed -E 's/^content="//; s/"$//' | sort -u); do
    local_path=$(printf '%s' "$meta" | sed -E 's#^https?://[^/]+/[^/]+/##')
    if [ -e "$local_path" ]; then note "ok    $local_path  (social card)"
    else bad "$meta  (social card image missing)"; fi
  done

  # things that must never ship
  if grep -q 'file://' "$html"; then bad "file:// link in $html"; fi
  if grep -qE 'src="data:image' "$html"; then bad "base64 image inlined in $html"; fi
done

echo
if [ "$fail" -eq 0 ]; then
  echo "All local references resolve."
else
  echo "Broken references found."
fi
exit "$fail"
