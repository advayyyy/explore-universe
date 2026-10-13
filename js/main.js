/* ============================================================
   Explore Universe — shared page behaviour
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Starfield boot ---------- */
  function bootStarfield() {
    var c = document.querySelector(".bg-canvas");
    if (c && window.Starfield) {
      window.__starfield = new Starfield(c, {
        density: 0.00016,
        maxStars: 560,
        speed: 1,
        shooting: true,
        parallax: true
      });
    }
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          links.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    function onScroll() {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // highlight the current page in the nav
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "index.html" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ============================================================
     Scroll-driven pass: reveal + counters.

     Both use a position check rather than IntersectionObserver.
     An element counts as "reached" once it is on screen OR has
     already passed above the viewport. This stays correct on fast
     scrolls, anchor jumps and Ctrl+End, where an observer can miss
     an element that skipped from "below" to "above" in one frame.
     ============================================================ */
  var revealEls = [];
  var counterEls = [];

  function collect() {
    revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal:not(.in)"));
    counterEls = Array.prototype.slice.call(document.querySelectorAll("[data-count]:not([data-done])"));
  }

  function reached(el, vh, ratio) {
    var r = el.getBoundingClientRect();
    return r.bottom <= 0 || (r.top < vh * ratio && r.bottom > 0);
  }

  function animateCounter(el) {
    el.setAttribute("data-done", "1");
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dur = 1600, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      var str = target >= 100 ? Math.round(val).toLocaleString("en-IN")
                              : (Math.round(val * 10) / 10).toString();
      el.textContent = prefix + str + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollPass() {
    var vh = window.innerHeight || 800;

    if (revealEls.length) {
      var remaining = [];
      for (var i = 0; i < revealEls.length; i++) {
        if (reached(revealEls[i], vh, 0.9)) revealEls[i].classList.add("in");
        else remaining.push(revealEls[i]);
      }
      revealEls = remaining;
    }

    if (counterEls.length) {
      var pending = [];
      for (var j = 0; j < counterEls.length; j++) {
        if (reached(counterEls[j], vh, 0.92)) animateCounter(counterEls[j]);
        else pending.push(counterEls[j]);
      }
      counterEls = pending;
    }
  }

  function initScrollEffects() {
    collect();
    scrollPass();
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { scrollPass(); ticking = false; });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // exposed so scripts that inject .reveal / [data-count] later can re-scan
    window.EUReveal = function () { collect(); scrollPass(); };
  }

  /* ---------- Card cursor glow ---------- */
  function initCardGlow() {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
      });
    });
  }

  /* ---------- Year ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    bootStarfield();
    initNav();
    initScrollEffects();
    initCardGlow();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
