import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

/** Reactive wrapper on `(hover: hover) and (pointer: fine)` — true for mouse/trackpad, false for touch. */
export function useHoverCapable(): boolean {
  const [hoverCapable, setHoverCapable] = useState(getSnapshot);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY);
    const listener = (event: MediaQueryListEvent) =>
      setHoverCapable(event.matches);

    setHoverCapable(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);

  return hoverCapable;
}
