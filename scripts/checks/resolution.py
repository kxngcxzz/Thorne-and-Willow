"""Effective resolution of every image, accounting for object-fit.

Two traps this avoids:

1. naturalWidth is DENSITY-CORRECTED. On a 2x screen Chromium reports an
   1800px srcset-selected file as 900. The real size has to come from disk.
2. Comparing source width against box width is not enough. Under
   object-fit: cover the HEIGHT often drives the scale, and then the file
   needs more width than the box does.

'headroom' below 1.0 means the browser is enlarging the file.
"""
import os
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME_PATH")   # unset: use Playwright's own
BASE = os.environ.get("SITE_URL", "http://127.0.0.1:8413/")
from PIL import Image
import glob, os

DISK = {os.path.basename(f): Image.open(f).size
        for f in glob.glob("assets/img/*.jpg") + glob.glob("assets/img/*.webp")}

VIEWS = [("desktop 1x", 1450, 800, 1), ("desktop 2x", 1450, 800, 2),
         ("wide 2x", 1920, 1080, 2), ("laptop 2x", 1280, 800, 2), ("tablet 2x", 768, 1024, 2), ("tablet 1x", 768, 1024, 1),
         ("phone 2x", 390, 844, 2)]

JS = """() => [...document.images].filter(i => i.getBoundingClientRect().width > 1).map(i => {
    const r = i.getBoundingClientRect();
    return {src: i.currentSrc.split('/').pop(), fit: getComputedStyle(i).objectFit,
            bw: r.width, bh: r.height};
})"""

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME,                            args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
    for name, w, h, dpr in VIEWS:
        p = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
        p.goto(BASE, wait_until="load")
        p.evaluate("() => document.querySelector('.crafts').scrollIntoView({block:'center'})")
        p.wait_for_timeout(900)
        try:
            p.click(".crafts .craft:nth-child(3)", timeout=2500); p.wait_for_timeout(1200)
        except Exception:
            pass
        p.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        p.wait_for_timeout(1600)
        rows = p.evaluate(JS)
        print(f"\n=== {name} ({w}x{h} @{dpr}x) ===")
        print(f"  {'file':<30} {'box(css)':>11} {'file on disk':>12} {'needs(dev)':>12} {'headroom':>9}")
        for r in rows:
            sw, sh = DISK.get(r["src"], (0, 0))
            if not sw:
                continue
            need_w, need_h = r["bw"] * dpr, r["bh"] * dpr
            if r["fit"] == "cover":
                scale = max(need_w / sw, need_h / sh)
                req_w, req_h = sw * scale, sh * scale
            else:
                req_w, req_h = need_w, need_h
            head = min(sw / req_w, sh / req_h)
            flag = "  <-- ENLARGED" if head < 0.995 else ("  <- no margin" if head < 1.08 else "")
            print(f"  {r['src']:<30} {r['bw']:5.0f}x{r['bh']:<5.0f} {sw:5d}x{sh:<6d} "
                  f"{req_w:6.0f}x{req_h:<5.0f} {head:8.2f}x{flag}")
        p.close()
    b.close()
