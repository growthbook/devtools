import { useState, useEffect, useCallback } from "react";

type UseGhostElementHook = (args: {
  isEnabled: boolean;
  pointerX: number;
  pointerY: number;
  targetElement: HTMLElement | null;
}) => void;

// clone element and apply computed styles
const cloneElement = (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  const computedStyles = window.getComputedStyle(element);

  for (let i = 0; i < computedStyles.length; i++) {
    const styleProperty = computedStyles[i];
    clone.style.setProperty(
      styleProperty,
      computedStyles.getPropertyValue(styleProperty)
    );
  }

  return clone;
};

const useGhostElement: UseGhostElementHook = ({
  isEnabled,
  pointerX,
  pointerY,
  targetElement,
}) => {
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);
  const [offsetPos, setOffsetPos] = useState<{ x: number; y: number } | null>(
    null
  );

  const setElementPosition = useCallback(
    (element: HTMLElement | null, x: number, y: number) => {
      if (!targetElement || !element) return;
      if (!offsetPos) {
        const { top, left } = targetElement.getBoundingClientRect();
        setOffsetPos({
          x: x - left,
          y: y - top,
        });
        return;
      }
      element.style.top = `${y - offsetPos.y}px`;
      element.style.left = `${x - offsetPos.x}px`;
    },
    [targetElement, offsetPos]
  );

  // reset offsetPos when targetElement changes
  useEffect(() => {
    setOffsetPos(null);
  }, [targetElement]);

  useEffect(() => {
    if (!ghostElement) return;
    setElementPosition(ghostElement, pointerX, pointerY);
  }, [pointerX, pointerY]);

  useEffect(() => {
    if (!isEnabled || !targetElement) {
      if (ghostElement) {
        document.body.removeChild(ghostElement);
        setGhostElement(null);
      }
      return;
    }

    if (!ghostElement) {
      const _ghostElement = cloneElement(targetElement);

      _ghostElement.style.position = "fixed";
      _ghostElement.style.opacity = "0.5";
      _ghostElement.style.zIndex = "2147483647";
      _ghostElement.style.pointerEvents = "none";

      setElementPosition(_ghostElement, pointerX, pointerY);

      document.body.appendChild(_ghostElement);
      setGhostElement(_ghostElement);
    }
  }, [isEnabled, ghostElement]);
};

export default useGhostElement;
