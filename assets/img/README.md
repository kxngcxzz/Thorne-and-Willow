# Image manifest

Eleven stills in use. All generated on Higgsfield (nano_banana_2) at 2K, and
the prompts that made them are in `PROMPTS.md`.

The hero is no longer a still. It is a video, in `assets/video/`, with a frame
of itself as the poster.

| Slot | Shows | Ladder |
|---|---|---|
| `service-design` | yew corridor, gravel path, stone bench | 640 / 1264 / 2458 |
| `service-driveways` | Cotswold house, block paving, lavender | 640 / 1264 / 2528 |
| `service-patios` | oak pergola, festoon lights, roses | 640 / 1264 / 2528 |
| `service-planting` | delphinium and allium border | 640 / 1264 / 2528 |
| `before-garden` | 1930s semi, cracked slabs, bins | 448 / 896 / 1792 |
| `after-garden` | same view, herringbone paving, planter | 448 / 896 / 1792 |
| `season-spring` | cottage, tulips and narcissi | 448 / 896 / 1792 |
| `season-summer` | cottage, delphiniums, blue and white | 448 / 896 / 1792 |
| `season-autumn` | cottage, copper acers, fallen leaves | 448 / 896 / 1792 |
| `season-winter` | cottage, frosted topiary | 448 / 896 / 1792 |
| `closing-terrace` | blue hour, lit windows, path lights | 448 / 896 / 1792 |

`og-card.jpg` is the social preview card and is not part of any ladder.

## Ladders

Every slot ships as WebP with a JPEG beside it, at three widths, wired up with
`srcset` and a `sizes` hint. Two things about this are easy to get wrong, and
both were got wrong once already.

**`sizes` must declare the PAINTED width, not the box width.** Under
`object-fit: cover` the box's height often drives the scale, and then the image
paints wider than its box. The expanded trade panel is 817 CSS px across but
560 tall, and cover scales it to that height, so it paints 896 wide. Declaring
817 fetches a file that is short. The browser's own srcset arithmetic is
`sizes x dpr` and never sees the crop, so it cannot catch this for you.

**Aim above 1.0x, not at it.** A ladder of "CSS width" and "2x CSS width" lands
on exactly 1.00x headroom at 2x by construction, which means the file is
painted pixel-for-pixel with no downsampling at all. That is what made these
look soft on desktop while looking fine on a phone, where the same file was
being downsampled about 2:1. The top rung is now the master's full width,
which puts every slot at 1.3x to 1.5x.

`naturalWidth` will not tell you when a file is short: it reports the
density-corrected number, so an 1800px file reads as 900 on a 2x screen.
Measure against the file on disk.

The four trade panels are landscape, not portrait: the expanded panel is
817x560, so a portrait source is cropped to a strip.

## Deferred seasons

Only one season is on screen at a time, so the other three ship with
`data-srcset` and no `src` and `main.js` fills them in on demand: 2.2MB kept
off the initial load. It warms them during idle time so the first tab click
does not sit on a blank, and skips that warm-up on save-data and 2G. Summer is
the one left real in the markup, which is what a visitor with no JavaScript
sees.

## Masters

The 2K PNG masters are gitignored. They stay in the Higgsfield gallery, and
`PROMPTS.md` records how to regenerate any of them. Committing them tripled
the size of the repo for files the site never serves.

Crops are recovered from the previous derivatives so nothing reframes between
regenerations. Full master width unless noted, then resized:

| Slot | Crop | From |
|---|---|---|
| `service-*` (three landscape) | 2528x1580 | y=58 |
| `service-design` | 2458x1536 | centred, x=147 |
| `before-garden`, `after-garden` | 1792x2389 | y=5 |
| `season-*` | 1792x2254 | y=43 |
| `closing-terrace` | 1792x1975 | y=170 |

`closing-terrace` is the one slot its master cannot comfortably cover. That
section is not inside the wrap -- it tracks 46vw -- so on a screen wider than
about 1940px it outgrows the 1792px master. At 1920 it sits at 1.01x.

## The before and after pair

They share a camera position. Never recrop one without the other or the
slider stops lining up.
