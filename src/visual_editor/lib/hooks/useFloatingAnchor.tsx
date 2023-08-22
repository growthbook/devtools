import { useCallback, useEffect, useState } from "react";
import { throttle } from "lodash";

// TODO watch for window resize events!!!!!!
// TODO resize on element resize as well (e.g. when element becomes bigger from content change)
export default function useFloatingAnchor(parentElement: Element | null) {
  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  const onScroll = useCallback(
    throttle(() => {
      const rect = parentElement?.getBoundingClientRect();
      setDomRect(rect ?? null);
    }, 1000 / 60),
    [parentElement, setDomRect]
  );

  useEffect(() => {
    if (!parentElement && domRect) setDomRect(null);

    if (parentElement) {
      onScroll();
      window.addEventListener("scroll", onScroll);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [setDomRect, parentElement, onScroll]);

  return domRect;
}
