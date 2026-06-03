// Canvas dot-connection animation — driven by CONFIG (config.js)

(function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let W, H, connectDist;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    connectDist = Math.min(W, H) * CONFIG.connectDistFraction;
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Background stars ──────────────────────────────────────────────────────
  const stars = Array.from({ length: CONFIG.starCount }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 0.8 + 0.2,
    a: Math.random() * 0.6 + 0.1,
  }));

  function drawStars() {
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 215, 240, ${s.a})`;
      ctx.fill();
    }
  }

  // ── Dot class ─────────────────────────────────────────────────────────────
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  class Dot {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      const angle = Math.random() * Math.PI * 2;
      const speed = rand(CONFIG.speedMin, CONFIG.speedMax);
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.r = rand(CONFIG.sizeMin, CONFIG.sizeMax);

      const [h, s, l] =
        CONFIG.palette[Math.floor(Math.random() * CONFIG.palette.length)];
      const jitter = (Math.random() - 0.5) * 30;
      this.h = h + jitter;
      this.s = s;
      this.l = l;
      this.hsl = `${this.h}, ${s}%, ${l}%`;

      this.tFadeIn = rand(CONFIG.fadeInMin, CONFIG.fadeInMax) | 0;
      this.tFadeOut = rand(CONFIG.fadeOutMin, CONFIG.fadeOutMax) | 0;
      this.tAlive = rand(CONFIG.aliveMin, CONFIG.aliveMax) | 0;
      this.tTotal = this.tFadeIn + this.tAlive + this.tFadeOut;
      this.age = 0;
      this.opacity = 0;
    }

    get alive() {
      return this.age < this.tTotal;
    }

    tick() {
      this.age++;
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;

      if (this.age < this.tFadeIn) {
        this.opacity = this.age / this.tFadeIn;
      } else if (this.age > this.tTotal - this.tFadeOut) {
        this.opacity = (this.tTotal - this.age) / this.tFadeOut;
      } else {
        this.opacity = 1;
      }
      this.opacity = Math.max(0, Math.min(1, this.opacity));
    }

    draw() {
      // Glow halo
      const glow = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.r * 5,
      );
      glow.addColorStop(0, `hsla(${this.hsl}, ${this.opacity * 0.35})`);
      glow.addColorStop(1, `hsla(${this.hsl}, 0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hsl}, ${this.opacity})`;
      ctx.fill();
    }
  }

  // ── Initialise with dots seeded at random life stages ─────────────────────
  let dots = [];
  for (let i = 0; i < CONFIG.maxDots; i++) {
    const d = new Dot();
    d.age = Math.floor(Math.random() * d.tTotal * 0.8);
    dots.push(d);
  }

  // ── Connection drawing ────────────────────────────────────────────────────
  function drawConnections() {
    const n = dots.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > connectDist) continue;

        const proximity = 1 - dist / connectDist;
        const alpha =
          proximity *
          Math.min(dots[i].opacity, dots[j].opacity) *
          CONFIG.lineOpacity;

        let hi = dots[i].h, hj = dots[j].h;
        if (Math.abs(hi - hj) > 180) { if (hi < hj) hi += 360; else hj += 360; }
        const avgH = ((hi + hj) / 2) % 360;
        const avgS = (dots[i].s + dots[j].s) / 2;
        const avgL = (dots[i].l + dots[j].l) / 2;
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `hsla(${avgH}, ${avgS}%, ${avgL}%, ${alpha})`;
        ctx.lineWidth = proximity * CONFIG.lineWidthMax;
        ctx.stroke();
      }
    }
  }

  // ── FPS counter ───────────────────────────────────────────────────────────
  let fps = 0;
  let lastTime = performance.now();

  function updateFPS(now) {
    const dt = now - lastTime;
    lastTime = now;
    fps += (1000 / dt - fps) * 0.1; // exponential moving average
  }

  function drawFPS() {
    if (!CONFIG.showFPS) return;
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "rgba(144, 144, 168, 0.8)";
    ctx.fillText(`${fps.toFixed(1)} fps`, 12, H - 12);
  }

  // ── Main render loop ──────────────────────────────────────────────────────
  function frame(now) {
    updateFPS(now);

    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, W, H);

    drawStars();

    for (let i = dots.length - 1; i >= 0; i--) {
      dots[i].tick();
      if (!dots[i].alive) dots.splice(i, 1);
    }
    while (dots.length < CONFIG.maxDots) dots.push(new Dot());

    drawConnections();
    for (const d of dots) d.draw();

    drawFPS();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
