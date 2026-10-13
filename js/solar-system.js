/* ============================================================
   Explore Universe — interactive solar system
   A canvas orrery: animated planets, hover + click selection,
   live controls. No libraries.
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- colour helpers ---------- */
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(hex, target, amt) {
    var c = hexToRgb(hex);
    return "rgb(" + c.map(function (v, i) { return Math.round(v + (target[i] - v) * amt); }).join(",") + ")";
  }
  function lighten(hex, a) { return mix(hex, [255, 255, 255], a); }
  function darken(hex, a) { return mix(hex, [3, 4, 12], a); }
  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function SolarSystem(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.planets = global.PLANETS || [];
    this.onSelect = opts.onSelect || function () {};
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.playing = true;
    this.speed = 1;
    this.showOrbits = true;
    this.showLabels = true;
    this.selected = "earth";
    this.hovered = null;
    this.time = 0;
    this.angles = {};
    this.positions = [];
    this.stars = [];
    this.raf = null;
    this.last = 0;

    // give every planet a spread-out starting angle
    this.planets.forEach(function (p, i) {
      this.angles[p.id] = (i / this.planets.length) * Math.PI * 2 + Math.random() * 0.6;
    }, this);

    this._resize = this._resize.bind(this);
    this._frame = this._frame.bind(this);
    this._move = this._move.bind(this);
    this._click = this._click.bind(this);

    canvas.addEventListener("mousemove", this._move);
    canvas.addEventListener("click", this._click);
    canvas.addEventListener("mouseleave", function () { this.hovered = null; }.bind(this));

    if (global.ResizeObserver) {
      this.ro = new ResizeObserver(this._resize);
      this.ro.observe(canvas.parentElement);
    } else {
      global.addEventListener("resize", this._resize);
    }

    this._resize();
    this.raf = requestAnimationFrame(this._frame);
  }

  SolarSystem.prototype._resize = function () {
    var parent = this.canvas.parentElement;
    var w = parent.clientWidth || 800;
    var h = parent.clientHeight || 560;
    this.w = w; this.h = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.cx = w / 2; this.cy = h / 2;

    // fit the outermost orbit
    var maxOrbit = 0;
    this.planets.forEach(function (p) { maxOrbit = Math.max(maxOrbit, p.orbit + p.radius); });
    var pad = 40;
    this.scale = (Math.min(w, h) / 2 - pad) / (maxOrbit || 1);

    // static backdrop stars
    this.stars = [];
    var n = Math.round(w * h * 0.0004);
    for (var i = 0; i < n; i++) {
      this.stars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2, a: Math.random() * 0.6 + 0.15
      });
    }
  };

  SolarSystem.prototype._posOf = function (p) {
    var r = p.orbit * this.scale;
    var a = this.angles[p.id];
    return { x: this.cx + Math.cos(a) * r, y: this.cy + Math.sin(a) * r };
  };

  SolarSystem.prototype._move = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var hit = null;
    for (var i = 0; i < this.positions.length; i++) {
      var q = this.positions[i];
      var rr = Math.max(q.r, 14);
      if (Math.hypot(mx - q.x, my - q.y) < rr + 8) { hit = q.id; break; }
    }
    this.hovered = hit;
    this.canvas.style.cursor = hit ? "pointer" : "grab";
  };

  SolarSystem.prototype._click = function () {
    if (this.hovered) this.select(this.hovered);
  };

  SolarSystem.prototype.select = function (id) {
    var found = this.planets.some(function (p) { return p.id === id; });
    if (!found) return;
    this.selected = id;
    var p = this.planets.filter(function (x) { return x.id === id; })[0];
    this.onSelect(p);
  };

  SolarSystem.prototype._frame = function (ts) {
    if (!this.last) this.last = ts;
    var dt = Math.min((ts - this.last) / 1000, 0.05);
    this.last = ts;

    if (this.playing) {
      this.time += dt * this.speed;
      this.planets.forEach(function (p) {
        this.angles[p.id] += dt * p.period * 0.785 * this.speed;
      }, this);
    }
    this._draw();
    this.raf = requestAnimationFrame(this._frame);
  };

  SolarSystem.prototype._draw = function () {
    var ctx = this.ctx, w = this.w, h = this.h;
    ctx.clearRect(0, 0, w, h);

    // backdrop stars
    for (var i = 0; i < this.stars.length; i++) {
      var s = this.stars[i];
      ctx.globalAlpha = s.a;
      ctx.fillStyle = "#cdd7ff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    var self = this;

    // orbits
    if (this.showOrbits) {
      this.planets.forEach(function (p) {
        if (!p.orbit) return;
        ctx.beginPath();
        ctx.arc(self.cx, self.cy, p.orbit * self.scale, 0, Math.PI * 2);
        ctx.strokeStyle = p.id === self.selected ? rgba(p.glow, 0.5) : "rgba(140,160,255,0.13)";
        ctx.lineWidth = p.id === self.selected ? 1.6 : 1;
        ctx.stroke();
      });
    }

    // sun
    var sun = this.planets.filter(function (p) { return p.id === "sun"; })[0];
    if (sun) this._drawSun(sun);

    // planets
    this.positions = [];
    this.planets.forEach(function (p) {
      if (p.id === "sun") return;
      var pos = self._posOf(p);
      self._drawPlanet(p, pos);
      self.positions.push({ id: p.id, x: pos.x, y: pos.y, r: p.radius });
    });

    // hover tooltip
    if (this.hovered) {
      var hp = this.planets.filter(function (p) { return p.id === self.hovered; })[0];
      var hpos = this.positions.filter(function (q) { return q.id === self.hovered; })[0];
      if (hp && hpos) {
        ctx.font = "600 13px 'Space Grotesk', system-ui, sans-serif";
        var label = hp.name;
        var tw = ctx.measureText(label).width;
        var bx = hpos.x - tw / 2 - 10, by = hpos.y - hpos.r - 34;
        ctx.fillStyle = "rgba(8,10,24,0.92)";
        ctx.strokeStyle = rgba(hp.glow, 0.7);
        ctx.lineWidth = 1;
        roundRect(ctx, bx, by, tw + 20, 26, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#eaeeff";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(label, hpos.x, by + 14);
      }
    }
  };

  SolarSystem.prototype._drawSun = function (sun) {
    var ctx = this.ctx;
    var r = sun.radius * Math.min(1, this.scale * 2.2);
    r = Math.max(r, 26);
    this._sunR = r;
    this.positions.push({ id: "sun", x: this.cx, y: this.cy, r: r });

    // corona
    var halo = ctx.createRadialGradient(this.cx, this.cy, r * 0.6, this.cx, this.cy, r * 4.5);
    halo.addColorStop(0, "rgba(255,190,80,0.55)");
    halo.addColorStop(0.4, "rgba(255,140,40,0.16)");
    halo.addColorStop(1, "rgba(255,120,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(this.cx, this.cy, r * 4.5, 0, Math.PI * 2); ctx.fill();

    var g = ctx.createRadialGradient(this.cx - r * 0.3, this.cy - r * 0.3, r * 0.1, this.cx, this.cy, r);
    g.addColorStop(0, "#fffbe8");
    g.addColorStop(0.4, "#ffd257");
    g.addColorStop(1, "#ff9d2f");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2); ctx.fill();

    if (this.showLabels) {
      ctx.font = "600 13px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "rgba(234,238,255,0.9)";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("The Sun", this.cx, this.cy + r + 8);
    }
  };

  SolarSystem.prototype._drawPlanet = function (p, pos) {
    var ctx = this.ctx;
    var r = Math.max(p.radius * Math.min(1.4, this.scale * 2.4), 5);
    var isSel = p.id === this.selected;
    var isHov = p.id === this.hovered;

    // glow halo
    var halo = ctx.createRadialGradient(pos.x, pos.y, r * 0.5, pos.x, pos.y, r * (isSel ? 4 : 2.6));
    halo.addColorStop(0, rgba(p.glow, isSel ? 0.5 : 0.28));
    halo.addColorStop(1, rgba(p.glow, 0));
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r * (isSel ? 4 : 2.6), 0, Math.PI * 2); ctx.fill();

    // rings (behind for back half handled simply)
    if (p.ring) this._drawRing(p, pos, r, true);

    // body, lit from the sun (which sits at centre)
    var d = Math.hypot(this.cx - pos.x, this.cy - pos.y) || 1;
    var ux = (this.cx - pos.x) / d, uy = (this.cy - pos.y) / d;
    var g = ctx.createRadialGradient(pos.x + ux * r * 0.55, pos.y + uy * r * 0.55, r * 0.05, pos.x, pos.y, r * 1.05);
    g.addColorStop(0, lighten(p.colour, 0.55));
    g.addColorStop(0.5, p.colour);
    g.addColorStop(1, darken(p.colour, 0.72));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.fill();

    if (p.ring) this._drawRing(p, pos, r, false);

    // selection ring
    if (isSel) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r + 9, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(p.glow, 0.9);
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 5]);
      ctx.lineDashOffset = -this.time * 22;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (this.showLabels || isHov) {
      ctx.font = "600 12.5px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = isSel || isHov ? "#eaeeff" : "rgba(190,200,235,0.72)";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(p.name, pos.x, pos.y + r + (p.ring ? 12 : 7));
    }
  };

  SolarSystem.prototype._drawRing = function (p, pos, r, back) {
    var ctx = this.ctx;
    var rx = r * 2.1, ry = r * 0.62;
    var rot = p.id === "uranus" ? 1.45 : -0.34;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rot);
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * (0.82 + i * 0.12), ry * (0.82 + i * 0.12), 0, back ? Math.PI : 0, back ? Math.PI * 2 : Math.PI);
      ctx.strokeStyle = rgba(p.glow, 0.32 - i * 0.06);
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.restore();
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  SolarSystem.prototype.setPlaying = function (v) { this.playing = v; };
  SolarSystem.prototype.setSpeed = function (v) { this.speed = v; };
  SolarSystem.prototype.setOrbits = function (v) { this.showOrbits = v; };
  SolarSystem.prototype.setLabels = function (v) { this.showLabels = v; };

  global.SolarSystem = SolarSystem;
})(window);
