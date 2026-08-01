import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Blob {
  /** Two-frequency sine sums per axis — a cheap "organic" drift that never settles into a
   *  simple back-and-forth or circular loop, unlike a single sine (breathing) or a single
   *  circular parametric path would. */
  freqX1: number;
  freqX2: number;
  phaseX1: number;
  phaseX2: number;
  freqY1: number;
  freqY2: number;
  phaseY1: number;
  phaseY2: number;
  freqR: number;
  phaseR: number;
  baseRadius: number;
  baseAlpha: number;
}

const BLOB_COUNT = 4;
// Radians/ms — slow enough to read as ambient drift, not a visible pulse.
const FREQ_RANGE: [number, number] = [0.00012, 0.00035];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const makeBlob = (): Blob => ({
  freqX1: rand(...FREQ_RANGE),
  freqX2: rand(...FREQ_RANGE) * rand(1.6, 2.4),
  phaseX1: rand(0, Math.PI * 2),
  phaseX2: rand(0, Math.PI * 2),
  freqY1: rand(...FREQ_RANGE),
  freqY2: rand(...FREQ_RANGE) * rand(1.6, 2.4),
  phaseY1: rand(0, Math.PI * 2),
  phaseY2: rand(0, Math.PI * 2),
  freqR: rand(...FREQ_RANGE) * 0.7,
  phaseR: rand(0, Math.PI * 2),
  baseRadius: rand(0.32, 0.48),
  baseAlpha: rand(0.16, 0.26),
});

/**
 * Ambient flowing aura behind a `Card featured`. Deliberately not a uniform opacity/scale
 * "breathe" — several softly-lit blobs drift along independent two-frequency (Lissajous-like)
 * paths and pulse at their own uncorrelated rate, so the composite reads as a living, shifting
 * glow rather than one shape pulsing in and out. Color follows `--color-surface-featured`
 * (each mood's own hue; the default Twilight theme's own violet rather than the site-wide
 * gold), re-sampled on theme switch the same way Starfield.tsx re-samples starlight colors.
 * Sized exactly to the card (not bled past its edges) with the card's own border-radius, so a
 * blob drifting toward an edge is clipped by that rounded corner — it reads as passing behind
 * the card, not spilling out past it.
 */
export default function FeaturedCardGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;

    let color = "#a78bfa";
    const readTokens = () => {
      const value = getComputedStyle(canvas)
        .getPropertyValue("--color-surface-featured")
        .trim();
      if (value) color = value;
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let isIntersecting = true;
    const blobs: Blob[] = Array.from({ length: BLOB_COUNT }, makeBlob);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;

      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(18px)";

      const minSide = Math.min(width, height);

      for (const b of blobs) {
        const nx =
          0.5 +
          0.32 * Math.sin(time * b.freqX1 + b.phaseX1) +
          0.18 * Math.sin(time * b.freqX2 + b.phaseX2);
        const ny =
          0.5 +
          0.32 * Math.sin(time * b.freqY1 + b.phaseY1) +
          0.18 * Math.sin(time * b.freqY2 + b.phaseY2);
        const radiusPulse = 0.85 + 0.15 * Math.sin(time * b.freqR + b.phaseR);
        const cx = nx * width;
        const cy = ny * height;
        const r = b.baseRadius * minSide * radiusPulse;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.globalAlpha = b.baseAlpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    const tick = (time: number) => {
      drawFrame(time);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!isIntersecting || document.visibilityState !== "visible") return;
      if (reducedMotion) {
        // One settled frame, no ongoing rAF cost — matches Starfield.tsx's reduced-motion
        // handling.
        drawFrame(0);
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

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    readTokens();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) drawFrame(0);
    });
    resizeObserver.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      readTokens();
      if (reducedMotion) drawFrame(0);
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
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [reducedMotion]);

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: purely decorative, non-interactive (pointer-events: none) — aria-hidden is intentional.
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
    />
  );
}
