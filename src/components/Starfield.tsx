import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Props {
  /** Star count at a ~1920x1080 viewport; scaled by actual viewport area and low-core devices. */
  baseStarCount?: number;
}

interface Star {
  /** Fractional position (0..1) — recomputed against the live canvas size each draw, so a
   *  resize rescales the field instead of reshuffling it. */
  fx: number;
  fy: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  twinkleAmp: number;
  colorIndex: number;
}

const STARLIGHT_PROPERTIES = [
  "--color-starlight-white",
  "--color-starlight-blue",
  "--color-starlight-warm",
];
// Roughly matches real starlight color distribution: mostly plain white, a cooler blue-white
// minority, a rare warm outlier.
const STARLIGHT_WEIGHTS = [0.7, 0.22, 0.08];

const pickColorIndex = () => {
  const roll = Math.random();
  let cumulative = 0;
  for (let i = 0; i < STARLIGHT_WEIGHTS.length; i++) {
    cumulative += STARLIGHT_WEIGHTS[i];
    if (roll < cumulative) return i;
  }
  return 0;
};

/**
 * A realistic, fixed starscape — fine twinkling dots, no drift. Mounted once at the page
 * level (`position: fixed`, behind everything), so it stays put while the page scrolls under
 * it: the intended parallax cue is the star layer never moving at all, while the hero's castle
 * and future in-flow content scroll normally over it. Paints its own solid `--color-surface-bg`
 * fill first, so any section with a transparent "sky" band (see Hero.astro) reveals it.
 * Visible on every theme (all four are dark mode); the flag-gated hide/show mechanism stays
 * in place for any future light-mode theme rather than being ripped out for a currently-unused branch.
 */
export default function Starfield({ baseStarCount = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;

    const palette = STARLIGHT_PROPERTIES.map(() => "#f4f6ff");
    let starsVisible = true;
    const readTokens = () => {
      const styles = getComputedStyle(canvas);
      STARLIGHT_PROPERTIES.forEach((prop, i) => {
        const value = styles.getPropertyValue(prop).trim();
        if (value) palette[i] = value;
      });
      const visibleFlag = styles
        .getPropertyValue("--surface-starfield-visible")
        .trim();
      starsVisible = visibleFlag !== "0";
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let stars: Star[] = [];

    const starCount = () => {
      const area = width * height;
      const areaFactor = Math.min(1, area / (1920 * 1080));
      let count = Math.round(baseStarCount * Math.max(0.3, areaFactor));
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
        count = Math.round(count * 0.6);
      }
      return Math.max(60, Math.min(320, count));
    };

    const makeStar = (): Star => ({
      fx: Math.random(),
      fy: Math.random(),
      // Cubed random biases heavily toward small/dim — a handful of brighter stars stand out
      // rather than every star reading at the same size and brightness.
      size: 0.4 + Math.random() ** 3 * 1.6,
      baseAlpha: 0.2 + Math.random() ** 2 * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.0008 + Math.random() * 0.0016,
      twinkleAmp: 0.15 + Math.random() * 0.35,
      colorIndex: pickColorIndex(),
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: starCount() }, makeStar);
    };

    const drawFrame = (time: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      if (!starsVisible) return;
      for (const s of stars) {
        const alpha = animate
          ? s.baseAlpha +
            Math.sin(time * s.twinkleSpeed + s.twinklePhase) * s.twinkleAmp
          : s.baseAlpha;
        ctx.globalAlpha = Math.min(1, Math.max(0.05, alpha));
        ctx.fillStyle = palette[s.colorIndex];
        ctx.beginPath();
        ctx.arc(s.fx * width, s.fy * height, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const tick = (time: number) => {
      drawFrame(time, true);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion) {
        // Stars don't drift even with motion on — under reduced motion there's simply no
        // animation loop at all: one static draw, then genuinely idle (no ongoing rAF cost).
        drawFrame(0, false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const stop = () => cancelAnimationFrame(raf);

    const onVisibilityChange = () => {
      if (reducedMotion) return;
      if (document.visibilityState === "visible") start();
      else stop();
    };

    readTokens();
    // ResizeObserver delivers an initial callback with the element's current size as soon as
    // observation starts, so no separate up-front resize() call is needed here.
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) drawFrame(0, false);
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readTokens();
      if (reducedMotion) drawFrame(0, false);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion, baseStarCount]);

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: purely decorative fixed backdrop (pointer-events: none, never focusable) — aria-hidden is intentional.
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        // Reserved as the page's back-most layer — everything else on the page is either
        // unpositioned (stacks above by document order) or, like .hero, establishes its own
        // local stacking context (`isolation: isolate`) so this value never has to compete
        // with a section's own internal z-index scale.
        zIndex: -1,
        pointerEvents: "none",
        backgroundColor: "var(--color-surface-bg)",
      }}
    />
  );
}
