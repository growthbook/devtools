import { useCallback, useEffect, useState } from "react";
import { throttle } from "lodash";

export default function useFloatingAnchor(parentElement: Element | null) {
  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  const onChange = useCallback(
    throttle(() => {
      const rect = parentElement?.getBoundingClientRect();
      setDomRect(rect ?? null);
    }, 1000 / 60),
    [parentElement, setDomRect]
  );

  useEffect(() => {
    if (!parentElement && domRect) setDomRect(null);
    if (!parentElement) return;

    onChange();

    window.addEventListener("scroll", onChange);
    window.addEventListener("resize", onChange);

    const observer = new MutationObserver(onChange);
    observer.observe(parentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      observer.disconnect();
    };
  }, [setDomRect, parentElement, onChange]);

  return domRect;
}
