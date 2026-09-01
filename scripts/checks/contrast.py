"""Contrast measured from the pixels that actually reached the screen.

The earlier check modelled it: take the element's computed colour, composite it
over a screenshot of the backdrop, compare. That is wrong whenever something
paints on top of the text -- which is exactly what .craft::after was doing --
because the model never sees the veil.

This one shoots the element twice, once with the text visible and once with it
hidden, and finds the glyph pixels as the ones that changed. Their colour in
the visible shot is what the eye gets, whatever the stack did to it. The
backdrop is those same pixels in the hidden shot.

Only the strongest-changing pixels count, so antialiased edges do not drag the
number toward the middle.
"""
import io, sys
import os
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME_PATH")   # unset: use Playwright's own
BASE = os.environ.get("SITE_URL", "http://127.0.0.1:8413/")
from PIL import Image, ImageChops

def lin(c):
    c /= 255.0
    return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4

def lum(p):
    r, g, b = (lin(v) for v in p)
    return .2126*r + .7152*g + .0722*b

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + .05) / (lo + .05)

def settle(page):
    """Let reveal and expand transitions land before shooting.

    Pixel-diffing to a still frame cannot be used here: the hero video is
    always moving, so the page never goes quiet and the loop burns its full
    budget on every single call. Waiting on getAnimations() is no good either
    -- an infinite animation's finished promise never settles. A fixed pause
    longer than the slowest transition (0.7s on .rise) is what is left.
    """
    try:
        page.evaluate("async () => { await document.fonts.ready; }")
    except Exception:
        pass
    page.wait_for_timeout(1100)

def measure(page, sel, dpr, idx=0):
    els = page.query_selector_all(sel)
    if idx >= len(els) or not els[idx].is_visible():
        return None
    els[idx].scroll_into_view_if_needed()
    settle(page)
    box = els[idx].bounding_box()
    if not box or box["width"] < 1 or box["height"] < 1:
        return None
    vw = page.viewport_size["width"]; vh = page.viewport_size["height"]
    x0, y0 = max(0, box["x"]), max(0, box["y"])
    x1 = min(vw, box["x"] + box["width"]); y1 = min(vh, box["y"] + box["height"])
    if x1 - x0 < 1 or y1 - y0 < 1:
        return None
    clip = {"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0}
    shot_on = Image.open(io.BytesIO(page.screenshot(clip=clip))).convert("RGB")
    page.evaluate("([s, i]) => document.querySelectorAll(s)[i].style.visibility = 'hidden'", [sel, idx])
    shot_off = Image.open(io.BytesIO(page.screenshot(clip=clip))).convert("RGB")
    page.evaluate("([s, i]) => document.querySelectorAll(s)[i].style.visibility = ''", [sel, idx])

    on, off = list(shot_on.getdata()), list(shot_off.getdata())
    diff = [(abs(a[0]-b[0]) + abs(a[1]-b[1]) + abs(a[2]-b[2]), i)
            for i, (a, b) in enumerate(zip(on, off))]
    diff.sort(reverse=True)
    # glyph cores: the pixels the text changed most
    k = max(1, len(diff) // 40)
    core = [i for d, i in diff[:k] if d > 12]
    if not core:
        return ("no glyphs found", None, None)
    n = len(core)
    fg = tuple(sum(on[i][c] for i in core)/n for c in range(3))
    bg = tuple(sum(off[i][c] for i in core)/n for c in range(3))
    return (ratio(fg, bg), tuple(round(v) for v in fg), tuple(round(v) for v in bg))

TARGETS = [
    ("hero headline",  ".hero h1",           0, 3.0, None),
    ("hero body",      ".hero .lede",        0, 4.5, None),
    ("hero kicker",    ".hero__kicker",      0, 4.5, None),
    ("hero stat",      ".hero__stats dd",    0, 3.0, None),
    ("hero stat label", ".hero__stats dt",   0, 4.5, None),
    ("wordmark",       ".nav .mark",         0, 4.5, None),
    ("nav link",       ".nav__links a",      0, 4.5, None),
    ("menu button",    ".nav__toggle",       0, 4.5, None),
    ("craft heading",  ".craft__body h3",    2, 3.0, "craft"),
    ("craft body",     ".craft__body p",     2, 4.5, "craft"),
    ("craft label",    ".craft__label",      0, 4.5, "craft"),
    ("season name",    ".seasons__name",     0, 3.0, "seasons"),
    ("season kicker",  ".seasons__kicker",   0, 4.5, "seasons"),
    ("season note",    ".seasons__note",     0, 4.5, "seasons"),
    ("season tab",     ".seasons__pick button[aria-selected='true']", 0, 4.5, "seasons"),
    ("closing head",   ".closing__card h2",  0, 3.0, "closing"),
    ("closing body",   ".closing__card p",   0, 4.5, "closing"),
    ("closing eyebrow", ".closing__card .eyebrow", 0, 4.5, "closing"),
]

VIEWS = [("desktop", 1450, 800, 1), ("desktop 2x", 1440, 900, 2),
         ("laptop", 1280, 800, 2), ("tablet", 768, 1024, 2),
         ("phone", 390, 844, 2), ("phone sm", 320, 700, 2)]

fails = 0
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME,                            args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
    for vname, w, h, dpr in VIEWS:
        p = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
        p.goto(BASE, wait_until="load")
        p.wait_for_timeout(1500)
        print(f"\n--- {vname} ---")
        for label, sel, idx, need, where in TARGETS:
            if where == "craft":
                p.evaluate("() => document.querySelector('.crafts').scrollIntoView({block:'center'})")
                settle(p)
                if p.query_selector_all(".craft")[2].get_attribute("aria-expanded") != "true":
                    try:
                        p.click(".crafts .craft:nth-child(3)", timeout=3000)
                        settle(p)
                    except Exception:
                        pass
            elif where == "seasons":
                p.evaluate("() => document.getElementById('seasons').scrollIntoView()")
                settle(p)
            elif where == "closing":
                p.evaluate("() => document.getElementById('book').scrollIntoView()")
                settle(p)
            else:
                p.evaluate("() => window.scrollTo(0, 0)")
                settle(p)
            r = measure(p, sel, dpr, idx)
            if r is None:
                continue
            val, fg, bg = r
            if bg is None:
                print(f"  {label:<15} {val}")
                continue
            ok = "PASS" if val >= need else "FAIL"
            fails += ok == "FAIL"
            print(f"  {label:<15} {val:5.2f}:1  needs {need:<4} {ok}   text {fg} on {bg}")
        p.close()
    b.close()
print(f"\n{fails} failing" if fails else "\nall pass")
sys.exit(1 if fails else 0)
