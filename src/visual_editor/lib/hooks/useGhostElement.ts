import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!ghostElement) return;
    ghostElement.style.top = `${pointerY}px`;
    ghostElement.style.left = `${pointerX}px`;
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
      _ghostElement.style.top = `${pointerY}px`;
      _ghostElement.style.left = `${pointerX}px`;
      _ghostElement.style.opacity = "0.5";
      _ghostElement.style.zIndex = "2147483647";

      document.body.appendChild(_ghostElement);
      setGhostElement(_ghostElement);
    }
  }, [isEnabled, ghostElement]);
};

export default useGhostElement;
