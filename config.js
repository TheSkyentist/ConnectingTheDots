// ─────────────────────────────────────────────────────────────────────────────
// Site & animation configuration
// Edit this file to tune the look of the canvas animation.
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {
  // ── Canvas background ──────────────────────────────────────────────────────
  bgColor: "#07070e",

  // ── Dot colour palette ─────────────────────────────────────────────────────
  // Each entry: [hue (0–360), saturation (%), lightness (%), weight?]
  // Weight defaults to 1.0; relative fractions control selection probability.
  // Hue jitter of ±15° is applied automatically so each dot varies slightly.
  palette: [
    [355, 75, 62], // vivid red
    [10, 80, 60], // red-orange
    [20, 70, 58], // orange-red
    [0, 60, 50], // deep red
    [340, 65, 55], // rose-red
    [199, 72, 56, 1 / 20], // steel blue (downweighted)
  ],

  // ── Population ─────────────────────────────────────────────────────────────
  maxDots: 200,

  // Maximum connection distance as a fraction of min(canvasW, canvasH)
  connectDistFraction: 0.22,

  // ── Dot movement ───────────────────────────────────────────────────────────
  speedMin: 0.05,
  speedMax: 0.25,

  // ── Dot size (radius in px) ─────────────────────────────────────────────────
  sizeMin: 1.2,
  sizeMax: 3.4,

  // ── Lifecycle (frames at ~60 fps) ──────────────────────────────────────────
  fadeInMin: 50,
  fadeInMax: 90,
  aliveMin: 240,
  aliveMax: 540,
  fadeOutMin: 60,
  fadeOutMax: 100,

  // ── Background stars ───────────────────────────────────────────────────────
  starCount: 1000,

  // ── Connection line opacity multiplier (0–1) ───────────────────────────────
  lineOpacity: 0.55,

  // ── Connection line thickness ──────────────────────────────────────────────
  // Maximum line width in px at closest proximity; thins to 0 as dots move apart.
  lineWidthMax: 1.2,

  // ── Debug ──────────────────────────────────────────────────────────────────
  showFPS: false,
};
