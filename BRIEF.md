# Build brief: editorial site for a local trade business

Paste this whole file into a fresh Claude Code session, fill in the
**Client** block, and it will build a site of the same class as this one.

The structure below is worth having. The **Traps** section is worth more:
every one of those cost a real debugging round on this build, and most of
them are invisible until you measure the right thing.

---

## Client

Fill this in. Everything else is fixed.

- **Trade:** landscape gardener / builder / joiner / stonemason / ...
- **Name:** two surnames joined by an ampersand reads best in this style
- **Territory:** county or two, named
- **Founded:** a year, used for a "since" line
- **Four services:** the things they actually sell
- **Three numbers:** jobs done, years running, repeat rate
- **One sentence of proof:** what a customer said, in their words
- **Phone number** for the call-to-action

---

## The shape

One page, nine sections, in this order. No framework, no build step, no
dependencies. Three files: `index.html`, `assets/css/styles.css`,
`assets/js/main.js`. Repo root is the deployable site.

1. **Hero** — full screen (`100svh`). One photograph, edge to edge, no
   video. Copy is a centred column: a letterspaced kicker between two thin
   rules, a very large serif headline whose second line is italic, one line
   of body, then three facts in translucent slabs.
2. **Manifesto** — one short paragraph at display size on paper. No image.
   It exists to slow the page down after the hero.
3. **Services** — a horizontal accordion of four panels. Collapsed panels
   show a vertical label; the open one grows to about six times the others
   and reveals a heading and two lines. `flex-grow` transition, not width.
   Stacks vertically under 900px.
4. **Before / after** — one wide landscape pair under a drag handle,
   `clip-path: inset()` driven by a custom property. Full column width,
   copy stacked above.
5. **Seasons** — full-bleed, full-height, one enormous italic word over the
   photograph. Advances itself every 5.2s; tabs underneath.
6. **Process** — three or four steps on tinted paper, left aligned, joined
   by a thin vertical stem that draws itself as the section arrives.
7. **Proof** — three large serif numerals that count up as they arrive,
   with the customer sentence beneath.
8. **Closing** — full-bleed photograph, the invitation centred on it in one
   translucent card with the phone CTA.
9. **Footer** — ink ground, wordmark, links.

## The look

Warm paper and near-black ink, never pure white or pure black. One accent
used sparingly, on buttons and small marks only.

```
--paper #ecede7   --paper-2 #e2e4db   --ink #1c1f19
--ink-soft #565c50   --ink-quiet #7b8173   --rule #c9ccc0
--accent #294c63   --on-dark #f2f3ee
--display "EB Garamond"   --body "Archivo"
--wrap 1344px   --nav-h 72px   --gutter clamp(20px, 4vw, 48px)
--ease cubic-bezier(0.22, 0.61, 0.36, 1)
```

Type scale, all `clamp()` so nothing needs a breakpoint:
`12px · 13-14 · 15-16 · 17-19 · 26-40 · 32-58 · 40-78 · 56-112`.

Serif for anything display sized, sans for anything you read. Italic is the
emphasis, never bold. Self-host two variable fonts, subsetted with
`pyftsubset`; do not link Google Fonts.

Motion: everything arrives with a 14px rise and a fade over 0.7s, triggered
by `IntersectionObserver`. No scroll listeners anywhere. Every animation
off under `prefers-reduced-motion`.

## The words

Short declarative sentences, lowercase display headlines, no exclamation
marks, no "we are passionate about". Name the thing that goes wrong in the
trade and say how you avoid it — that is what reads as expertise. Two
lines maximum per panel.

---

## Traps

These are the mistakes. They are ordered by how long each one took to find.

**1. `sizes` must declare the width the image is PAINTED, not the width of
its box.** Under `object-fit: cover` the box's *height* often drives the
scale, so the image paints wider than its box. A panel 817 CSS px across
and 560 tall paints 896 wide. Declare 817 and the browser fetches a file
that is short, and it cannot warn you: its arithmetic is `sizes × dpr` and
it never sees the crop. The same error inverts on a stacked mobile layout,
where the box is wider than the source aspect and *width* takes over.

**2. Aim above 1.0× headroom, not at it.** A ladder of "CSS width" and
"2× CSS width" lands on exactly 1.00× on a retina screen, which means the
file is painted pixel for pixel with no downsampling at all, and every
softness in the source shows. The same file on a phone gets downsampled 2:1
and looks fine — which is why "sharp on mobile, soft on desktop" is the
signature of this bug. Target 1.25×–1.4×.

