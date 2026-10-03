"use client";

import { useEffect, useState, type RefObject } from "react";

/** One motion preference controls the canvas, transitions, and decorative loops. */
export function useMotion() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return { paused, toggle: () => setPaused((value) => !value) };
}

/** Intersection observers avoid a scroll listener for every animated section. */
export function useReveals(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const elements =
      root.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elements || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );

    elements.forEach((element) => {
      // Content already on screen is never hidden while hydration completes.
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.classList.add("is-visible");
      } else {
        element.classList.add("will-reveal");
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, [root]);
}
