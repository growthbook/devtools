import { useCallback, useEffect, useState } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { CONTAINER_ID } from "../..";
import { onDrag, teardown as draggingTeardown } from "../moveElement";
import getSelector from "../getSelector";
import useGhostElement from "./useGhostElement";

export const REARRANGE_CLASSNAME_PREFIX = "rearrange-mode-tag-";

type UseRearrangeModeHook = (args: {
  isEnabled: boolean;
  elementToBeDragged: HTMLElement | null;
  addDomMutation: (mutation: DeclarativeMutation) => void;
}) => {
  elementToBeDragged: HTMLElement | null;
};

// TODO
// - ensure drag and drop border moves  with scroll / resize
const useRearrangeMode: UseRearrangeModeHook = ({
  isEnabled,
  elementToBeDragged,
  addDomMutation,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pointerXY, setPointerXY] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [elementDraggedTo, setElementDraggedTo] = useState<Element | null>(
    null
  );
  const [elementDraggedToSibling, setElementDraggedToSibling] =
    useState<Element | null>(null);

  // draws a ghost element that follows the cursor when dragging
  useGhostElement({
    isEnabled: isDragging,
    pointerX: pointerXY?.x,
    pointerY: pointerXY?.y,
    targetElement: elementToBeDragged,
  });

  const onPointerDown = useCallback(
    (event: MouseEvent) => {
      const element = event.target as HTMLElement;

      // don't intercept clicks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();

      // if the user is clicking on an already selected element, we begin dragging
      if (elementToBeDragged?.contains(element)) setIsDragging(true);
    },
    [elementToBeDragged, setIsDragging]
  );

  const onPointerUp = useCallback(
    (_event: MouseEvent) => {
      if (isDragging && elementToBeDragged && elementDraggedTo) {
        const parentSelector = getSelector(elementDraggedTo);
        const insertBeforeSelector = elementDraggedToSibling
          ? getSelector(elementDraggedToSibling)
          : undefined;
        const elementSelector = getSelector(elementToBeDragged);

        addDomMutation?.({
          action: "set",
          attribute: "position",
          parentSelector,
          insertBeforeSelector,
          selector: elementSelector,
        });
      }
      setIsDragging(false);
      draggingTeardown();
    },
    [
      isDragging,
      elementToBeDragged,
      elementDraggedTo,
      elementDraggedToSibling,
      addDomMutation,
    ]
  );

  const onPointerMove = useCallback(
    (event: MouseEvent) => {
      setPointerXY({ x: event.clientX, y: event.clientY });

      if (!isDragging) return;

      const { draggedToParent, draggedToSibling } = onDrag({
        x: event.clientX,
        y: event.clientY,
        elementUnderCursor: event.target as HTMLElement,
        draggedElement: elementToBeDragged as Element,
      });

      setElementDraggedTo(draggedToParent);
      setElementDraggedToSibling(draggedToSibling);
    },
    [
      isDragging,
      elementToBeDragged,
      setElementDraggedTo,
      setElementDraggedToSibling,
    ]
  );

  // manage the drag and drop event listeners
  useEffect(() => {
    if (!isEnabled || !elementToBeDragged) return;

    elementToBeDragged.style.cursor = "move";

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointermove", onPointerMove, true);

    return () => {
      elementToBeDragged.style.cursor = "";
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointermove", onPointerMove, true);
    };
  }, [elementToBeDragged, elementDraggedTo, isEnabled, isDragging]);

  return { elementToBeDragged };
};

export default useRearrangeMode;
