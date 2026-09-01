"""What each kind of visitor actually downloads."""
import os
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME_PATH")   # unset: use Playwright's own
BASE = os.environ.get("SITE_URL", "http://127.0.0.1:8413/")
from collections import defaultdict

VIEWS = [("desktop 2x (retina)", 1450, 900, 2), ("desktop 1x", 1450, 900, 1),
         ("phone 2x", 390, 844, 2)]

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME,                            args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
    for name, w, h, dpr in VIEWS:
        p = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=dpr)
        seen = {}
        def on_resp(r):
            try:
                seen[r.url] = int(r.headers.get("content-length") or 0)
            except Exception:
                pass
        p.on("response", on_resp)
        # Suppress the idle warm-up so this reports the critical path,
        # not what trickles in afterwards.
        p.add_init_script("window.requestIdleCallback = undefined;")
        p.goto(BASE, wait_until="load")
        p.evaluate("() => document.querySelector('.crafts').scrollIntoView({block:'center'})")
        p.wait_for_timeout(1200)
        p.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        p.wait_for_timeout(2500)
        buckets = defaultdict(int)
        for url, n in seen.items():
            if "/img/" in url: buckets["images"] += n
            elif "/video/" in url: buckets["video"] += n
            elif "/fonts/" in url or ".woff" in url: buckets["fonts"] += n
            else: buckets["html/css/js"] += n
        total = sum(buckets.values())
        print(f"\n--- {name} ---")
        for k in ("images", "video", "fonts", "html/css/js"):
            print(f"  {k:<14} {buckets[k]/1024/1024:6.2f} MB")
        print(f"  {'TOTAL':<14} {total/1024/1024:6.2f} MB")
        p.close()
    b.close()
