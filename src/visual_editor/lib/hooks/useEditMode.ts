import mutate, {
  DeclarativeMutation,
  isGlobalObserverPaused,
  pauseGlobalObserver,
  resumeGlobalObserver,
} from "dom-mutator";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { throttle } from "lodash";
import { Attribute } from "../../components/AttributeEdit";
import { CONTAINER_ID } from "../..";
import getSelector from "../getSelector";
import { VisualEditorVariation } from "../../../../devtools";

export const hoverAttributeName = "gb-edit-mode-hover";

// HTML attriibute names to ignore when editing
export const IGNORED_ATTRS = ["class", hoverAttributeName];

const clearHoverAttribute = () => {
  const hoveredElements = document.querySelectorAll(`[${hoverAttributeName}]`);
  hoveredElements.forEach((hoveredElement) => {
    hoveredElement.removeAttribute(hoverAttributeName);
  });
};

type UseEditModeHook = (args: {
  isEnabled: boolean;
  updateVariation: (updates: Partial<VisualEditorVariation>) => void;
  variation: VisualEditorVariation | null;
}) => {
  elementUnderEdit: HTMLElement | null;
  setElementUnderEdit: (element: HTMLElement | null) => void;
  clearElementUnderEdit: () => void;

  elementUnderEditSelector: string;
  elementUnderEditCopy: string;

  highlightedElement: HTMLElement | null;
  highlightedElementSelector: string;

  setInnerHTML: (html: string) => void;
  undoInnerHTMLMutations: (() => void) | undefined;

  setHTMLAttributes: (attrs: Attribute[]) => void;

  addClassNames: (classNames: string) => void;
  removeClassNames: (classNames: string) => void;

  setCSS: (css: string) => void;

  elementUnderEditMutations: DeclarativeMutation[];
  addDomMutation: (mutation: DeclarativeMutation) => void;
  removeDomMutation: (mutation: DeclarativeMutation) => void;
  setDomMutations: (mutations: DeclarativeMutation[]) => void;

  ignoreClassNames: boolean;
  setIgnoreClassNames: (ignore: boolean) => void;
  stopInlineEditing: () => void;
  resetAndStopInlineEditing: () => void;
  isInlineEditing: boolean;
};

/**
 * This hook is responsible for managing the edit mode state. It exposes
 * the currently selected element, the highlighted element, and  a number
 * of functions that can be used to mutate the DOM.
 */
