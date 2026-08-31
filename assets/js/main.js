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

    var show = function (season) {
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

    pick.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-season]");
      if (btn) show(btn.getAttribute("data-season"));
    });

    pick.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
      if (next < 0) return;
      e.preventDefault();
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
