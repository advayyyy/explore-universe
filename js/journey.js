/* ============================================================
   Explore Universe — THE FLIGHT
   A scroll-driven journey from Earth's orbit to the edge of the
   observable universe. Pure Canvas 2D. No libraries.

   How it works
   ------------
   * Scroll position maps to a camera depth (camZ) along a
     14,000-unit track; the camera eases toward it, so motion
     feels like a ship settling onto a heading.
   * Stars live in a wrapping 3D field and streak radially,
     giving the hyperspace effect when you scroll fast.
   * Each waypoint has an "encounter" progress (enc) — the moment
     it passes the camera. Its depth is derived from enc, so the
     whole scene stays in sync with the narrative, and its opacity
     is driven by progress (fade in before, fade out after).
   * Nebulae, galaxies, black holes and the cosmic web are
     pre-rendered once into offscreen sprites, then drawn scaled.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("space");
  if (!canvas) return;
  var ctx = canvas.getContext("2d", { alpha: false });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia && window.matchMedia("(max-width: 760px)").matches;

  var TAU = Math.PI * 2;
  var TOTAL = 14000;
  var FOCAL = 900;
  var ZMAX = 2200;
  var NEAR = 46;

  var W = 0, H = 0, DPR = 1, cx = 0, cy = 0, SFOC = 900, vx = 0, vy = 0;
  var camZ = 0, prevCamZ = 0, camVel = 0, targetZ = 0;
  var progress = 0, started = false, alive = true;
  var throttle = 0, clock = 0;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var stars = [], objects = [], sprites = {};
  var spacerTop = 0, spacerH = 0;

  /* ---------------- helpers ---------------- */
  function rgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mixc(h, t, a) {
    var c = rgb(h);
    return "rgb(" + c.map(function (v, i) { return Math.round(v + (t[i] - v) * a); }).join(",") + ")";
  }
  function lighten(h, a) { return mixc(h, [255, 255, 255], a); }
  function darken(h, a) { return mixc(h, [3, 4, 14], a); }
  function rgba(h, a) { var c = rgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------------- stage script ---------------- */
  var STAGES = [
    { at: 0.000, where: "Low Earth Orbit", dist: "400 km", title: "Leaving Earth",
      body: "Gravity lets go. Below you, the only world anyone has ever called home shrinks to a blue marble \u2014 and then to a star." },
    { at: 0.085, where: "Cislunar Space", dist: "384,400 km", title: "Past the Moon",
      body: "The Moon drifts by in silence, grey and enormous. It is the farthest any human has ever travelled. You keep going." },
    { at: 0.185, where: "The Asteroid Belt", dist: "2.7 AU", title: "A Million Tumbling Rocks",
      body: "Rubble left over from the birth of the planets, scattered across a gap as wide as the distance from the Sun to Jupiter." },
    { at: 0.290, where: "Outer Solar System", dist: "9.5 AU", title: "The Gas Giants",
      body: "Jupiter's storms churn below, wider than worlds. Then Saturn, its rings catching the sunlight like a blade." },
    { at: 0.395, where: "The Kuiper Belt", dist: "48 AU", title: "Leaving the Solar System",
      body: "The Sun is just the brightest star now. Ahead of you there is nothing at all \u2014 except everything." },
    { at: 0.500, where: "Orion Nebula", dist: "1,344 light-years", title: "A Stellar Nursery",
      body: "You pass into a glowing cloud thousands of light-years wide, where gravity is pulling new suns out of the dark." },
    { at: 0.605, where: "Red Supergiant", dist: "\u2248 600 light-years", title: "A Dying Giant",
      body: "A star hundreds of times the size of the Sun, swollen and unstable, close to the end of its life. Its light bends around your ship." },
    { at: 0.710, where: "Sagittarius A*", dist: "26,000 light-years", title: "Do Not Get Too Close",
      body: "Something with the mass of four million Suns is pulling at you. The light itself is being dragged around the edge. Hold your course." },
    { at: 0.825, where: "The Galactic Plane", dist: "100,000 light-years", title: "The Milky Way",
      body: "You pull back and see it whole: a slow-turning spiral of a hundred billion stars \u2014 and somewhere inside it, home." },
    { at: 0.930, where: "Observable Universe", dist: "93 billion light-years", title: "The Edge of Everything",
      body: "Galaxies gather into filaments, threads of light strung across the dark. This is as far as sight reaches. Beyond it, we simply cannot see." }
  ];

  /* ---------------- sprite factories ---------------- */
  function newCanvas(s) {
    var c = document.createElement("canvas");
    c.width = c.height = s;
    return c;
  }

  function makeGalaxy(s) {
    var c = newCanvas(s), g = c.getContext("2d");
    var m = s / 2, R = s * 0.42;
    g.globalCompositeOperation = "lighter";
    g.translate(m, m);
    var core = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.42);
    core.addColorStop(0, "rgba(255,251,238,0.98)");
    core.addColorStop(0.22, "rgba(255,222,160,0.62)");
    core.addColorStop(0.55, "rgba(190,140,255,0.22)");
    core.addColorStop(1, "rgba(120,90,255,0)");
    g.fillStyle = core;
    g.beginPath(); g.arc(0, 0, R * 0.42, 0, TAU); g.fill();

    var N = small ? 1600 : 3400;
    for (var i = 0; i < N; i++) {
      var t = Math.pow(Math.random(), 0.62);
      var arm = i % 2;
      var theta = t * 5.4 + arm * Math.PI + (Math.random() - 0.5) * (0.55 + t * 0.9);
      var jitter = (Math.random() - 0.5) * (0.07 + 0.30 * t);
      var x = (Math.cos(theta) * t + jitter) * R;
      var y = (Math.sin(theta) * t + jitter) * R;
      var col = t < 0.22 ? "rgba(255,244,216," : t < 0.58 ? "rgba(206,196,255," : "rgba(150,186,255,";
      var a = (0.42 - t * 0.26) * (0.45 + Math.random() * 0.55);
      var rr = Math.max(0.5, (1.7 - t * 1.15) * (s / 512) * (0.55 + Math.random() * 0.9));
      g.fillStyle = col + a.toFixed(3) + ")";
      g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill();
    }
    return c;
  }

  /* a single wispy thread of glowing gas, pre-rendered once and reused */
  function makeWisp(s, col) {
    var c = newCanvas(s), g = c.getContext("2d");
    g.globalCompositeOperation = "lighter";
    // the thread and its blobs are kept well inside the canvas so the
    // sprite never clips against its own square edge
    var n = 18, pts = [];
    var dir = rand(-0.5, 0.5);
    var x = s * 0.25, y = s * (0.42 + Math.random() * 0.16);
    for (var i = 0; i < n; i++) {
      pts.push({ x: x, y: y });
      x += (s * 0.50) / (n - 1);
      y += dir * (s * 0.045) + (Math.random() - 0.5) * s * 0.03;
      dir += (Math.random() - 0.5) * 0.3;
    }
    for (var j = 0; j < n; j++) {
      var t = j / (n - 1);
      var taper = Math.sin(Math.PI * t);
      var rr = s * (0.035 + 0.085 * taper) * (0.7 + Math.random() * 0.6);
      var grd = g.createRadialGradient(pts[j].x, pts[j].y, 0, pts[j].x, pts[j].y, rr);
      grd.addColorStop(0, rgba(col, 0.30));
      grd.addColorStop(0.45, rgba(col, 0.10));
      grd.addColorStop(1, rgba(col, 0));
      g.fillStyle = grd;
      g.beginPath(); g.arc(pts[j].x, pts[j].y, rr, 0, TAU); g.fill();
    }
    return c;
  }

  function makeWeb(s) {
    var c = newCanvas(s), g = c.getContext("2d");
    g.globalCompositeOperation = "lighter";
    var m = s / 2, R = s * 0.44, n = small ? 48 : 80;
    var nodes = [];
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * TAU;
      var rad = Math.pow(Math.random(), 0.55) * R;
      nodes.push({ x: m + Math.cos(ang) * rad, y: m + Math.sin(ang) * rad * 0.85 });
    }
    for (var a = 0; a < nodes.length; a++) {
      var d2 = [];
      for (var b = 0; b < nodes.length; b++) {
        if (a === b) continue;
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        d2.push({ i: b, d: dx * dx + dy * dy });
      }
      d2.sort(function (p, q) { return p.d - q.d; });
      for (var k = 0; k < 2; k++) {
        var t2 = nodes[d2[k].i];
        var lg = g.createLinearGradient(nodes[a].x, nodes[a].y, t2.x, t2.y);
        lg.addColorStop(0, "rgba(140,190,255,0.30)");
        lg.addColorStop(1, "rgba(190,140,255,0.18)");
        g.strokeStyle = lg;
        g.lineWidth = s / 900 * 1.4;
        g.beginPath(); g.moveTo(nodes[a].x, nodes[a].y); g.lineTo(t2.x, t2.y); g.stroke();
      }
    }
    for (var q = 0; q < nodes.length; q++) {
      var rr = s * (0.012 + Math.random() * 0.028);
      var grd = g.createRadialGradient(nodes[q].x, nodes[q].y, 0, nodes[q].x, nodes[q].y, rr);
      grd.addColorStop(0, "rgba(255,240,210,0.9)");
      grd.addColorStop(0.4, "rgba(255,200,140,0.35)");
      grd.addColorStop(1, "rgba(150,120,255,0)");
      g.fillStyle = grd;
      g.beginPath(); g.arc(nodes[q].x, nodes[q].y, rr, 0, TAU); g.fill();
    }
    return c;
  }

  function makeBlackHole(s) {
    var c = newCanvas(s), g = c.getContext("2d");
    /* R and the disk radii are kept inside the canvas half-width so the
       sprite never clips against its own square edge */
    var m = s / 2, R = s * 0.145;
    g.globalCompositeOperation = "lighter";
    g.save();
    g.translate(m, m);
    g.rotate(-0.34);
    g.scale(1, 0.30);
    for (var i = 0; i < 96; i++) {
      var t = i / 96;
      var rr = R * (1.35 + t * 1.75);
      var col = t < 0.45 ? "255,206,130" : "170,120,255";
      var a = 0.55 * (1 - t) * (0.45 + Math.random() * 0.55);
      g.strokeStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
      g.lineWidth = R * 0.11 * (1 - t * 0.55);
      g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke();
    }
    g.restore();
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#000";
    g.beginPath(); g.arc(m, m, R, 0, TAU); g.fill();
    g.globalCompositeOperation = "lighter";
    g.strokeStyle = "rgba(255,226,170,0.85)";
    g.lineWidth = Math.max(1.4, R * 0.055);
    g.beginPath(); g.arc(m, m, R * 1.05, 0, TAU); g.stroke();
    var og = g.createRadialGradient(m, m, R * 0.95, m, m, s * 0.5);
    og.addColorStop(0, "rgba(255,170,80,0.30)");
    og.addColorStop(0.5, "rgba(150,90,255,0.11)");
    og.addColorStop(1, "rgba(80,60,220,0)");
    g.fillStyle = og;
    g.beginPath(); g.arc(m, m, s * 0.5, 0, TAU); g.fill();
    return c;
  }

  /* ---------------- the waypoints ----------------
     enc  = progress at which the object passes the camera
     fin  = how far before that it starts fading in
     fout = how long after it passes it takes to fade out      */
  var SPEC = [
    { t: "planet", enc: 0.050, fin: 0.11, fout: 0.03, ox: -128, oy: 44, r: 132, col: "#3b82f6", glow: "#22d3ee", label: "Earth" },
    { t: "planet", enc: 0.135, fin: 0.065, fout: 0.025, ox: 168, oy: -66, r: 44, col: "#b7b0a6", glow: "#8f8a80", label: "The Moon" },
    { t: "planet", enc: 0.205, fin: 0.075, fout: 0.025, ox: -212, oy: 84, r: 66, col: "#e05a3c", glow: "#ff7a45", label: "Mars" },
    { t: "asteroids", enc: 0.275, fin: 0.10, fout: 0.035 },
    { t: "planet", enc: 0.320, fin: 0.075, fout: 0.025, ox: 150, oy: -96, r: 172, col: "#d9a878", glow: "#c98a4a", label: "Jupiter" },
    { t: "planet", enc: 0.385, fin: 0.075, fout: 0.025, ox: -196, oy: 70, r: 142, col: "#e6d3a3", glow: "#d9b45f", ring: true, label: "Saturn" },
    { t: "cloud", enc: 0.525, fin: 0.115, fout: 0.055 },
    { t: "star", enc: 0.645, fin: 0.090, fout: 0.030, ox: 70, oy: -50, r: 214, col: "#ff6b5a", glow: "#ff9d5a" },
    { t: "sprite", kind: "blackhole", enc: 0.735, fin: 0.090, fout: 0.055, zFix: 13500, r: 4400, ox: 0, oy: 0 },
    { t: "sprite", kind: "galaxy", enc: 0.865, fin: 0.065, fout: 0.06, zFix: 19000, r: 9000, ox: 0, oy: 0, spin: 0.1 },
    { t: "sprite", kind: "web", enc: 0.965, fin: 0.055, fout: 0.055, zFix: 24000, r: 13000, ox: 0, oy: 0 }
  ];

  function buildObjects() {
    var objs = [];
    SPEC.forEach(function (s) {
      var o = {};
      for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) o[k] = s[k];
      o.z = (s.zFix != null) ? s.zFix : s.enc * TOTAL + 50;
      if (o.t === "cloud") {
        o.parts = [];
        var pal = ["#ff5ea8", "#7c2ff0", "#22d3ee", "#fbbf24", "#34d399", "#a78bfa"];
        var nSoft = small ? 8 : 11, nFil = small ? 12 : 18, nKnot = small ? 12 : 20, nStar = small ? 110 : 180;
        for (var si = 0; si < nSoft; si++) {
          var sa = Math.random() * TAU, sr = rand(220, 880);
          o.parts.push({ kind: "soft", x: Math.cos(sa) * sr, y: Math.sin(sa) * sr * 0.8,
            z: rand(-1200, 1200), r: rand(170, 360), col: pal[(Math.random() * pal.length) | 0] });
        }
        // filaments: pre-rendered wispy threads of glowing gas — this is
        // what reads as "nebula" rather than as out-of-focus bokeh
        for (var fi = 0; fi < nFil; fi++) {
          var fang = Math.random() * TAU, frad = rand(120, 800);
          o.parts.push({
            kind: "filament",
            x: Math.cos(fang) * frad, y: Math.sin(fang) * frad * 0.8,
            z: rand(-1200, 1200), size: rand(620, 1700), rot: rand(0, TAU),
            sprite: sprites.wisps[(Math.random() * sprites.wisps.length) | 0]
          });
        }
        for (var ki = 0; ki < nKnot; ki++) {
          var ka = Math.random() * TAU, kr = rand(130, 760);
          o.parts.push({ kind: "knot", x: Math.cos(ka) * kr, y: Math.sin(ka) * kr * 0.8,
            z: rand(-1200, 1200), r: rand(35, 115), col: pal[(Math.random() * pal.length) | 0] });
        }
        for (var ti = 0; ti < nStar; ti++) {
          var ta = Math.random() * TAU, tr = rand(80, 940);
          o.parts.push({ kind: "star", x: Math.cos(ta) * tr, y: Math.sin(ta) * tr * 0.8,
            z: rand(-1200, 1200), r: rand(1.3, 4.5), col: "#ffffff" });
        }
      }
      if (o.t === "asteroids") {
        o.rocks = [];
        var n = small ? 80 : 140;
        for (var i = 0; i < n; i++) {
          var a = Math.random() * TAU, rad = rand(50, 760);
          o.rocks.push({
            x: Math.cos(a) * rad, y: Math.sin(a) * rad * 0.78, z: rand(-460, 460),
            r: rand(3, 15),
            c: "rgb(" + (110 + (Math.random() * 60 | 0)) + "," + (100 + (Math.random() * 50 | 0)) + "," + (92 + (Math.random() * 40 | 0)) + ")",
            s: [0.3, 0.8, 0.5, 1, 0.4, 0.9]
          });
        }
      }
      if (o.kind === "galaxy") o.sprite = sprites.galaxy;
      if (o.kind === "web") o.sprite = sprites.web;
      if (o.kind === "blackhole") o.sprite = sprites.blackhole;
      objs.push(o);
    });
    return objs;
  }

  /* progress-driven opacity: full through the encounter */
  function alphaP(p, o) {
    var in0 = o.enc - o.fin, in1 = o.enc - o.fin * 0.45;
    var out0 = o.enc, out1 = o.enc + o.fout;
    if (p <= in0 || p >= out1) return 0;
    if (p < in1) return (p - in0) / Math.max(0.0001, in1 - in0);
    if (p <= out0) return 1;
    return 1 - (p - out0) / Math.max(0.0001, out1 - out0);
  }

  /* ---------------- stars ---------------- */
  function newStar(z) {
    return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: z, big: Math.random() > 0.965 };
  }
  function buildStars() {
    stars = [];
    var n = small ? 460 : 780;
    for (var i = 0; i < n; i++) stars.push(newStar(Math.random() * ZMAX));
  }

  /* ---------------- sizing / scroll ---------------- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
    SFOC = Math.max(W, H) * 0.55;
    var sp = document.getElementById("journeySpacer");
    if (sp) { spacerTop = sp.offsetTop; spacerH = sp.offsetHeight; }
    readScroll();
  }

  function readScroll() {
    var span = Math.max(1, spacerH - window.innerHeight);
    progress = clamp((window.scrollY - spacerTop) / span, 0, 1);
    targetZ = progress * TOTAL;
    updateHud(); updateRail(); updateStages();
    var cue = document.getElementById("scrollCue");
    if (cue) cue.classList.toggle("hide", window.scrollY > 60);
    // once the ending panel scrolls in, retire the flight HUD + captions
    var past = window.scrollY > spacerTop + spacerH - window.innerHeight * 0.62;
    document.body.classList.toggle("arrived", past);
  }

  /* ---------------- HUD / rail / captions ---------------- */
  var elSpeed, elDist, elLoc, rail, stageEls = [];

  function updateHud() {
    if (elSpeed) {
      var v = Math.min(0.99, 0.08 + 0.91 * (1 - Math.exp(-Math.abs(camVel) / 40)));
      elSpeed.textContent = v.toFixed(2) + " c";
      elSpeed.classList.toggle("warp", v > 0.85);
    }
    var cur = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (progress >= STAGES[i].at - 0.001) cur = STAGES[i];
    if (elDist) elDist.textContent = cur.dist;
    if (elLoc) elLoc.textContent = cur.where;
  }

  function activeIndex() {
    var a = 0;
    for (var i = 0; i < STAGES.length; i++) if (progress >= STAGES[i].at - 0.001) a = i;
    return a;
  }

  function updateRail() {
    if (!rail) return;
    var active = activeIndex(), btns = rail.children;
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle("active", j === active);
      btns[j].classList.toggle("done", j < active);
    }
  }

  function buildStages() {
    var host = document.getElementById("stageLayers");
    if (!host) return;
    stageEls = STAGES.map(function (s) {
      var d = document.createElement("div");
      d.className = "stage-layer";
      d.innerHTML = '<div class="panel"><span class="where">' + s.where + '</span><h2>' + s.title + '</h2><p>' + s.body + '</p></div>';
      host.appendChild(d);
      return d;
    });
  }

  function updateStages() {
    for (var i = 0; i < STAGES.length; i++) {
      var s = STAGES[i];
      var next = STAGES[i + 1] ? STAGES[i + 1].at : 1.05;
      var span = Math.max(0.06, next - s.at);
      var t = (progress - s.at) / span;
      // no negative overlap: each caption fades out fully at t=1 and the
      // next fades in from t=0, so two captions are never on screen at once
      var a = 0;
      if (t >= 0 && t <= 1) {
        if (t < 0.15) a = t / 0.15;
        else if (t > 0.85) a = (1 - t) / 0.15;
        else a = 1;
      }
      a = clamp(a, 0, 1);
      var el = stageEls[i];
      el.style.opacity = a.toFixed(3);
      el.style.transform = "translateY(" + (16 * (1 - a)).toFixed(1) + "px)";
    }
  }

  /* ---------------- launch ---------------- */
  function initLaunch() {
    var launch = document.getElementById("launch");
    var btn = document.getElementById("startBtn");
    document.body.classList.add("locked");
    function go() {
      if (started) return;
      started = true;
      document.body.classList.remove("locked");
      if (launch) launch.classList.add("gone");
      camVel = 95; throttle = 3.6;
      window.scrollTo({ top: spacerTop + 8, behavior: reduce ? "auto" : "smooth" });
    }
    if (btn) btn.addEventListener("click", go);
    window.addEventListener("wheel", go, { passive: true, once: true });
    window.addEventListener("touchstart", go, { passive: true, once: true });
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "Enter") go();
    }, { once: true });
  }

  /* ---------------- drawing ---------------- */
  function drawStars() {
    var dz = 0.5 + throttle * 3.4;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.z -= dz;
      if (s.z <= 0.12) { stars[i] = newStar(ZMAX); continue; }
      var z = s.z, pz = Math.min(z + dz, ZMAX);
      var x1 = vx + (s.x / z) * SFOC, y1 = vy + (s.y / z) * SFOC;
      var x2 = vx + (s.x / pz) * SFOC, y2 = vy + (s.y / pz) * SFOC;
      // cap the streak: at rest a star is a dot, at speed it draws a long
      // trail. Without this, stars close to the camera draw huge straight
      // lines that read as geometric artifacts.
      var ddx = x1 - x2, ddy = y1 - y2;
      var slen = Math.hypot(ddx, ddy);
      var maxLen = 3 + throttle * 130;
      if (slen > maxLen) {
        var kk = maxLen / slen;
        x2 = x1 - ddx * kk; y2 = y1 - ddy * kk;
      }
      if (x1 < -90 || x1 > W + 90 || y1 < -90 || y1 > H + 90) continue;
      var a = 0.14 + 0.86 * (1 - z / ZMAX);
      var r = Math.min(3.1, Math.max(0.35, 1.6 / z * 1.9));
      if (s.big) {
        var g = ctx.createRadialGradient(x1, y1, 0, x1, y1, r * 7);
        g.addColorStop(0, "rgba(255,255,255," + (a * 0.95).toFixed(2) + ")");
        g.addColorStop(0.4, "rgba(170,200,255," + (a * 0.3).toFixed(2) + ")");
        g.addColorStop(1, "rgba(120,150,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x1, y1, r * 7, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = a;
      ctx.strokeStyle = "rgba(226,236,255,1)";
      ctx.lineWidth = r;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawRing(o, x, y, r, back) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.32);
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r * (1.85 + i * 0.16), r * (0.52 + i * 0.05), 0, back ? Math.PI : 0, back ? TAU : Math.PI);
      ctx.strokeStyle = rgba(o.glow, 0.30 - i * 0.07);
      ctx.lineWidth = Math.max(1.5, r * 0.10);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanet(o, d, a) {
    var scale = FOCAL / Math.max(d, NEAR);
    var r = Math.max(o.r * scale, 1.2);
    if (r > 4200) return;
    var x = vx + o.ox * scale, y = vy + o.oy * scale;
    ctx.globalAlpha = a;

    var halo = ctx.createRadialGradient(x, y, r * 0.85, x, y, r * 2.7);
    halo.addColorStop(0, rgba(o.glow, 0.26));
    halo.addColorStop(1, rgba(o.glow, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * 2.7, 0, TAU); ctx.fill();

    if (o.ring) drawRing(o, x, y, r, true);
    var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.34, r * 0.04, x, y, r * 1.02);
    g.addColorStop(0, lighten(o.col, 0.62));
    g.addColorStop(0.45, o.col);
    g.addColorStop(1, darken(o.col, 0.82));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if (o.ring) drawRing(o, x, y, r, false);
    ctx.globalAlpha = 1;

    if (o.label && d > 90) {
      ctx.globalAlpha = a * clamp(1 - (d - 1200) / 900, 0, 1);
      ctx.font = "600 " + clamp(r * 0.20, 11, 22).toFixed(0) + "px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "#eaf0ff";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 10;
      ctx.fillText(o.label, x, y + r * 1.16);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  function drawAsteroids(o) {
    for (var i = 0; i < o.rocks.length; i++) {
      var k = o.rocks[i];
      var d = o.z + k.z - camZ;
      var a = alphaP(progress, { enc: o.enc + k.z / TOTAL, fin: 0.06, fout: 0.02 });
      if (a <= 0 || d <= NEAR) continue;
      var scale = FOCAL / d;
      var x = vx + k.x * scale, y = vy + k.y * scale;
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      var rr = Math.max(0.8, k.r * scale);
      ctx.globalAlpha = a;
      ctx.fillStyle = k.c;
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      for (var s = 1; s < 7; s++) {
        var ang = s / 7 * TAU, rad = rr * (0.7 + k.s[s - 1] * 0.5);
        ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawStarBody(o, d, a) {
    var scale = FOCAL / Math.max(d, NEAR);
    var r = Math.max(o.r * scale, 2);
    if (r > 6000) return;
    var x = vx + o.ox * scale, y = vy + o.oy * scale;
    ctx.globalAlpha = a;
    var halo = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 4.2);
    halo.addColorStop(0, rgba(o.glow, 0.5));
    halo.addColorStop(0.35, rgba(o.col, 0.18));
    halo.addColorStop(1, rgba(o.col, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(x, y, r * 4.2, 0, TAU); ctx.fill();
    var g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r);
    g.addColorStop(0, "#fff8ec");
    g.addColorStop(0.4, lighten(o.col, 0.35));
    g.addColorStop(1, o.col);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawSprite(o, d, a) {
    var scale = FOCAL / Math.max(d, NEAR);
    var r = o.r * scale;
    if (r < 2) return;
    var x = vx + (o.ox || 0) * scale, y = vy + (o.oy || 0) * scale;
    var additive = o.kind !== "blackhole";
    if (additive) ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a;
    ctx.save();
    ctx.translate(x, y);
    if (o.spin) ctx.rotate(clock * 0.02 * o.spin);
    ctx.drawImage(o.sprite, -r, -r, r * 2, r * 2);
    ctx.restore();
    if (additive) ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  /* the nebula is a cloud of blobs, each on its own depth, so you fly
     through it rather than past a flat picture */
  function drawCloud(o) {
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < o.parts.length; i++) {
      var k = o.parts[i];
      var a = alphaP(progress, { enc: o.enc + k.z / TOTAL, fin: o.fin, fout: o.fout });
      var d = o.z + k.z - camZ;
      // fade a blob out as it gets very close, so it never smears the whole
      // screen into a flat wash of colour
      a *= clamp((d - 200) / 700, 0, 1);
      if (a <= 0.004) continue;
      var scale = FOCAL / Math.max(d, NEAR);
      if (k.kind === "filament") {
        var fsz = k.size * scale;
        if (fsz < 30 || fsz > 9000) continue;
        var fx2 = vx + k.x * scale, fy2 = vy + k.y * scale;
        ctx.save();
        ctx.translate(fx2, fy2);
        ctx.rotate(k.rot);
        ctx.globalAlpha = a * 0.6;
        ctx.drawImage(k.sprite, -fsz / 2, -fsz / 2, fsz, fsz);
        ctx.restore();
        ctx.globalAlpha = 1;
        continue;
      }
      var x = vx + k.x * scale, y = vy + k.y * scale;
      var rr = k.r * scale;
      if (k.kind === "star") {
        if (rr < 0.6 || rr > 70) continue;
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
        ctx.globalAlpha = a * clamp(1 - rr / 70, 0.25, 1);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(x, y, Math.min(rr, 2.4), 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }
      if (rr < 4) continue;
      if (x < -rr || x > W + rr || y < -rr || y > H + rr) continue;
      var g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      if (k.kind === "knot") {
        g.addColorStop(0, rgba(k.col, 0.44 * a));
        g.addColorStop(0.30, rgba(k.col, 0.16 * a));
        g.addColorStop(1, rgba(k.col, 0));
      } else {
        g.addColorStop(0, rgba(k.col, 0.12 * a));
        g.addColorStop(0.45, rgba(k.col, 0.045 * a));
        g.addColorStop(1, rgba(k.col, 0));
      }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  function drawObjects() {
    var list = [];
    for (var i = 0; i < objects.length; i++) {
      var o = objects[i];
      var a = alphaP(progress, o);
      // the cloud culls itself per blob, so keep it whenever it is near
      if (o.t === "cloud") {
        if (progress < o.enc - 0.24 || progress > o.enc + 0.22) continue;
        o._a = 1;
      } else {
        if (a <= 0.004) continue;
        o._a = a;
      }
      o._d = o.z - camZ;
      list.push(o);
    }
    list.sort(function (p, q) { return q._d - p._d; });
    for (var j = 0; j < list.length; j++) {
      var o = list[j];
      if (o.t === "planet") drawPlanet(o, o._d, o._a);
      else if (o.t === "asteroids") drawAsteroids(o);
      else if (o.t === "cloud") drawCloud(o);
      else if (o.t === "star") drawStarBody(o, o._d, o._a);
      else if (o.t === "sprite") drawSprite(o, o._d, o._a);
    }
  }

  function drawBackground() {
    ctx.fillStyle = "#03040c";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    var t = clock * 0.0025;
    var h1 = ctx.createRadialGradient(W * (0.24 + Math.sin(t) * 0.05), H * 0.3, 0, W * 0.24, H * 0.3, W * 0.62);
    h1.addColorStop(0, "rgba(70,50,180,0.15)");
    h1.addColorStop(1, "rgba(70,50,180,0)");
    ctx.fillStyle = h1; ctx.fillRect(0, 0, W, H);
    var h2 = ctx.createRadialGradient(W * (0.78 - Math.sin(t) * 0.05), H * 0.72, 0, W * 0.78, H * 0.72, W * 0.55);
    h2.addColorStop(0, "rgba(20,110,150,0.12)");
    h2.addColorStop(1, "rgba(20,110,150,0)");
    ctx.fillStyle = h2; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------------- loop ---------------- */
  var last = 0, hudTick = 0;
  function frame(ts) {
    if (!alive) return;
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    clock += dt * 60;

    camZ += (targetZ - camZ) * (reduce ? 0.25 : 0.075);
    camVel = camZ - prevCamZ;
    prevCamZ = camZ;

    var inst = Math.abs(camVel);
    var tgt = started ? 0.07 + inst * 0.10 : 0;
    throttle += (tgt - throttle) * 0.08;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    vx = cx + mouse.x * 26;
    vy = cy + mouse.y * 26;

    drawBackground();
    drawStars();
    drawObjects();

    hudTick += dt;
    if (hudTick > 0.1) { hudTick = 0; updateHud(); }

    requestAnimationFrame(frame);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    sprites.galaxy = makeGalaxy(small ? 512 : 1024);
    sprites.web = makeWeb(small ? 512 : 900);
    sprites.blackhole = makeBlackHole(small ? 512 : 800);
    var wispCols = ["#ff5ea8", "#7c2ff0", "#22d3ee", "#34d399", "#a78bfa"];
    sprites.wisps = wispCols.map(function (col) { return makeWisp(256, col); });

    objects = buildObjects();
    buildStars();
    buildStages();
    resize();
    initLaunch();

    elSpeed = document.getElementById("hudSpeed");
    elDist = document.getElementById("hudDist");
    elLoc = document.getElementById("hudLoc");
    rail = document.getElementById("rail");

    if (rail) {
      STAGES.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.innerHTML = '<span class="tip">' + s.title + '</span>';
        b.setAttribute("aria-label", "Jump to " + s.title);
        b.addEventListener("click", function () {
          if (!started) {
            started = true;
            document.body.classList.remove("locked");
            var l = document.getElementById("launch"); if (l) l.classList.add("gone");
          }
          var y = spacerTop + s.at * Math.max(1, spacerH - window.innerHeight);
          window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
        });
        rail.appendChild(b);
      });
    }

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) {
      mouse.tx = (e.clientX / W - 0.5) * 2;
      mouse.ty = (e.clientY / H - 0.5) * 2;
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) alive = false;
      else if (!alive) { alive = true; last = performance.now(); requestAnimationFrame(frame); }
    });

    var restart = document.getElementById("restartBtn");
    if (restart) restart.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });

    // debug hook (used by the test harness; harmless in production)
    window.__journey = function () {
      return { camZ: camZ, camVel: camVel, throttle: throttle, progress: progress, objects: objects.length };
    };

    readScroll();
    requestAnimationFrame(function (t) { last = t; requestAnimationFrame(frame); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
