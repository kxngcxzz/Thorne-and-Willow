# Re-render prompts

Seven images, all **16:9 landscape**, all at the highest resolution you can
get. These are the slots that need to run edge to edge to match the
reference site, and they cannot: every one of their masters is portrait, so
a full-bleed treatment would enlarge them about 60%.

## Before you paste

Set these in the Higgsfield UI. Prompt text does not control them, and
anything about size or references that ends up in the prompt gets rendered
into the picture.

- Resolution: **4K**, not 2K
- Aspect ratio: **16:9**
- Model: **nano_banana_2** (same as the rest of the set)

4K matters here. A full-bleed slot on a 1440px retina screen needs 2880
real pixels across. 4K gives 3840 and lands at 1.33x headroom; 2K comes out
around 2560 and is already short at 0.89x, which is the softness we just
spent two passes removing.

## Order

**Seasons:** summer first. Attach that new summer as the reference image for
spring, autumn and winter. Do not chain them off each other or the garden
drifts between seasons.

**Before and after:** the before first, then attach it as the reference for
the after. They share a camera position and the slider only works while they
do -- if the two frames disagree, the wipe stops lining up and the section
is pointless.

**Closing terrace:** on its own, no reference.

---

## season-summer

No reference image. Render this one first.

> A walled English country garden in high summer, wide shot straight down a
> striped grass path, 4K resolution, 16:9 landscape. Borders at full height
> either side with blue delphiniums, white lupins and pale roses. A
> honey-coloured Cotswold stone cottage at the far end. Clear sky, warm late
> evening light. Generous open space through the middle of the frame, detail
> concentrated along the edges. Shot on 35mm film, muted desaturated greens,
> soft realistic depth of field, no people, no text, no watermark, editorial
> architectural photography.

## season-spring

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 4K resolution, 16:9 landscape. Early spring: bare and
> budding trees, tulips and narcissi filling the borders in red, yellow and
> white, fresh acid-green new growth. Bright cool morning light, pale clear
> sky. Shot on 35mm film, soft realistic depth of field, no people, no text,
> no watermark, editorial architectural photography.

## season-autumn

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 4K resolution, 16:9 landscape. Autumn: acers and beech in
> deep copper and red, ornamental grasses and seed heads gone over, fallen
> leaves scattered across the grass path. Low misty golden light. Shot on 35mm
> film, soft realistic depth of field, no people, no text, no watermark,
> editorial architectural photography.

## season-winter

Attach the new 2K summer as reference.

> Same walled garden, same cottage, same camera position and framing as the
> reference image, 4K resolution, 16:9 landscape. Hard frost on the lawn and
> on clipped box topiary, bare architectural branches, seed heads rimed white.
> Flat cold overcast light, low winter sun, muted blue-grey palette, the
> structure of the garden clearly visible. Shot on 35mm film, soft realistic
> depth of field, no people, no text, no watermark, editorial architectural
> photography.

---

## before-garden

No reference image. Render this one before the after.

> The back garden of a 1950s grey pebbledash semi-detached house, wide shot,
> 4K resolution, 16:9 landscape. Cracked and lifting concrete paving slabs
> across the foreground with weeds and dandelions growing through every
> joint. Patchy worn-out lawn behind, bare in places. Wheelie bins standing
> against the house wall, a close-board timber fence down the right side, a
> satellite dish on the wall. Flat grey overcast light, no sun. Ordinary and
> unloved, honest rather than ugly. Shot on 35mm film, muted desaturated
> colour, soft realistic depth of field, no people, no text, no watermark,
> editorial architectural photography.

## after-garden

Attach the new 4K before-garden as reference.

> Same house, same fence line, same camera position and framing as the
> reference image, 4K resolution, 16:9 landscape. The garden rebuilt:
> terracotta clay block paving laid in a herringbone pattern across the
> foreground, a low brick raised planter filled with ferns, hostas and
> evergreen shrubs, a crisply striped lawn behind. The fence replaced with
> dark grey horizontal slatted timber, a matching timber bin store against
> the house. Same flat grey overcast light as the reference. Shot on 35mm
> film, muted desaturated colour, soft realistic depth of field, no people,
> no text, no watermark, editorial architectural photography.

## closing-terrace

No reference image.

> A Cotswold honey stone cottage terrace at blue hour, wide shot, 4K
> resolution, 16:9 landscape. Warm golden light spilling from tall windows
> and a glazed door. A dry stone retaining wall running across the frame with
> recessed lights washing down it onto worn stone paving. Clipped box
> topiary in terracotta pots, wicker outdoor armchairs, a low table. Hostas,
> ferns and lavender planted along the front edge, slightly out of focus.
> Deep blue dusk sky above a tiled roofline. Shot on 35mm film, muted
> desaturated colour, soft realistic depth of field, no people, no text, no
> watermark, editorial architectural photography.

---

## What went wrong the first time

Three prompts in the original run carried instruction text into the scene
description, which the model tries to render:

- `1600x1600 (square)` at the head of the closing terrace prompt
- `plus the suffix with the winter light swap above` on winter
- `(same view as summer, reference image attached)` on spring

Keep the prompt to what the camera would see. Everything else belongs in the
UI or in your head.
