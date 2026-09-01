"""Overflow, image resolution and interaction smoke test."""
import os
from playwright.sync_api import sync_playwright

CHROME = os.environ.get("CHROME_PATH")   # unset: use Playwright's own
BASE = os.environ.get("SITE_URL", "http://127.0.0.1:8413/")
import re, os

ROOT = "/home/user/thorne-and-willow/"
URL = BASE
WIDTHS = [(1440,900,1),(1440,900,2),(1280,800,2),(1024,768,2),(768,1024,2),(390,844,2),(320,700,2)]

def real_width(url):
    """On-disk pixel width, since naturalWidth is density-corrected."""
    name = url.split("/")[-1].split("?")[0]
    m = re.search(r"-(\d+)\.(jpg|webp)$", name)
    return int(m.group(1)) if m else None

fails = []
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME,                            args=["--no-sandbox","--autoplay-policy=no-user-gesture-required"])
    for w,h,dpr in WIDTHS:
        p = b.new_page(viewport={"width":w,"height":h}, device_scale_factor=dpr)
        p.goto(URL, wait_until="load")
        p.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        p.wait_for_timeout(1500)
        p.evaluate("() => window.scrollTo(0, 0)"); p.wait_for_timeout(400)

        sw = p.evaluate("() => document.documentElement.scrollWidth")
        if sw > w + 1:
            fails.append(f"{w}px: horizontal overflow, scrollWidth {sw}")

        imgs = p.evaluate("""() => [...document.images].map(i => ({
            src: i.currentSrc, css: i.getBoundingClientRect().width, alt: i.alt }))""")
        for i in imgs:
            if i["css"] < 1: continue
            rw = real_width(i["src"])
            if rw is None: continue
            need = i["css"] * dpr
            if rw < need - 1:
                fails.append(f"{w}px@{dpr}x: {i['src'].split('/')[-1]} is {rw}px, needs {need:.0f}px")
        p.close()

    # interactions
    p = b.new_page(viewport={"width":1440,"height":900}, device_scale_factor=1)
    p.goto(URL, wait_until="load"); p.wait_for_timeout(2000)
    v = p.evaluate("""() => { const v=document.getElementById('heroVideo');
        return {ready:v.readyState, playing:!v.paused, muted:v.muted, loop:v.loop}; }""")
    if v["ready"] < 3 or not v["playing"] or not v["muted"] or not v["loop"]:
        fails.append(f"hero video state {v}")

    p.evaluate("() => document.getElementById('gardens').scrollIntoView()"); p.wait_for_timeout(900)
    before = p.evaluate("() => document.querySelectorAll('.craft')[1].getBoundingClientRect().width")
    p.click(".crafts .craft:nth-child(2)"); p.wait_for_timeout(900)
    after = p.evaluate("() => document.querySelectorAll('.craft')[1].getBoundingClientRect().width")
    if after < before * 3:
        fails.append(f"craft panel did not expand: {before:.0f} -> {after:.0f}")

    tabs = p.query_selector_all(".seasons__tabs button, [role='tab']")
    if tabs:
        tabs[-1].click(); p.wait_for_timeout(700)
        sel = p.evaluate("() => [...document.querySelectorAll('[role=\\'tab\\']')]"
                         ".filter(t => t.getAttribute('aria-selected') === 'true').length")
        if sel != 1:
            fails.append(f"season tabs: {sel} selected after click")
    p.close()
    b.close()

print("\n".join("FAIL " + f for f in fails) if fails else "smoke: all clear")
