# Thorne & Willow. Landscape gardeners (demo build)

A portfolio build of a marketing site for a fictional landscape gardening
company working across Surrey and West Sussex.

**Live demo:** https://kxngcxzz.github.io/thorne-and-willow/

> Thorne & Willow is not a real company. The photography is generated, the
> numbers are illustrative, and the site is `noindex` so it never turns up in
> search against a real landscaper's pages.

---

## What this is

Static site. No framework, no build step, no dependencies. The repository root
is the deployable site.

| | |
|---|---|
| HTML, CSS, JS | 46 KB |
| Fonts (3 variable faces, subsetted) | 86 KB |
| First paint | markup, styles, two fonts and the hero, ~260 KB |
| Third-party requests at runtime | none |

## Build notes

**The palette is deliberately not the obvious one.** Warm cream, brass and
espresso is the default reach for anything premium and hand-made, and it is
the reason most of those sites look interchangeable. It also goes muddy
against wall-to-wall green photography. This one runs a chalk ground, an
olive-black ink and one deep heritage blue. The blue is doing real work: it is
the only saturated thing on the page, so every call to action is unmissable
without shouting.

**Typography is self-hosted and subsetted.** EB Garamond for display, Archivo
for text. Both faces ship as variable fonts, so three files cover every weight
and style the page uses, subsetted to latin plus the punctuation the copy
actually contains. 86 KB total, no font CDN, and text never waits on a
third-party stylesheet.

The whole typographic idea is roman with one italic word per line. Italic
descenders need clearance, so display type carries `padding-bottom` on the
wrapping element rather than tight leading, which would clip the `y` in
"tenth year".

**Nothing is enlarged past its resolution.** Every photograph is 896 px on its
long edge. Rather than running the hero and the seasons edge to edge and
scaling them up, the layout insets both, so no image is ever displayed above
its native width at any breakpoint. `assets/img/PROMPTS.md` carries the
prompts to re-render those five at 2K, at which point full bleed becomes an
option.

**The interactive pieces are CSS with a little JavaScript.**

- *Four trades* is a flex row where the open panel takes `flex-grow`. Hover
  opens it on a pointer, click and keyboard open it everywhere. Below 900 px
  it becomes a plain stack, because a 130 px column cannot hold a photograph.
- *Before and after* is two images of the same camera position, the top one
  clipped by a CSS variable the handle writes to. It works with a mouse, a
  finger, a pen, and arrow keys.
- *Seasons* cross-fades four photographs of one garden through the year.
- The *process* stem is an SVG path whose dash length is measured with
  `getTotalLength()` rather than guessed, so the line neither snaps in early
  nor stops short.

**Contrast is measured, not eyeballed.** The craft panels put light text over
photographs that run bright at the bottom, so the scrim was tuned against
sampled pixel luminance. Worst case across the four panels is 11.2:1.

**Progressive enhancement.** Every section reads and every link works with
JavaScript blocked. Anything that animates in is visible by default; a marker
script in `<head>` adds a `js` class, and only then does CSS hide it, so a
browser that cannot bring an element back never hides it in the first place.
There are no scroll listeners anywhere: reveal, nav state and the stem draw
all run on `IntersectionObserver`.

**Accessibility.** Skip link, landmark elements, a slider that exposes
`aria-valuenow` and moves on arrow keys, tabs wired with roving arrow-key
focus, a keyboard-operable menu that closes on Escape, outside click and
resize, visible focus rings, 44 px touch targets, and a full
`prefers-reduced-motion` path.

## Layout

```
.
├── index.html
├── 404.html                    self-contained, so it renders from any URL depth
├── robots.txt                  noindex, this is a demo
├── site.webmanifest
├── .github/workflows/pages.yml verify, then deploy
├── scripts/check-links.sh      pre-deploy integrity check
└── assets/
    ├── css/styles.css
    ├── css/fonts.css           @font-face for the subsetted variable faces
    ├── js/main.js
    ├── fonts/                  3 woff2, latin subset
    └── img/                    12 in use as .jpg and .webp, 3 spares, plus
                                the source .png masters and PROMPTS.md
```

## Running it

```bash
python3 -m http.server 8000     # then open http://localhost:8000
bash scripts/check-links.sh     # the same check CI runs before deploying
```

`check-links.sh` resolves every local reference in every HTML file, checks each
in-page anchor against a real `id`, and fails on a `file://` link or a
base64-inlined image. The deploy is gated on it.

## Verified

Driven in headless Chromium at 1440, 1280, 1024, 900, 768, 430, 390 and 320 px:

- no horizontal overflow at any width, no console errors, no failed requests
- all 12 images load, served as WebP, none displayed above its native width
- every image carries explicit `width` and `height`, so nothing shifts as it loads
- the accordion, slider, season tabs, stem draw and mobile menu all exercised,
  by pointer and by keyboard
- the whole page still reads with JavaScript disabled, with nothing left
  invisible
- every interactive target at least 44 px on touch widths
