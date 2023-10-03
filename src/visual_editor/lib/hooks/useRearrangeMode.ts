import { useCallback, useEffect, useState } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { nanoid } from "nanoid";
import { CONTAINER_ID } from "../..";
import { onDrag, teardown as draggingTeardown } from "../moveElement";
import getSelector from "../getSelector";
import useGhostElement from "./useGhostElement";

export const REARRANGE_CLASSNAME_PREFIX = "rearrange-mode-tag-";

type UseRearrangeModeHook = (args: {
  isEnabled: boolean;
  elementToBeDragged: HTMLElement | null;
  mutations: DeclarativeMutation[];
  addClassNames: (classNames: string) => void;
  addDomMutation: (mutation: DeclarativeMutation) => void;
  removeDomMutation: (mutation: DeclarativeMutation) => void;
}) => {
  elementToBeDragged: HTMLElement | null;
};

// TODO
// - ensure drag and drop border moves  with scroll / resize
const useRearrangeMode: UseRearrangeModeHook = ({
  isEnabled,
  elementToBeDragged,
  mutations,
  addClassNames,
  addDomMutation,
  removeDomMutation,
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

  // TODO
  // - ensure these dom mutations are marked as hidden
  // - ensure we actually hide these dom mutations
  // - ensure we clean up classnames when drag and drop mutation is deleted
  const ensureClassNameTag = useCallback(() => {
    const hasTag = mutations.some(
      (m) =>
        m.attribute === "class" &&
        m.value?.startsWith(REARRANGE_CLASSNAME_PREFIX)
    );
    if (hasTag) return;
    addClassNames(`${REARRANGE_CLASSNAME_PREFIX}${nanoid(10)}`);
  }, [addClassNames, mutations]);

  // if there are no position mutations, we can remove the tag
  const cleanUpClassNameTag = useCallback(() => {
    const hasPositionMutation = mutations.some(
      (m) => m.attribute === "position"
    );
    if (hasPositionMutation) return;
    mutations
      .filter(
        (m) =>
          m.attribute === "class" &&
          m.value?.startsWith(REARRANGE_CLASSNAME_PREFIX)
      )
      .forEach(removeDomMutation);
  }, [mutations, removeDomMutation]);

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

  // manage the classname tag we use to identify elements that are being dragged
  // useEffect(() => {
  //   // if (isEnabled) ensureClassNameTag();
  //   // else cleanUpClassNameTag();
  // }, [isEnabled, mutations]);

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
  }, [
    elementToBeDragged,
    elementDraggedTo,
    isEnabled,
    isDragging,
    ensureClassNameTag,
    cleanUpClassNameTag,
  ]);

  return { elementToBeDragged };
};

export default useRearrangeMode;