const useEditMode: UseEditModeHook = ({
  isEnabled,
  variation,
  updateVariation,
}) => {
  const [elementUnderEdit, setElementUnderEdit] = useState<HTMLElement | null>(
    null,
  );
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [ignoreClassNames, setIgnoreClassNames] = useState(false);
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const clearElementUnderEdit = useCallback(
    () => setElementUnderEdit(null),
    [setElementUnderEdit],
  );
  const elementUnderEditSelector = useMemo(
    () =>
      elementUnderEdit
        ? getSelector(elementUnderEdit, {
            ignoreClassNames,
          })
        : "",
    [elementUnderEdit, ignoreClassNames],
  );
  const highlightedElementSelector = useMemo(
    () =>
      highlightedElement
        ? getSelector(highlightedElement, {
            ignoreClassNames,
          })
        : "",
    [highlightedElement, ignoreClassNames],
  );

  const elementUnderEditCopy = useMemo(() => {
    if (!elementUnderEdit) {
      return "";
    }
    // ignore when selected is simply wrapper of another element
    if (elementUnderEdit.innerHTML.startsWith("<")) return "";
    // hard-limit on text length
    if (elementUnderEdit.innerHTML.length > 800) return "";
    const parser = new DOMParser();
    const parsed = parser.parseFromString(
      elementUnderEdit.innerHTML,
      "text/html",
    );
    const text = parsed.body.textContent || "";
    return text.trim();
  }, [elementUnderEdit, variation]);

  const elementUnderEditHTML = useMemo(() => {
    if (!elementUnderEdit) {
      return "";
    }
    // ignore when selected is simply wrapper of another element
    if (elementUnderEdit.innerHTML.startsWith("<")) return "";
    // hard-limit on text length
    if (elementUnderEdit.innerHTML.length > 800) return "";

    return elementUnderEdit.innerHTML;
  }, [elementUnderEdit, variation]);

  const addDomMutations = useCallback(
    (domMutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      const newDomMutations = [...variation.domMutations, ...domMutations];
      updateVariation({
        domMutations: newDomMutations,
      });
      setHighlightedElement(null);
    },
    [variation, updateVariation],
  );

  const addDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      addDomMutations([domMutation]);
    },
    [addDomMutations],
  );

  const removeDomMutations = useCallback(
    (mutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      const newDomMutations = variation.domMutations.filter(
        (m) => !mutations.includes(m),
      );
      updateVariation({
        domMutations: newDomMutations,
      });
    },
    [updateVariation, variation],
  );

  const setDomMutations = useCallback(
    (mutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      updateVariation({
        domMutations: mutations,
      });
    },

    [updateVariation, variation],
  );

  const setInnerHTML = useCallback(
    (html: string) => {
      if (!elementUnderEdit) return;
      if (variation?.domMutations.length === 0) {
        elementUnderEdit.innerHTML = elementUnderEditHTML;
      }
      addDomMutations([
        {
          action: "set",
          attribute: "html",
          value: html,
          selector: elementUnderEditSelector,
        },
      ]);
    },
    [elementUnderEditSelector, addDomMutations],
  );

  const undoInnerHTMLMutations = useMemo(() => {
    const htmlMutations = (variation?.domMutations ?? []).filter(
      (mutation) =>
        mutation.attribute === "html" &&
        mutation.selector === elementUnderEditSelector,
    );
    if (htmlMutations.length === 0) return;
    return () => {
      removeDomMutations(htmlMutations);
    };
  }, [variation, elementUnderEditSelector, removeDomMutations]);

  const setHTMLAttributes = useCallback(
    (attrs: Attribute[]) => {
      if (!elementUnderEdit) return;
      const existing = [...elementUnderEdit.attributes];
      const removed = existing.filter(
        (e) =>
          !attrs.find((a) => a.name === e.name) &&
          !IGNORED_ATTRS.includes(e.name),
      );
      const changed = attrs.filter(
        (attr) => attr.value !== elementUnderEdit.getAttribute(attr.name),
      );
      removed.forEach((attr) => {
        addDomMutations([
          {
            action: "remove",
            attribute: attr.name,
            selector: elementUnderEditSelector,
            value: attr.value,
          },
        ]);
      });
      changed.forEach((attr) => {
        addDomMutations([
          {
            action: elementUnderEdit.hasAttribute(attr.name) ? "set" : "append",
            attribute: attr.name,
            selector: elementUnderEditSelector,
            value: attr.value,
          },
        ]);
      });
    },
    [elementUnderEdit, addDomMutations, elementUnderEditSelector],
  );

  const addClassNames = useCallback(
    (classNames: string) => {
      if (!elementUnderEditSelector) return;
      addDomMutations(
        classNames.split(" ").map((className) => ({
          action: "append",
          attribute: "class",
          value: className,
          selector: elementUnderEditSelector,
        })),
      );
    },
    [elementUnderEditSelector, addDomMutations],
  );

  const removeClassNames = useCallback(
    (classNames: string) => {
      if (!elementUnderEditSelector) return;
      addDomMutations([
        {
          action: "remove",
          attribute: "class",
          value: classNames,
          selector: elementUnderEditSelector,
        },
      ]);
    },
    [elementUnderEditSelector, addDomMutations],
  );

  const setCSS = useCallback(
    (css: string) => {
      if (!elementUnderEditSelector) return;
      addDomMutations([
        {
          action: "set",
          attribute: "style",
          value: css,
          selector: elementUnderEditSelector,
        },
      ]);
    },
    [elementUnderEditSelector, addDomMutations],
  );

  const elementUnderEditMutations = useMemo(
    () =>
      variation?.domMutations.filter((m) =>
        elementUnderEdit && elementUnderEditSelector
          ? m.selector === elementUnderEditSelector
          : true,
      ) ?? [],
    [elementUnderEdit, variation, elementUnderEditSelector],
  );

  const removeDomMutation = useCallback(
    (mutation: DeclarativeMutation) => {
      removeDomMutations([mutation]);
    },
    [removeDomMutations],
  );

  // upon every DOM mutation, we revert all changes and replay them to ensure
  // that the DOM is in the correct state
  const mutateRevert = useRef<(() => void) | null>(null);

  const runMutations = (
    domMutations?: VisualEditorVariation["domMutations"],
  ) => {
    // run reverts if they exist
    if (!isGlobalObserverPaused()) {
      if (mutateRevert?.current) mutateRevert.current();
    }
    const revertCallbacks: Array<() => void> = [];
    const stopCallbacks: Array<() => void> = [];
    domMutations?.forEach((mutation) => {
      const controller = mutate.declarative(mutation);
      revertCallbacks.push(controller.revert);
    });
    if (!isGlobalObserverPaused()) {
      mutateRevert.current = () => {
        revertCallbacks.reverse().forEach((c) => c());
      };
    }
  };

  useEffect(() => {
    runMutations(variation?.domMutations);
  }, [variation]);

  const hasTextInChildren = (element: Element) => {
    for (let child of element.children) {
      // Trim the child element's text content
      let isValid = !!child?.textContent?.trim();
      // make carve out for the case where the child is a span or a or b or i or u
      if (["span", "b", "i", "u", "a"].includes(element.tagName.toLowerCase()))
        isValid = true;

      if (!isValid || hasTextInChildren(child)) {
        return true;
      }
      return false;
    }
  };
  const clearInlineEditAttributes = () => {
    const inlineEditElements = document.querySelectorAll(
      `[canInlineEdit], [contenteditable]`,
    );
    inlineEditElements.forEach((element) => {
      element.removeAttribute("canInlineEdit");
      element.removeAttribute("contenteditable");
    });
  };

  const resetAndStopInlineEditing = () => {
    resumeGlobalObserver();
    if (variation?.domMutations.length === 0 && elementUnderEdit) {
      elementUnderEdit.innerHTML = elementUnderEditHTML;
    }

    runMutations(variation?.domMutations);

    if (!elementUnderEdit) return;
    elementUnderEdit.removeAttribute("contenteditable");
    elementUnderEdit.removeEventListener("keydown", setInnerHTMLOnInlineEdit);
    if (!isInlineEditing) {
      clearInlineEditAttributes();
      setElementUnderEdit(null);
    }
    setIsInlineEditing(false);
  };

  const stopInlineEditing = () => {
    if (!elementUnderEdit) return;
    clearInlineEditAttributes();
    const html = elementUnderEdit.innerHTML;
    if (html !== elementUnderEditHTML && isInlineEditing) {
      clearInlineEditAttributes();
      setInnerHTML(html);
    }
    elementUnderEdit.setAttribute("canInlineEdit", "true");
    resumeGlobalObserver();
    elementUnderEdit.removeEventListener("keydown", () => {});
    // we need to reset if it is not inline editing
    if (!isInlineEditing) {
      setElementUnderEdit(null);
    }
    setIsInlineEditing(false);
  };

  const setInnerHTMLOnInlineEdit = (event: KeyboardEvent) => {
    if (!elementUnderEdit) return;
    if (event.key === "Enter") {
      event.preventDefault();
      stopInlineEditing();
      return;
    }
    if (event.key === "Escape") {
      resetAndStopInlineEditing();
      return;
    }
  };
  // checking to see if element can be inline edited
  // make a allow list of elements that can be inline edited
  // allow anything that is span or b or i or u or a
  const canInlineEditElement = (element: Element) => {
    let isValid = !!element?.textContent?.trim();
    // if the element is empty and has no children, we can't inline edit it
    if (element?.textContent?.trim() === "") isValid = true;
    return isValid && !hasTextInChildren(element);
  };

  // event handlers
  useEffect(() => {
    if (!isEnabled) return;
    const setInlineEditOnElement = (element: HTMLElement | null) => {
      if (!element) return;
      const canInlineEdit = canInlineEditElement(element);

      if (canInlineEdit) {
        setIsInlineEditing(true);
        document.removeEventListener("click", clickHandler, true);
        document.removeEventListener("pointermove", onPointerMove, true);
        document.removeEventListener("pointerdown", onPointerDown, true);
        pauseGlobalObserver();
        element.setAttribute("contenteditable", "true");
        element.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        elementUnderEdit?.addEventListener(
          "keydown",
          setInnerHTMLOnInlineEdit,
          false,
        );
      } else {
        setIsInlineEditing(false);
      }
    };
    const onPointerMove = throttle((event: MouseEvent) => {
      if (elementUnderEdit) return;
      const { clientX: x, clientY: y } = event;
      const domNode = document.elementFromPoint(x, y);
      // return early if we are over the visual editor itself (e.g. frame)
      if (domNode?.id === CONTAINER_ID) {
        clearHoverAttribute();
        setHighlightedElement(null);
        return;
      }

      // if already hovered, return early
      if (!domNode || domNode.hasAttribute(hoverAttributeName)) return;

      clearHoverAttribute();
      domNode.setAttribute(hoverAttributeName, "");
      setHighlightedElement(domNode as HTMLElement);
    }, 50);

    const onPointerDown = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (elementUnderEdit) return;
      if (elementUnderEdit === element) return;

      // don't intercept cilcks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();
    };
    const setCursorForInlineEditing = (element: HTMLElement) => {
      if (!element) return;
      const canInlineEdit = canInlineEditElement(element);
      if (canInlineEdit) {
        element.setAttribute("canInlineEdit", "true");
      }
    };

    const clickHandler = (event: MouseEvent) => {
      if (event.detail === 1) {
        const element = event.target as HTMLElement;
        if (isInlineEditing) return;
        // don't intercept cilcks on the visual editor itself
        if (element.id === CONTAINER_ID) return;

        //need to set inline editing true before setting element under edit if it is not inline editing we revert the changes
        if (!elementUnderEdit) {
          setElementUnderEdit(element);
        }
        // we want to set the element inline edit on the second click
        setCursorForInlineEditing(element);
        // we know that if you click anywhere else you want to stop inline editing
        if (elementUnderEdit) {
          setInlineEditOnElement(elementUnderEdit);
        }
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("click", clickHandler, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      clearHoverAttribute();
      setHighlightedElement(null);
      document.removeEventListener("click", clickHandler, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [isEnabled, elementUnderEdit, isInlineEditing]);

  return {
    elementUnderEdit,
    setElementUnderEdit,
    clearElementUnderEdit,
    elementUnderEditSelector,
    elementUnderEditCopy,
    highlightedElement,
    highlightedElementSelector,
    setInnerHTML,
    undoInnerHTMLMutations,
    setHTMLAttributes,
    addClassNames,
    removeClassNames,
    setCSS,
    elementUnderEditMutations,
    removeDomMutation,
    addDomMutation,
    setDomMutations,
    ignoreClassNames,
    setIgnoreClassNames,
    stopInlineEditing,
    resetAndStopInlineEditing,
    isInlineEditing,
  };
};

export default useEditMode;
