import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

/** Reactive wrapper on `prefers-reduced-motion`. Re-renders on OS-level changes. */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(getSnapshot);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    const listener = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);

    setReducedMotion(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);

  return reducedMotion;
}
