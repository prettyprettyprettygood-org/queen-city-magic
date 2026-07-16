interface Vector2D {
  x: number;
  y: number;
}

interface Particle {
  // Home position as a fraction (0..1) of the canvas's current width/height, not an absolute
  // pixel position — so a resize just reflows existing particles to the new size for free,
  // rather than needing a full re-randomization (which, done on every `resize` event fired
  // while a window is being actively dragged, is what caused the frantic reshuffling).
  fx: number;
  fy: number;
  // Current displacement from home, and current visibility (0..1) — both eased toward a
  // target every frame (see LERP_FACTOR) rather than driven by velocity/spring physics. There's
  // no momentum carried between frames, so nothing can overshoot and oscillate back past its
  // target — which is what produced the earlier "swirl" trailing effect.
  offsetX: number;
  offsetY: number;
  visibility: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  twinkleAmp: number;
  // Slow positional wander, independent of the cursor-push offset above — sampled from two
  // out-of-phase sine waves (separate phase/speed per axis) so particles trace a lazy, uneven
  // drift rather than a perfect circle or a synchronized bob.
  driftPhaseX: number;
  driftPhaseY: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftAmpX: number;
  driftAmpY: number;
}

// Cursor proximity radius within which sparkles get pushed outward a little and fade down,
// then ease back to their home position/full visibility as the cursor moves away.
const CURSOR_RADIUS = 90;
const PUSH_DISTANCE = 16;
// Fraction of the remaining distance to the current target closed each frame — an exponential
// ease, not a spring: no velocity/overshoot, so it can't loop back past home and circle.
const LERP_FACTOR = 0.16;
const MIN_RADIUS = 0.6;
const MAX_RADIUS = 2;
const MIN_ALPHA = 0.7;
const MAX_ALPHA = 1;
const TWINKLE_MIN_SPEED = 0.002;
const TWINKLE_MAX_SPEED = 0.005;
const TWINKLE_MIN_AMP = 0.25;
const TWINKLE_MAX_AMP = 0.45;
// Much slower than the twinkle cycle above — this is a lazy dust-mote float, not a shimmer.
const DRIFT_MIN_SPEED = 0.00025;
const DRIFT_MAX_SPEED = 0.0007;
const DRIFT_MIN_AMP = 2;
const DRIFT_MAX_AMP = 5;
// How long the whole field takes to ease up to full brightness once start() begins the loop —
// so sparkles fade in rather than snapping to full opacity on the first frame.
const FADE_IN_MS = 900;

/**
 * A canvas sparkle field, scoped to whatever box the canvas itself is sized to (the caller's
 * CSS controls that — see ParticleField.astro, which sizes the canvas to a padded box around
 * its parent element so it scrolls with the page as ordinary content would, no JS position-
 * tracking needed). Particles hold a home position within that box and twinkle in place; as the
 * cursor passes within CURSOR_RADIUS they ease outward a little and fade down, then ease back
 * to rest once it moves away. No external physics/particle library, and no velocity/spring
 * state — see LERP_FACTOR. Under `prefers-reduced-motion`, cursor tracking and the rAF loop are
 * both skipped entirely; particles draw once at their home position with no twinkle.
 *
 * Construction doesn't imply animation — call `start()` whenever the caller wants the field to
 * begin (e.g. once some other reveal animation finishes), so a canvas can sit blank/idle first.
 */
export class ParticleField {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly particleCount: number;
  private reducedMotion: boolean;
  private readonly reducedMotionQuery: MediaQueryList;
  private readonly handleReducedMotionChange: (
    event: MediaQueryListEvent,
  ) => void;
  private readonly handleVisibilityChange: () => void;
  private readonly dpr: number;
  private readonly themeObserver: MutationObserver;

  private particles: Particle[] = [];
  private width = 0;
  private height = 0;
  private mouse: Vector2D | null = null;
  private rafId: number | null = null;
  private startTime = 0;
  private color = "#f6c877";

