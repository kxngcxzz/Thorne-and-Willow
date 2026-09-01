# Checks

Four browser checks, plus a report. They exist because this site was twice
shipped with a defect that a *modelled* check called fine, and only measuring
real rendered pixels caught it.

Run a server on the repo root first (`python3 -m http.server 8413`), then:

    python3 scripts/checks/contrast.py     # WCAG, from rendered glyph pixels
    python3 scripts/checks/resolution.py   # srcset headroom, object-fit aware
    python3 scripts/checks/smoke.py        # overflow and interactions
    python3 scripts/checks/seasons.py      # the deferred-season behaviour
    python3 scripts/checks/weight.py       # what each visitor downloads

`SITE_URL` overrides the address, `CHROME_PATH` the browser binary.
`contrast.py`, `resolution.py` and `smoke.py` exit non-zero on failure.

## What each one is guarding

**contrast.py** shoots every text element twice, once visible and once
hidden, finds the glyph pixels as the ones that changed, and compares what
actually reached the screen against the backdrop behind those same pixels.

The obvious way to write this is to read the element's computed colour,
composite it over a screenshot of the backdrop, and report that. That version
shipped, and it was blind to the bug it most needed to catch: the crafts
scrim is an `::after`, which the browser generates as the last child, so with
everything on `z-index: auto` it painted *over* the text. Near-white copy was
reaching the screen at about 1.6:1 while the model happily reported 11:1.
A model cannot see anything that paints on top of the text. Pixels can.

**resolution.py** works out what each file has to be to fill its box, taking
`object-fit` into account, and reports the headroom.

Two traps here. `naturalWidth` is density-corrected -- on a 2x screen an
1800px srcset-selected file reports as 900 -- so sizes come from disk, not
from the DOM. And under `object-fit: cover` the box's *height* often drives
the scale, so the file must be wider than the box: the expanded trade panel
is 817 CSS px across but paints 896. Comparing against box width alone says
everything is fine while desktop visibly softens.

Aim for headroom above about 1.2x. A ladder built as "CSS width" and "twice
CSS width" lands on exactly 1.00x, which means no downsampling at all, and
that reads as soft next to a phone getting the same file at 2:1.
