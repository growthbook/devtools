import { useEffect, useState } from "react";
import { DeclarativeMutation } from "dom-mutator";
import { VisualEditorVariation } from "../../../../devtools";
import { CONTAINER_ID } from "../..";

type UseRearrangeModeHook = (args: {
  isEnabled: boolean;
  elementToBeDragged: HTMLElement | null;
  addDomMutation: (mutation: DeclarativeMutation) => void;
  removeDomMutation: (mutation: DeclarativeMutation) => void;
  variation: VisualEditorVariation | null;
  updateVariation: (updates: Partial<VisualEditorVariation>) => void;
}) => {
  elementToBeDragged: HTMLElement | null;
};

const useRearrangeMode: UseRearrangeModeHook = ({
  isEnabled,
  elementToBeDragged,
  addDomMutation,
  removeDomMutation,
  variation,
  updateVariation,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [elementDraggedTo, setElementDraggedTo] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    if (!isEnabled || !elementToBeDragged) return;

    const onPointerDown = (event: MouseEvent) => {
      const element = event.target as HTMLElement;

      // don't intercept cilcks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();

      // if the user is clicking on an already selected element, we begin dragging
      if (elementToBeDragged === element) setIsDragging(true);
    };

    const onPointerUp = (event: MouseEvent) => {
      if (elementToBeDragged && elementDraggedTo) {
        // const parentSelector = getSelector(_draggedToParent);
        // const insertBeforeSelector = _draggedToSibling
        //   ? getSelector(_draggedToSibling)
        //   : undefined;
        // const elementSelector = getSelector(_selectedElement);
        // // catch buggy behavior before happens. moving elements around with nth
        // // child selectors causes looping behavior
        // const trailingNthChildSelectorRegex = /nth-child\([\d]+\)$/;
        // if (
        //   trailingNthChildSelectorRegex.test(elementSelector) ||
        //   trailingNthChildSelectorRegex.test(insertBeforeSelector ?? "")
        // ) {
        //   alert(
        //     "The elements are too generic to define a move operation. Please increase specificity by adding an id to the elements you are either dragging or dragging next to and try again."
        //   );
        // } else {
        //   addDomMutation?.({
        //     action: "set",
        //     attribute: "position",
        //     parentSelector,
        //     insertBeforeSelector,
        //     selector: elementSelector,
        //   });
        // }
      }
      setIsDragging(false);
    };

    elementToBeDragged.style.cursor = "move";

    // TODO add DOM mutation to add unique classname to elementToBeDragged if not exists

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);

    return () => {
      elementToBeDragged.style.cursor = "";
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
    };
  }, [elementToBeDragged, isEnabled]);

  useEffect(() => {
    console.log("isDragging", isDragging);
  }, [isDragging]);

  return {
    elementToBeDragged,
  };
};

export default useRearrangeMode;
