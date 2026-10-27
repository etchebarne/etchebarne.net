import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/dither";
import { BeamField } from "@/components/beam-field";
import type { BeamUniforms } from "@/components/beam-field";

// The point of the mark the camera flies through: the upper counter of the "e",
// in logo units, relative to the mark's centre (272, 226.5).
const HOLE: [number, number] = [18, -88];
// The mark's visual centre: its area centroid sits left of and above the
// bounding box's centre, since the bowl carries the weight and it opens to the
// right. This is the box centre minus the centroid, in logo units (y down).
const OPTICAL: [number, number] = [12.5, 5.1];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * Where everything should be for the current scroll position. The canvas is
 * as tall as the large viewport (`lvh`), so on phones it runs under the
 * browser's toolbar; the mark is placed in the visible part of it instead.
 */
const target = (out: BeamUniforms, pointer: [number, number], idle: boolean, canvasHeight: number) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const ch = Math.max(canvasHeight, vh);
  const aspect = vw / ch;
  // The visible viewport's centre, and its height, in canvas uv (y up).
  const middle = 1 - vh / 2 / ch;
  const visible = vh / ch;
  const coda = document.getElementById("coda");
  const hero = clamp01(window.scrollY / vh);
  const end = coda ? clamp01((vh - coda.getBoundingClientRect().top) / vh) : 0;

  // Fit the mark: 56% of the height, or narrower screens' width.
  const base = Math.min(0.56 * visible, (aspect * 0.78 * 453) / 544);
  const fly = clamp01(hero / 0.75);
  const zoom = mix(1, 14, fly * fly * fly);
  const height = mix(base * zoom, base * 0.5, end);
  // Rest on the optical centre; while zooming, bring the counter to the
  // middle so the camera goes through it.
  const k = height / 453;
  const toward = smooth(0.05, 0.75, hero);
  const offX = mix(OPTICAL[0], -HOLE[0], toward);
  const offY = mix(OPTICAL[1], -HOLE[1], toward);
  const cx = mix(0.5 + (offX * k) / aspect, 0.5 + (OPTICAL[0] * k) / aspect, end);
  const cy = mix(middle - offY * k, middle + 0.06 * visible - OPTICAL[1] * k, end);

  out.beamMark[0] = cx;
  out.beamMark[1] = cy;
  out.beamMark[2] = height;
  out.beamMark[3] = Math.max(1 - smooth(0.3, 0.62, hero), smooth(0.2, 0.9, end));
  out.beamIntensity = Math.max(1 - smooth(0.15, 0.6, hero), 0.85 * smooth(0.3, 1, end));
  out.beamAmbient = mix(0.55, 1, smooth(0.4, 1, hero));
  out.beamReveal = idle ? 0 : 1;
  out.beamLight[0] = pointer[0];
  out.beamLight[1] = 1 - (1 - pointer[1]) * visible;
};

/**
 * One dithered field fixed behind the whole page. Scroll drives the mark
 * (zoom through it, then it reassembles at the end), the pointer drives the
 * light. Uniforms are mutated in place, so nothing re-renders per frame.
 */
export const Stage = () => {
  const [uniforms] = useState<BeamUniforms>(() => ({
    beamMark: [0.5, 0.5, 0.56, 1],
    beamLight: [0.72, 0.72],
    beamIntensity: 1,
    beamAmbient: 0.55,
    beamReveal: 0,
  }));
  const reducedMotion = usePrefersReducedMotion();
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const goal: BeamUniforms = structuredClone(uniforms);
    const pointer: [number, number] = [0.72, 0.72];
    let idle = true;
    let frame = 0;

    // Pointer in viewport uv (y up). A mouse lights wherever it goes; on
    // touch screens the light drifts on its own and a finger steers it.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let touching = false;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !touching) return;
      pointer[0] = event.clientX / window.innerWidth;
      pointer[1] = 1 - event.clientY / window.innerHeight;
      idle = false;
    };
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      touching = true;
      onMove(event);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      touching = false;
      idle = true;
    };
    const onLeave = () => {
      idle = true;
    };

    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const start = performance.now();
    const tick = () => {
      if (coarse && !touching && !reducedMotion) {
        // A slow orbit around the mark, so its shading never sits still.
        const t = (performance.now() - start) / 1000;
        pointer[0] = 0.5 + 0.32 * Math.cos(t * 0.35);
        pointer[1] = 0.55 + 0.22 * Math.sin(t * 0.35);
      }
      target(goal, pointer, idle, canvas.current?.clientHeight ?? window.innerHeight);
      // The hero copy clears out before the camera flies through the mark.
      if (heroCopy) heroCopy.style.opacity = String(1 - smooth(0.02, 0.22, window.scrollY / window.innerHeight));
      // Light and reveal ease; scroll-linked values follow closely so the
      // mark never lags behind the page.
      const ease = reducedMotion ? 1 : 0.12;
      const follow = reducedMotion ? 1 : 0.35;
      for (let i = 0; i < 4; i++) {
        uniforms.beamMark[i] += (goal.beamMark[i] - uniforms.beamMark[i]) * follow;
      }
      uniforms.beamLight[0] += (goal.beamLight[0] - uniforms.beamLight[0]) * ease;
      uniforms.beamLight[1] += (goal.beamLight[1] - uniforms.beamLight[1]) * ease;
      uniforms.beamIntensity += (goal.beamIntensity - uniforms.beamIntensity) * follow;
      uniforms.beamAmbient += (goal.beamAmbient - uniforms.beamAmbient) * follow;
      uniforms.beamReveal += (goal.beamReveal - uniforms.beamReveal) * ease;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [uniforms, reducedMotion]);

  return <BeamField ref={canvas} uniforms={uniforms} className="fixed! inset-0 -z-10 h-lvh" />;
};
