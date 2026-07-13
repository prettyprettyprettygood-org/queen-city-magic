import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface Props {
  /*
    className, not Astro's usual `class` prop convention: Astro's compiler intercepts a
    literal `class` attribute on component invocations for scoped-style forwarding, and for a
    client-hydrated framework island that means the value never reaches the component as a
    prop at all (confirmed empirically — it's silently dropped, not merged). `className` is
    the React-idiomatic name anyway, and it passes through as an ordinary serialized prop.
  */
  className?: string;
  /** Base particle count at ~1024px+ container width; scaled down for narrower containers and low-core devices. */
  density?: number;
}

interface Particle {
  baseX: number;
  x: number;
  y: number;
  size: number;
  vy: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  alpha: number;
  flicker: number;
  colorIndex: number;
}

/**
 * Warm ember/sparkle motes drifting behind a section's content. Mounted per-instance (hero,
 * dividers, ...), each with its own IntersectionObserver so the rAF loop only runs while that
 * instance is actually on screen, and stops entirely (not just slows) when the tab is hidden.
 * Doesn't mount under prefers-reduced-motion: reduce — no canvas, no loop, no draw calls.
 */
export default function ParticleField({ className, density = 60 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  // Gate the first real render on a post-hydration effect so server and client-initial
  // markup both render nothing — avoids a hydration mismatch from reducedMotion resolving
  // differently between server (always false) and client (real matchMedia read).
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reducedMotion) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;

    const paletteProperties = [
      "--color-surface-glow",
      "--color-surface-primary",
      "--color-surface-accent",
    ];
    const palette = paletteProperties.map(() => "#c1630b");
    const readPalette = () => {
      const styles = getComputedStyle(canvas);
      paletteProperties.forEach((prop, i) => {
        const value = styles.getPropertyValue(prop).trim();
        if (value) palette[i] = value;
      });
    };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let animating = false;
    let intersecting = false;

    const particleCount = () => {
      const widthFactor = Math.min(1, width / 1024);
      let count = Math.round(density * Math.max(0.35, widthFactor));
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
        count = Math.round(count * 0.6);
      }
      return Math.max(15, Math.min(80, count));
    };

    const makeParticle = (): Particle => {
      const x = Math.random() * width;
      return {
        baseX: x,
        x,
        y: Math.random() * height,
        size: 1 + Math.random() * 2.2,
        vy: 0.15 + Math.random() * 0.35,
        swayAmp: 6 + Math.random() * 14,
        swaySpeed: 0.0006 + Math.random() * 0.0012,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random(),
        flicker:
          (0.004 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1),
        colorIndex: Math.floor(Math.random() * palette.length),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: particleCount() }, makeParticle);
    };

    const tick = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy;
        if (p.y < -10) {
          p.y = height + 10;
          p.baseX = Math.random() * width;
        }
        p.x = p.baseX + Math.sin(time * p.swaySpeed + p.phase) * p.swayAmp;
        p.alpha += p.flicker;
        if (p.alpha > 0.9 || p.alpha < 0.1) p.flicker *= -1;
        ctx.globalAlpha = Math.min(0.9, Math.max(0.1, p.alpha));
        ctx.fillStyle = palette[p.colorIndex];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (animating) return;
      animating = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      animating = false;
      cancelAnimationFrame(raf);
    };

    const syncRunning = () => {
      if (intersecting && document.visibilityState === "visible") start();
      else stop();
    };

    readPalette();

    // ResizeObserver delivers an initial callback with the element's current size as soon as
    // observation starts, so no separate up-front resize() call is needed here.
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        intersecting = entry.isIntersecting;
        syncRunning();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", syncRunning);
    const themeObserver = new MutationObserver(readPalette);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", syncRunning);
    };
  }, [mounted, reducedMotion, density]);

  if (!mounted || reducedMotion) return null;

  return (
    // biome-ignore lint/a11y/noAriaHiddenOnFocusable: purely decorative canvas (pointer-events: none, never focusable) — aria-hidden is intentional per PRD 04's accessibility branch.
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
