# Image manifest

Eleven stills in use. All generated on Higgsfield (nano_banana_2) at 2K, and
the prompts that made them are in `PROMPTS.md`.

The hero is no longer a still. It is a video, in `assets/video/`, with a frame
of itself as the poster.

| Slot | Shows | Ladder |
|---|---|---|
| `service-design` | yew corridor, gravel path, stone bench | 900 / 1800 |
| `service-driveways` | Cotswold house, block paving, lavender | 900 / 1800 |
| `service-patios` | oak pergola, festoon lights, roses | 900 / 1800 |
| `service-planting` | delphinium and allium border | 900 / 1800 |
| `before-garden` | 1930s semi, cracked slabs, bins | 675 / 1350 |
| `after-garden` | same view, herringbone paving, planter | 675 / 1350 |
| `season-spring` | cottage, tulips and narcissi | 620 / 1240 |
| `season-summer` | cottage, delphiniums, blue and white | 620 / 1240 |
| `season-autumn` | cottage, copper acers, fallen leaves | 620 / 1240 |
| `season-winter` | cottage, frosted topiary | 620 / 1240 |
| `closing-terrace` | blue hour, lit windows, path lights | 664 / 1440 |

`og-card.jpg` is the social preview card and is not part of any ladder.

## Ladders

Every slot ships as WebP with a JPEG beside it, at two widths, wired up with
`srcset` and a `sizes` hint that matches what the layout actually gives the
element. The small step is the CSS width; the large step is twice it, for
retina. This is the part that is easy to get wrong: a browser on a 2x screen
needs 1800 real pixels to fill an 900px slot, and `naturalWidth` will not tell
you when it is short, because it reports the density-corrected number. Measure
against the file on disk instead.

The four trade panels are landscape, not portrait: the expanded panel is
817x560, so a portrait source would be cropped to a strip.

## Masters

The 2K PNG masters are gitignored. They stay in the Higgsfield gallery, and
`PROMPTS.md` records how to regenerate any of them. Committing them tripled
the size of the repo for files the site never serves.

`closing-terrace` is cropped from its master: full width, 1976px tall from
y=169, then resized. Anything regenerated from that master needs the same crop
or the plate shifts.

## The before and after pair

They share a camera position. Never recrop one without the other or the
slider stops lining up.
