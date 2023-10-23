import { DeclarativeMutation } from "dom-mutator";
import { PresenceContext } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { CONTAINER_ID } from "../..";
import getSelector from "../getSelector";
import { onDrag, teardown as draggingTeardown } from "../moveElement";
import useGhostElement from "./useGhostElement";

type UseDragAndDropHook = (args: {
  isEnabled?: boolean;
  elementToDrag: HTMLElement | null;
  addDomMutation: (mutation: DeclarativeMutation) => void;
  elementUnderEditMutations: DeclarativeMutation[];
  setDomMutations: (mutations: DeclarativeMutation[]) => void;
}) => {
  isDragging: boolean;
};

const useDragAndDrop: UseDragAndDropHook = ({
  isEnabled,
  addDomMutation,
  elementToDrag,
  elementUnderEditMutations,
  setDomMutations,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pointerXY, setPointerXY] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [dragDestination, setDragDestination] = useState<{
    parentElement: Element;
    siblingElement: Element | null;
  } | null>(null);

  // draws a ghost element that follows the cursor when dragging
  useGhostElement({
    isEnabled: isDragging,
    pointerX: pointerXY?.x,
    pointerY: pointerXY?.y,
    targetElement: elementToDrag,
  });

  const onPointerDown = useCallback(
    (event: MouseEvent) => {
      const element = event.target as HTMLElement;

      // don't intercept clicks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();

      // if the user is clicking on an already selected element, we begin dragging
      if (elementToDrag?.contains(element)) setIsDragging(true);
    },
    [elementToDrag, setIsDragging]
  );

  const onPointerUp = useCallback(
    (_event: MouseEvent) => {
      if (isDragging && elementToDrag && dragDestination) {
        const { parentElement, siblingElement } = dragDestination;
        const parentSelector = getSelector(parentElement);
        const insertBeforeSelector = siblingElement
          ? getSelector(siblingElement)
          : undefined;
        const elementSelector = getSelector(elementToDrag);

        const precedingPositionMut = elementUnderEditMutations.slice(-1)?.[0];
        if (precedingPositionMut?.attribute === "position") {
          // replace preceding position mutation with new one
          setDomMutations([
            ...elementUnderEditMutations.slice(0, -1),
            {
              action: "set",
              attribute: "position",
              parentSelector,
              insertBeforeSelector,
              selector: elementSelector,
            },
          ]);
        } else {
          addDomMutation?.({
            action: "set",
            attribute: "position",
            parentSelector,
            insertBeforeSelector,
            selector: elementSelector,
          });
        }
      }
      setIsDragging(false);
      setDragDestination(null);
      draggingTeardown();
    },
    [isDragging, elementToDrag, dragDestination, addDomMutation]
  );

  const onPointerMove = useCallback(
    (event: MouseEvent) => {
      setPointerXY({ x: event.clientX, y: event.clientY });

      if (!isDragging || !elementToDrag) return;

      const { draggedToParent, draggedToSibling } = onDrag({
        x: event.clientX,
        y: event.clientY,
        elementUnderCursor: event.target as HTMLElement,
        draggedElement: elementToDrag as Element,
      });

      if (draggedToParent)
        setDragDestination({
          parentElement: draggedToParent,
          siblingElement: draggedToSibling,
        });
    },
    [isDragging, elementToDrag, setDragDestination]
  );

  useEffect(() => {
    if (!isEnabled || !elementToDrag) return;

    elementToDrag.style.cursor = "move";
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointermove", onPointerMove, true);

    return () => {
      elementToDrag.style.cursor = "";
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointermove", onPointerMove, true);
    };
  }, [isEnabled, elementToDrag, onPointerDown, onPointerUp, onPointerMove]);

  return { isDragging };
};

export default useDragAndDrop;
