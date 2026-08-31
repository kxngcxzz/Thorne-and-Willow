# Working on this repository

## Commit authorship

Every commit here is authored by Casey Mungofa <caseymungofa75@gmail.com>.
This is a portfolio repository: the work is presented as Casey's, so the
history has to read that way.

Before the first commit in any session, set the identity:

```bash
git config user.name  "Casey Mungofa"
git config user.email "caseymungofa75@gmail.com"
```

Never commit as `Claude <noreply@anthropic.com>`. It shows up as the commit
author on GitHub and as the actor on every Actions run, and it is a pain to
undo once pushed, because changing an author rewrites the SHA and needs a
force push.

The same applies to any other website built in this account.

## The site

Static. No framework, no build step, no dependencies. The repository root is
the deployable site. `README.md` covers the design decisions and what was
verified; `assets/img/PROMPTS.md` covers the photography.

## Before pushing

```bash
bash scripts/check-links.sh
```

CI gates the deploy on it, so a failure here is a failed deploy. It catches
the expensive mistake: an asset renamed in `assets/` but not in `index.html`.

## House rules for the markup

- One accent colour, one corner radius (0). Both are locked in `styles.css`.
- No image is ever displayed above its native width. Everything is 896 px on
  its long edge, so the hero and seasons are inset rather than full bleed.
  If those five are re-rendered at 2K, full bleed becomes an option.
- Anything that animates in must be visible by default. The `js` class on
  `<html>` is what allows CSS to hide it, so a browser that cannot bring an
  element back never hides it. The page has to read with JavaScript blocked.
- No em-dashes in copy.
