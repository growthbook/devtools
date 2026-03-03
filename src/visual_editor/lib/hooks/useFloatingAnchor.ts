import { useCallback, useEffect, useState } from "react";
import { throttle } from "lodash";
import getSelector from "@/visual_editor/lib/getSelector";
import { safeQuerySelector, SelectorError } from "./useSelectorErrors";

interface UseFloatingAnchorOptions {
  onSelectorError?: (error: SelectorError) => void;
}

export default function useFloatingAnchor(
  parentElement: Element | null,
  options?: UseFloatingAnchorOptions
) {
  const [domRect, setDomRect] = useState<DOMRect | null>(null);

  const onChange = useCallback(
    throttle(() => {
      let selector = "";
      if (parentElement) selector = getSelector(parentElement);
      
      const element = safeQuerySelector(
        selector,
        options?.onSelectorError,
        "useFloatingAnchor"
      );
      const rect = element?.getBoundingClientRect();
      setDomRect(rect ?? null);
    }, 1000 / 60),
    [parentElement, setDomRect, options?.onSelectorError],
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
