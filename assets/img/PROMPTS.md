# Re-render prompts

Five images display wider than their native 896px: the hero and the four
seasons. The layout insets them so nothing is scaled past its native width,
which is why the current set looks right. Re-render these at 2K and the hero
and seasons can go full bleed instead.

The other seven need nothing.

## Before you paste

Set these in the Higgsfield UI. Prompt text does not control them.

- Resolution: **2K**
- Aspect ratio: **16:9**
- Model: **nano_banana_2** (same as the rest of the set)

## Order

Render summer first. Attach that new 2K summer as the reference image for
spring, autumn and winter. Do not chain them off each other or the garden
drifts between seasons.

---

## hero-garden

No reference image.

> A large English country garden at golden hour, wide establishing shot, 2K
> resolution, 16:9 landscape. Striped mown lawn in the foreground curving
> toward deep mixed herbaceous borders in full flower with delphiniums, roses
> and poppies. A weathered red-brick manor house sits back-left, climbing
> roses on its walls, screened by mature oaks. Warm low sun raking across from
> the right, long soft shadows on the grass. Open sky across the top third,
> main visual interest low and to the right. Shot on 35mm film, muted
> desaturated greens, soft realistic depth of field, no people, no text, no
> watermark, editorial architectural photography.

## season-summer

No reference image. Render this one first.

> A walled English country garden in high summer, wide shot straight down a
> striped grass path, 2K resolution, 16:9 landscape. Borders at full height
> either side with blue delphiniums, white lupins and pale roses. A
> honey-coloured Cotswold stone cottage at the far end. Clear sky, warm late
> evening light. Generous open space through the middle of the frame, detail
> concentrated along the edges. Shot on 35mm film, muted desaturated greens,
> soft realistic depth of field, no people, no text, no watermark, editorial
> architectural photography.

## season-spring

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 2K resolution, 16:9 landscape. Early spring: bare and
> budding trees, tulips and narcissi filling the borders in red, yellow and
> white, fresh acid-green new growth. Bright cool morning light, pale clear
> sky. Shot on 35mm film, soft realistic depth of field, no people, no text,
> no watermark, editorial architectural photography.

## season-autumn

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 2K resolution, 16:9 landscape. Autumn: acers and beech in
> deep copper and red, ornamental grasses and seed heads gone over, fallen
> leaves scattered across the grass path. Low misty golden light. Shot on 35mm
> film, soft realistic depth of field, no people, no text, no watermark,
> editorial architectural photography.

## season-winter

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 2K resolution, 16:9 landscape. Hard frost on the lawn and
> on clipped box topiary, bare architectural branches, seed heads rimed white.
> Flat cold overcast light, low winter sun, muted blue-grey palette, the
> structure of the garden clearly visible. Shot on 35mm film, soft realistic
> depth of field, no people, no text, no watermark, editorial architectural
> photography.

---

## What went wrong the first time

Three prompts in the original run carried instruction text into the scene
description, which the model tries to render:

- `1600x1600 (square)` at the head of the closing terrace prompt
- `plus the suffix with the winter light swap above` on winter
- `(same view as summer, reference image attached)` on spring

Keep the prompt to what the camera would see. Everything else belongs in the
UI or in your head.
