/* Thorne & Willow.
   Every section reads and every link works with this file blocked. Nothing
   here listens to scroll: reveal, nav state and the stem draw all run on
   IntersectionObserver. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Reveal on arrival ------------------------------------------------ */
  var rising = document.querySelectorAll(".rise");
  if ("IntersectionObserver" in window && !reduced) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-in", "true");
        revealer.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    rising.forEach(function (el) { revealer.observe(el); });
  } else {
    rising.forEach(function (el) { el.setAttribute("data-in", "true"); });
  }

  /* ---- Nav: rule appears once the hero is behind you --------------------- */
  var nav = document.getElementById("nav");
  var top = document.getElementById("top");
  if (nav && top && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.setAttribute("data-stuck", entries[0].isIntersecting ? "false" : "true");
    }, { rootMargin: "-80px 0px 0px 0px" }).observe(top);
  }

  /* ---- Nav: current section --------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (targets.length && "IntersectionObserver" in window) {
    var marker = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          if (on) { a.setAttribute("aria-current", "true"); }
          else { a.removeAttribute("aria-current"); }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { marker.observe(t); });
  }

  /* ---- Nav: small-screen menu ------------------------------------------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      if (open) { links.setAttribute("data-open", "true"); }
      else { links.removeAttribute("data-open"); }
    };
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) setMenu(false);
    });
  }

  /* ---- Crafts: one panel open at a time ---------------------------------
     Hover opens on a pointer, click and keyboard open everywhere. Below
     900px the CSS turns this into a plain stack and the state is ignored. */
  var crafts = document.getElementById("crafts");
  if (crafts) {
    var panels = Array.prototype.slice.call(crafts.querySelectorAll(".craft"));
    var open = function (panel) {
      panels.forEach(function (p) {
        p.setAttribute("aria-expanded", String(p === panel));
      });
    };
    panels.forEach(function (p) {
      p.addEventListener("click", function () { open(p); });
      p.addEventListener("focus", function () { open(p); });
      if (window.matchMedia("(hover: hover) and (min-width: 901px)").matches) {
        p.addEventListener("mouseenter", function () { open(p); });
      }
    });
  }

  /* ---- Before and after -------------------------------------------------
     One CSS variable drives the clip and the handle. Pointer events cover
     mouse, pen and touch; arrow keys move it in 4% steps. */
  var ba = document.getElementById("ba");
  var handle = document.getElementById("baHandle");
  if (ba && handle) {
    var split = 53;
    var apply = function (pct) {
      split = Math.max(0, Math.min(100, pct));
      var v = split.toFixed(1);
      ba.style.setProperty("--split", v + "%");
      handle.setAttribute("aria-valuenow", Math.round(split));
      handle.setAttribute("aria-valuetext", Math.round(split) + "% finished garden shown");
    };

    var fromEvent = function (e) {
      var r = ba.getBoundingClientRect();
      apply(((e.clientX - r.left) / r.width) * 100);
    };

    var dragging = false;
    handle.addEventListener("pointerdown", function (e) {
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (dragging) fromEvent(e);
    });
    handle.addEventListener("pointerup", function (e) {
      dragging = false;
      handle.releasePointerCapture(e.pointerId);
    });
    handle.addEventListener("pointercancel", function () { dragging = false; });

    ba.addEventListener("pointerdown", function (e) {
      if (e.target !== handle) fromEvent(e);
    });

    handle.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 10 : 4;
      if (e.key === "ArrowLeft") { apply(split - step); e.preventDefault(); }
      else if (e.key === "ArrowRight") { apply(split + step); e.preventDefault(); }
      else if (e.key === "Home") { apply(0); e.preventDefault(); }
      else if (e.key === "End") { apply(100); e.preventDefault(); }
    });

    apply(split);
  }

  /* ---- Counting stats ----------------------------------------------------
     The reference runs its figures up as the section arrives -- 395, 399,
     400 -- rather than just printing them. Two details make it read as
     confidence rather than as a gimmick:

     it starts near the answer, not at zero, so the number never changes
     width and the row never reflows (tabular figures do the rest), and it
     eases out, so the last few digits settle rather than snapping.

     Reduced motion gets the final number immediately. The markup already
     holds it, so nothing here has to run for the page to be correct. */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && !reduced && "IntersectionObserver" in window) {
    var runCount = function (el) {
      var to = parseInt(el.getAttribute("data-count"), 10);
      if (!isFinite(to)) return;
      var from = Math.max(0, Math.floor(to * 0.94));
      if (from === to) return;
      var started = null, DUR = 1100;
      var step = function (now) {
        if (started === null) started = now;
        var t = Math.min(1, (now - started) / DUR);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
      };
      el.textContent = String(from);
      requestAnimationFrame(step);
    };

    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countObs.unobserve(en.target);
        runCount(en.target);
      });
    }, { threshold: 0.9 });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ---- Seasons ----------------------------------------------------------- */
  var pick = document.getElementById("seasonPick");
  var fig = document.getElementById("seasonFig");
  if (pick && fig) {
    var NOTES = {
      spring: "Bulbs through the borders and the first mow of the year. Everything is still low, so the shape of the garden shows.",
      summer: "Borders at full height, the lawn striped, and the terrace warm until nine. This is the month the drawings were aimed at.",
      autumn: "The copper season. Grasses, seed heads and the last long lunches outside before the clocks go back.",
      winter: "Frost picks out the clipped shapes and the bones of the layout. A garden designed only for July looks empty now."
    };
    var nameEl = document.getElementById("seasonName");
    var noteEl = document.getElementById("seasonNote");
    var shots = Array.prototype.slice.call(fig.querySelectorAll("img"));
    var tabs = Array.prototype.slice.call(pick.querySelectorAll("button"));

    /* Three of the four seasons are never on screen until a tab is clicked,
       so their markup ships with data-srcset and no src and nothing downloads
       for them. At the top rung that is 2.2MB kept off the initial load.

       Sources have to be filled before the img src or the browser can commit
       to the fallback jpg before it has seen the webp. */
    var hydrate = function (img) {
      if (!img || img.getAttribute("data-ready")) return;
      var pic = img.parentNode;
      Array.prototype.forEach.call(pic.querySelectorAll("source[data-srcset]"), function (src) {
        src.setAttribute("srcset", src.getAttribute("data-srcset"));
        src.removeAttribute("data-srcset");
      });
      var src = img.getAttribute("data-src");
      if (src) { img.setAttribute("src", src); img.removeAttribute("data-src"); }
      img.setAttribute("data-ready", "true");
    };

    var forSeason = function (season) {
      for (var i = 0; i < shots.length; i++) {
        if (shots[i].getAttribute("data-season") === season) return shots[i];
      }
      return null;
    };

    var show = function (season) {
      hydrate(forSeason(season));
      shots.forEach(function (img) {
        if (img.getAttribute("data-season") === season) { img.setAttribute("data-on", "true"); }
        else { img.removeAttribute("data-on"); }
      });
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", String(t.getAttribute("data-season") === season));
      });
      if (nameEl) nameEl.textContent = season;
      if (noteEl) noteEl.textContent = NOTES[season];
    };

    /* The section plays itself. It only runs while it is on screen -- a
       carousel ticking away in a scrolled-past section is wasted work and,
       for anyone using a screen reader, noise. Any deliberate interaction
       stops it for good: having the picture change under someone who has
       just chosen a season is worse than never moving at all. */
    var ORDER = ["spring", "summer", "autumn", "winter"];
    var timer = null, taken = false;

    var stop = function () {
      taken = true;
      if (timer) { clearInterval(timer); timer = null; }
    };
    var start = function () {
      if (taken || timer || reduced) return;
      timer = window.setInterval(function () {
        var i = ORDER.indexOf(pick.querySelector("[aria-selected='true']")
          .getAttribute("data-season"));
        show(ORDER[(i + 1) % ORDER.length]);
      }, 5200);
    };

    if (!reduced && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop2(); });
      }, { threshold: 0.5 }).observe(pick.closest("section"));
    }
    /* Leaving the section only pauses; only a person stops it. */
    function stop2() { if (timer) { clearInterval(timer); timer = null; } }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop2(); } else { start(); }
    });

    pick.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-season]");
      if (btn) { stop(); show(btn.getAttribute("data-season")); }
    });

    /* Once the page has gone quiet, pull the other three in the background so
       the first tab click does not sit on a blank. Skipped on save-data and on
       a slow connection, where the click-time fetch is the kinder default. */
    var conn = navigator.connection;
    var thrifty = conn && (conn.saveData ||
      /(^|-)2g$/.test(conn.effectiveType || ""));
    if (!thrifty) {
      var warm = function () { shots.forEach(hydrate); };
      if (window.requestIdleCallback) { requestIdleCallback(warm, { timeout: 6000 }); }
      else { window.setTimeout(warm, 2500); }
    }

    pick.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
      if (next < 0) return;
      e.preventDefault();
      stop();
      var t = tabs[(next + tabs.length) % tabs.length];
      t.focus();
      show(t.getAttribute("data-season"));
    });
  }

  /* ---- Process stem ------------------------------------------------------
     The dash length has to be measured, not guessed, or the line either
     snaps in early or never finishes. */
  var process = document.querySelector(".process");
  var line = document.querySelector(".stem-line");
  if (process && line) {
    if (typeof line.getTotalLength === "function") {
      var len = line.getTotalLength();
      line.style.setProperty("--len", len);
    }
    if ("IntersectionObserver" in window && !reduced) {
      var drawer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          process.setAttribute("data-drawn", "true");
          drawer.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0.1 });
      drawer.observe(process);
    } else {
      process.setAttribute("data-drawn", "true");
    }
  }
})();