**3. `naturalWidth` lies.** It is density-corrected: an 1800px
srcset-selected file reports as 900 on a 2× screen. Measure against the
file on disk.

**4. A `::after` scrim paints OVER the text.** Pseudo-elements are
generated as the last child, so with everything on `z-index: auto`,
positioned siblings paint in DOM order and the scrim lands on top of the
words. Near-white copy came out at 1.6:1 against its own backdrop. Any
section with text over a photograph needs the three layers ordered
explicitly: image 0, scrim 1, words 2.

**5. Full-bleed sections need a portrait crop for phones.** A 16:9 frame in
a tall narrow box means cover scales by height, enlarging it about three
times. The fix is not a bigger file, it is a differently shaped one: a
portrait crop served under `media="(max-width: 700px)"`, and slightly less
section height on a phone, since every extra vh of a landscape cover costs
source width.

**6. Measure rendered pixels, not a model.** The obvious contrast check —
read the computed colour, composite it over a screenshot of the backdrop —
is blind to anything painting on top of the text, which is exactly trap 4.
Shoot each element twice, visible and hidden, find the glyph pixels as the
ones that changed, and compare what actually reached the screen.

**7. Retune every scrim when the photograph changes.** A gradient tuned to
one frame's dark trees fails on another frame's open sky. The kicker — the
highest and smallest text — is the one that goes first.

**8. A before/after pair must share a camera position.** Verify it before
building: cross-correlate a region that cannot have changed, such as the
house wall. A few percent of vertical drift and the wipe visibly jumps. The
render only holds the camera if the first image is attached as the
reference for the second.

**9. Do not ship images nobody sees.** Four tabbed images where one is
visible is three wasted downloads. Ship the visible one, put the rest
behind `data-srcset` with no `src`, hydrate on demand and warm the rest
during idle. Skip the warm-up on save-data and 2G.

**10. Autoplay has three rules.** Only while the section is on screen;
pause with the browser tab; and any deliberate interaction stops it
permanently, because having the picture change under someone who has just
chosen is worse than it never moving. Never start under reduced motion.

**11. A count-up starts near the answer, not at zero.** Counting 0→412
changes the number's width and reflows the row. Start at about 94% of the
target, use `font-variant-numeric: tabular-nums`, ease out so the last
digits settle. Put the final figure in the markup so nothing has to run for
the page to be correct.

**12. Progressive enhancement needs a marker class.** Reveal-on-scroll that
hides elements in CSS leaves them hidden forever with JS off. Set a `js`
class from a script in `<head>` and scope the hidden state to it.

**13. Deleting old derivatives in the same commit that rewrites the HTML**
breaks the page for anyone holding cached HTML, because it now points at
files that no longer exist. Harmless if you know; alarming if you don't.

**14. `.gitignore` does not apply to files git already tracks.** An ignored
master will come back if it is ever committed once, including through a
merge.

---

## Images

One master per slot, gitignored, never served. Ladders generated from it as
WebP with a JPEG beside, three rungs, `srcset` + a `sizes` hint that obeys
trap 1.

Generate masters at **4K, 16:9, exported as JPEG q95**, not PNG. A 4K PNG
is 20MB+ and will not upload; the JPEG is about 4MB, and after downscaling
and re-encoding the difference is unmeasurable — RMSE 3.9 of 255, below the
WebP encode's own noise. Downscaling averages compression artefacts away.

Full-bleed slots need the most: 2880px across for a 1440 retina screen,
3840 for a 1920 one. Contained slots need far less.

Recover crops from existing derivatives by correlation rather than guessing,
so regenerating never reframes anything.

## Checks

Five scripts, run against a local server, all measuring the real page:

- **contrast** — WCAG from rendered glyph pixels, per trap 6
- **resolution** — srcset headroom, object-fit aware, per traps 1–3
- **smoke** — overflow, interactions, the hero is eager not lazy
- **deferred** — the right image loads, and only that one
- **weight** — what each kind of visitor actually downloads

Plus a link check that resolves every local reference including
`data-srcset` and the absolute social-card URLs, gating the deploy.

## Deploy

GitHub Pages via one Actions workflow that runs the link check first and
only deploys if it passes. If the Pages wizard offers to add a second
workflow, decline: two workflows race on the `pages` concurrency group and
which one wins is arbitrary.

Head carries a canonical link, Open Graph and Twitter tags with absolute
URLs, and a `LocalBusiness` JSON-LD block.