  constructor(canvas: HTMLCanvasElement, particleCount = 40) {
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("ParticleField: canvas 2d context unavailable");

    this.canvas = canvas;
    this.ctx = context;
    this.particleCount = particleCount;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    this.reducedMotion = this.reducedMotionQuery.matches;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.tick = this.tick.bind(this);
    this.handleReducedMotionChange = (event) => {
      this.reducedMotion = event.matches;
      if (this.reducedMotion) {
        this.stop();
        this.render(0, false);
      } else if (document.visibilityState === "visible") {
        this.start();
      }
    };
    this.handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") this.stop();
      else if (!this.reducedMotion) this.start();
    };

    this.readColor();
    this.resize();
    this.createParticles();

    window.addEventListener("resize", this.handleResize);
    if (!this.reducedMotion) {
      window.addEventListener("mousemove", this.handleMouseMove);
      // `mouseleave` bound directly to `document` fires when the cursor exits the viewport
      // entirely (it doesn't bubble, so this only catches the document-level boundary).
      document.addEventListener("mouseleave", this.handleMouseLeave);
    }
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.themeObserver = new MutationObserver(() => this.readColor());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    this.reducedMotionQuery.addEventListener(
      "change",
      this.handleReducedMotionChange,
    );
  }

  start(): void {
    if (this.reducedMotion) {
      this.render(0, false);
      return;
    }
    if (this.rafId !== null) return;
    this.startTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  destroy(): void {
    this.stop();
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseleave", this.handleMouseLeave);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    this.themeObserver.disconnect();
    this.reducedMotionQuery.removeEventListener(
      "change",
      this.handleReducedMotionChange,
    );
  }

  private readColor(): void {
    const styles = getComputedStyle(this.canvas);
    // Mostly the warm-white parchment token with just a hint of the eyebrow text's own gold
    // mixed in — reads as subtle white sparkle dust rather than matching the gold text
    // exactly (the old, more-saturated amber-300-only mix read too yellow).
    const white = styles.getPropertyValue("--color-parchment-50").trim();
    const gold = styles.getPropertyValue("--color-amber-300").trim();
    this.color =
      white && gold
        ? `color-mix(in srgb, ${white} 75%, ${gold} 25%)`
        : this.color;
  }

  private createParticles(): void {
    this.particles = Array.from({ length: this.particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      // sqrt bias -> uniform density across a disk. Mapped onto an ellipse matching the
      // canvas's own aspect ratio (not a rectangle), so there's no hard square-cornered edge
      // where particles abruptly stop.
      const r = Math.sqrt(Math.random());
      return {
        fx: 0.5 + Math.cos(angle) * r * 0.5,
        fy: 0.5 + Math.sin(angle) * r * 0.5,
        offsetX: 0,
        offsetY: 0,
        visibility: 1,
        // Squared random biases toward the smaller end — most particles read as fine dust, a
        // handful land larger and stand out, rather than every particle at a uniform size.
        radius: MIN_RADIUS + Math.random() ** 2 * (MAX_RADIUS - MIN_RADIUS),
        baseAlpha: MIN_ALPHA + Math.random() * (MAX_ALPHA - MIN_ALPHA),
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed:
          TWINKLE_MIN_SPEED +
          Math.random() * (TWINKLE_MAX_SPEED - TWINKLE_MIN_SPEED),
        twinkleAmp:
          TWINKLE_MIN_AMP + Math.random() * (TWINKLE_MAX_AMP - TWINKLE_MIN_AMP),
        driftPhaseX: Math.random() * Math.PI * 2,
        driftPhaseY: Math.random() * Math.PI * 2,
        driftSpeedX:
          DRIFT_MIN_SPEED + Math.random() * (DRIFT_MAX_SPEED - DRIFT_MIN_SPEED),
        driftSpeedY:
          DRIFT_MIN_SPEED + Math.random() * (DRIFT_MAX_SPEED - DRIFT_MIN_SPEED),
        driftAmpX:
          DRIFT_MIN_AMP + Math.random() * (DRIFT_MAX_AMP - DRIFT_MIN_AMP),
        driftAmpY:
          DRIFT_MIN_AMP + Math.random() * (DRIFT_MAX_AMP - DRIFT_MIN_AMP),
      };
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    // The canvas scrolls with the page (see ParticleField.astro), so its viewport offset shifts
    // under scroll — mouse position is translated into the canvas's own local coordinate space
    // here rather than cached once, since particle positions are drawn in that local space.
    const rect = this.canvas.getBoundingClientRect();
    this.mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private handleMouseLeave(): void {
    this.mouse = null;
  }

  private handleResize(): void {
    // No re-randomization here — particle positions are stored as fractions of width/height
    // (see the Particle interface), so they already reflow correctly to the new size.
    this.resize();
    if (this.reducedMotion) this.render(0, false);
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private update(): void {
    for (const particle of this.particles) {
      let targetOffsetX = 0;
      let targetOffsetY = 0;
      let targetVisibility = 1;

      if (this.mouse) {
        // Direction is measured from the particle's fixed home position, not its current
        // (already-displaced) position — so the push direction never feeds back on itself as
        // the offset grows, which is what would turn a simple push into a circling drift.
        const dx = particle.fx * this.width - this.mouse.x;
        const dy = particle.fy * this.height - this.mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < CURSOR_RADIUS) {
          const proximity = 1 - distance / CURSOR_RADIUS;
          targetVisibility = 1 - proximity;
          if (distance > 0) {
            targetOffsetX = (dx / distance) * PUSH_DISTANCE * proximity;
            targetOffsetY = (dy / distance) * PUSH_DISTANCE * proximity;
          }
        }
      }

      particle.offsetX += (targetOffsetX - particle.offsetX) * LERP_FACTOR;
      particle.offsetY += (targetOffsetY - particle.offsetY) * LERP_FACTOR;
      particle.visibility +=
        (targetVisibility - particle.visibility) * LERP_FACTOR;
    }
  }

  private render(time: number, animate: boolean): void {
    const ctx = this.ctx;
    const fadeIn = animate
      ? Math.min(1, (time - this.startTime) / FADE_IN_MS)
      : 1;
    ctx.clearRect(0, 0, this.width, this.height);

    for (const particle of this.particles) {
      // Drift only applies while animating (skipped under reduced motion, same as twinkle
      // below) — otherwise the static render would place particles off their plain home
      // position with no motion to justify it.
      const driftX = animate
        ? Math.sin(time * particle.driftSpeedX + particle.driftPhaseX) *
          particle.driftAmpX
        : 0;
      const driftY = animate
        ? Math.sin(time * particle.driftSpeedY + particle.driftPhaseY) *
          particle.driftAmpY
        : 0;
      const x = particle.fx * this.width + particle.offsetX + driftX;
      const y = particle.fy * this.height + particle.offsetY + driftY;

      let alpha = particle.baseAlpha;
      if (animate) {
        const twinkle = Math.sin(
          time * particle.twinkleSpeed + particle.twinklePhase,
        );
        // Signed square sharpens the curve into quick bright flickers with longer dim rests,
        // rather than a smooth, slow back-and-forth "breathing" pulse.
        const shaped = Math.sign(twinkle) * twinkle * twinkle;
        alpha += shaped * particle.twinkleAmp;
      }
      alpha = Math.min(1, Math.max(0, alpha)) * particle.visibility * fadeIn;
      if (alpha <= 0) continue;

      // Solid fill, no gradient — a crisp dot rather than a soft blurred glow.
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private tick(time: number): void {
    this.update();
    this.render(time, true);
    this.rafId = requestAnimationFrame(this.tick);
  }
}
