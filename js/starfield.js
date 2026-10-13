/* ============================================================
   Explore Universe — animated starfield engine
   Zero dependencies. Draws a twinkling, parallaxing star field
   with occasional shooting stars on a <canvas>.
   ============================================================ */
(function (global) {
  "use strict";

  function rand(min, max) { return min + Math.random() * (max - min); }

  function Starfield(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.density = opts.density || 0.00018;      // stars per px^2
    this.maxStars = opts.maxStars || 620;
    this.speed = opts.speed == null ? 1 : opts.speed;
    this.shooting = opts.shooting !== false;
    this.parallax = opts.parallax !== false;
    this.tint = opts.tint || ["#ffffff", "#cfe0ff", "#ffe6c2", "#c9c4ff"];
    this.stars = [];
    this.shooters = [];
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.raf = null;
    this.lastShoot = 0;
    this.t = 0;

    this._resize = this._resize.bind(this);
    this._loop = this._loop.bind(this);
    this._move = this._move.bind(this);

    window.addEventListener("resize", this._resize);
    if (this.parallax) window.addEventListener("mousemove", this._move);

    this._resize();
    this._seed();
    this.raf = requestAnimationFrame(this._loop);
  }

  Starfield.prototype._resize = function () {
    var c = this.canvas;
    var w = c.clientWidth || window.innerWidth;
    var h = c.clientHeight || window.innerHeight;
    c.width = Math.floor(w * this.dpr);
    c.height = Math.floor(h * this.dpr);
    this.w = w; this.h = h;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this._seed();
  };

  Starfield.prototype._seed = function () {
    var target = Math.min(this.maxStars, Math.round(this.w * this.h * this.density));
    target = Math.max(target, 60);
    this.stars = [];
    for (var i = 0; i < target; i++) {
      var depth = Math.random(); // 0 far .. 1 near
      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        r: rand(0.3, 1.5) * (0.6 + depth),
        a: rand(0.25, 0.9),
        tw: rand(0.004, 0.02),
        ph: Math.random() * Math.PI * 2,
        depth: depth,
        color: this.tint[(Math.random() * this.tint.length) | 0],
        flare: depth > 0.9 && Math.random() > 0.7
      });
    }
  };

  Starfield.prototype._move = function (e) {
    this.mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  Starfield.prototype._spawnShooter = function () {
    var fromLeft = Math.random() > 0.5;
    var startX = fromLeft ? rand(-0.1, 0.35) * this.w : rand(0.65, 1.1) * this.w;
    this.shooters.push({
      x: startX,
      y: rand(-0.05, 0.35) * this.h,
      vx: (fromLeft ? 1 : -1) * rand(5.5, 9) * this.speed,
      vy: rand(2.4, 4.2) * this.speed,
      len: rand(90, 190),
      life: 1,
      decay: rand(0.006, 0.012)
    });
  };

  Starfield.prototype._loop = function (now) {
    var ctx = this.ctx, i, s;
    this.t += 1;

    // parallax easing
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.045;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.045;
    var px = this.mouse.x * 18;
    var py = this.mouse.y * 18;

    ctx.clearRect(0, 0, this.w, this.h);

    // stars
    for (i = 0; i < this.stars.length; i++) {
      s = this.stars[i];
      var tw = 0.6 + 0.4 * Math.sin(this.t * s.tw + s.ph);
      var alpha = Math.min(1, s.a * tw);
      var x = s.x - px * s.depth;
      var y = s.y - py * s.depth;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;

      if (s.flare) {
        // bright star with a soft glow + cross flare
        var g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 7);
        g.addColorStop(0, "rgba(255,255,255,0.9)");
        g.addColorStop(0.4, "rgba(180,200,255,0.35)");
        g.addColorStop(1, "rgba(120,140,255,0)");
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, s.r * 7, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "rgba(220,230,255,0.55)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - s.r * 6, y); ctx.lineTo(x + s.r * 6, y);
        ctx.moveTo(x, y - s.r * 6); ctx.lineTo(x, y + s.r * 6);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // shooting stars
    if (this.shooting && now - this.lastShoot > rand(2600, 6200)) {
      this.lastShoot = now;
      if (this.shooters.length < 3) this._spawnShooter();
    }
    for (i = this.shooters.length - 1; i >= 0; i--) {
      var sh = this.shooters[i];
      sh.x += sh.vx; sh.y += sh.vy; sh.life -= sh.decay;
      var nx = sh.x - sh.vx, ny = sh.y - sh.vy;
      var tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
      var tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
      var lg = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
      lg.addColorStop(0, "rgba(255,255,255," + Math.max(0, sh.life) + ")");
      lg.addColorStop(0.3, "rgba(160,200,255," + Math.max(0, sh.life * 0.5) + ")");
      lg.addColorStop(1, "rgba(120,140,255,0)");
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      if (sh.life <= 0 || sh.x < -200 || sh.x > this.w + 200 || sh.y > this.h + 200) {
        this.shooters.splice(i, 1);
      }
    }

    this.raf = requestAnimationFrame(this._loop);
  };

  Starfield.prototype.destroy = function () {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this._resize);
    if (this.parallax) window.removeEventListener("mousemove", this._move);
  };

  global.Starfield = Starfield;
})(window);
