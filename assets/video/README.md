# Hero video

Four encodes of the same eight seconds, plus a poster.

| File | Size | Codec |
|---|---|---|
| `hero-1440.webm` | 2.3 MB | VP9, 1440x810 |
| `hero-1440.mp4` | 3.0 MB | H.264 High L4.0, 1440x810 |
| `hero-960.webm` | 0.9 MB | VP9, 960x540 |
| `hero-960.mp4` | 1.1 MB | H.264 High L3.1, 960x540 |
| `hero-poster.jpg` | 0.2 MB | a frame of the video itself |

All four are 7.958s at 24fps with no audio track, and the moov atom is at the
front so playback starts before the file finishes arriving.

## The loop is built into the file

The clip is four seconds of footage followed by the same four seconds
reversed. That makes the last frame one frame's worth of motion from the
first, so the browser's own `loop` attribute is seamless and no JavaScript has
to watch the clock. Measured, the wrap point is about three and a half times
closer than any other pair of frames the same distance apart.

Anything regenerated here has to keep that property or the loop will visibly
jump.

## Why two widths and two formats

`main.js` picks 960 under 700px and 1440 above, and lists the webm first so
browsers that can take it do. The mp4 is there for Safari and iOS, which do
not read VP9 in a `<video>` element. Note that a plain Chromium build carries
neither an H.264 decoder nor a VP9 *decoder* in its bundled ffmpeg, so if you
go to verify these locally, a "no supported streams" error is usually the tool
and not the file.

## What does not download it

`preload="none"` and no `autoplay` attribute, so the element asks for nothing
on its own. `main.js` attaches the sources only when the visitor has neither
`prefers-reduced-motion` nor Save-Data set. Everyone else gets the poster and
the page costs them 200KB instead of 3MB.
