import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/dither";
import { BeamField } from "@/components/beam-field";
import type { BeamUniforms } from "@/components/beam-field";

// The point of the mark the camera flies through: the upper counter of the "e",
// in logo units, relative to the mark's centre (272, 226.5).
const HOLE: [number, number] = [18, -88];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Where everything should be for the current scroll position. */
const target = (out: BeamUniforms, pointer: [number, number], idle: boolean) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = vw / vh;
  const coda = document.getElementById("coda");
  const hero = clamp01(window.scrollY / vh);
  const end = coda ? clamp01((vh - coda.getBoundingClientRect().top) / vh) : 0;

  // Fit the mark: 56% of the height, or narrower screens' width.
  const base = Math.min(0.56, (aspect * 0.78 * 453) / 544);
  const fly = clamp01(hero / 0.75);
  const zoom = mix(1, 14, fly * fly * fly);
  const height = mix(base * zoom, base * 0.5, end);
  // Keep the counter fixed on screen while zooming, so the camera goes through it.
  const k = height / 453;
  const toward = smooth(0.05, 0.75, hero);
  const cx = mix(0.5 - (HOLE[0] * k * toward) / aspect, 0.5, end);
  const cy = mix(0.5 + HOLE[1] * k * toward, 0.56, end);

  out.beamMark[0] = cx;
  out.beamMark[1] = cy;
  out.beamMark[2] = height;
  out.beamMark[3] = Math.max(1 - smooth(0.3, 0.62, hero), smooth(0.2, 0.9, end));
  out.beamIntensity = Math.max(1 - smooth(0.15, 0.6, hero), 0.85 * smooth(0.3, 1, end));
  out.beamAmbient = mix(0.55, 1, smooth(0.4, 1, hero));
  out.beamReveal = idle ? 0 : 1;
  out.beamLight[0] = pointer[0];
  out.beamLight[1] = pointer[1];
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

  useEffect(() => {
    const goal: BeamUniforms = structuredClone(uniforms);
    const pointer: [number, number] = [0.72, 0.72];
    let idle = true;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer[0] = event.clientX / window.innerWidth;
      pointer[1] = 1 - event.clientY / window.innerHeight;
      idle = false;
    };
    const onLeave = () => {
      idle = true;
    };

    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const tick = () => {
      target(goal, pointer, idle);
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
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [uniforms, reducedMotion]);

  return <BeamField uniforms={uniforms} className="fixed! inset-0 -z-10 h-lvh" />;
};
