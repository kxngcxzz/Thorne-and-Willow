"""Prove the deferral: nothing for the hidden seasons on load, the right file
on a tab click, and the page still readable with JS off."""
import os
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME_PATH")   # unset: use Playwright's own
BASE = os.environ.get("SITE_URL", "http://127.0.0.1:8413/")

def season_reqs(urls):
    return sorted({u.split("/")[-1] for u in urls if "season-" in u})

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME,                            args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])

    # 1. Initial load, idle warm-up blocked so we see the true critical path.
    p = b.new_page(viewport={"width":1450,"height":900}, device_scale_factor=2)
    reqs = []
    p.on("request", lambda r: reqs.append(r.url))
    p.add_init_script("window.requestIdleCallback = undefined; window.setTimeout = "
                      "(function(o){return function(f,t){ if(t===2500) return 0; "
                      "return o(f,t); };})(window.setTimeout);")
    p.goto(BASE, wait_until="load")
    p.evaluate("() => document.getElementById('seasons').scrollIntoView({block:'center'})")
    p.wait_for_timeout(2500)
    print("on load (warm-up suppressed):", season_reqs(reqs))

    # 2. Click autumn -- it should arrive now.
    before = len(reqs)
    p.click("[role='tab'][data-season='autumn']")
    p.wait_for_timeout(2500)
    print("after clicking autumn :", season_reqs(reqs[before:]))
    shown = p.evaluate("""() => [...document.querySelectorAll('#seasonFig img')]
        .filter(i => i.hasAttribute('data-on')).map(i => i.dataset.season)""")
    ok = p.evaluate("""() => { const i = [...document.querySelectorAll('#seasonFig img')]
        .find(x => x.dataset.season === 'autumn'); return {complete: i.complete, w: i.naturalWidth}; }""")
    print("  visible:", shown, " autumn decoded:", ok)
    p.close()

    # 3. Normal load, idle warm-up allowed.
    p = b.new_page(viewport={"width":1450,"height":900}, device_scale_factor=2)
    reqs2 = []
    p.on("request", lambda r: reqs2.append(r.url))
    p.goto(BASE, wait_until="load")
    p.evaluate("() => document.getElementById('seasons').scrollIntoView({block:'center'})")
    p.wait_for_timeout(9000)
    print("\nwith idle warm-up      :", season_reqs(reqs2))
    p.close()

    # 4. JS off -- summer must still render.
    ctx = b.new_context(viewport={"width":1450,"height":900}, java_script_enabled=False)
    p = ctx.new_page()
    reqs3 = []
    p.on("request", lambda r: reqs3.append(r.url))
    p.goto(BASE, wait_until="load")
    p.wait_for_timeout(2500)
    got = p.evaluate_handle if False else None
    print("\njs off, seasons fetched:", season_reqs(reqs3))
    ctx.close()
    b.close()
