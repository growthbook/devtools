import mutate, { DeclarativeMutation } from "dom-mutator";
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
    null
  );
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const clearElementUnderEdit = useCallback(
    () => setElementUnderEdit(null),
    [setElementUnderEdit]
  );
  const elementUnderEditSelector = useMemo(
    () => (elementUnderEdit ? getSelector(elementUnderEdit) : ""),
    [elementUnderEdit]
  );
  const highlightedElementSelector = useMemo(
    () => (highlightedElement ? getSelector(highlightedElement) : ""),
    [highlightedElement]
  );
  const elementUnderEditCopy = useMemo(() => {
    if (!elementUnderEdit) return "";
    // ignore when selected is simply wrapper of another element
    if (elementUnderEdit.innerHTML.startsWith("<")) return "";
    // hard-limit on text length
    if (elementUnderEdit.innerHTML.length > 800) return "";
    const parser = new DOMParser();
    const parsed = parser.parseFromString(
      elementUnderEdit.innerHTML,
      "text/html"
    );
    const text = parsed.body.textContent || "";
    return text.trim();
  }, [elementUnderEdit]);

  const addDomMutations = useCallback(
    (domMutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      updateVariation({
        domMutations: [...variation.domMutations, ...domMutations],
      });
      setHighlightedElement(null);
    },
    [variation, updateVariation]
  );

  const addDomMutation = useCallback(
    (domMutation: DeclarativeMutation) => {
      addDomMutations([domMutation]);
    },
    [addDomMutations]
  );

  const removeDomMutations = useCallback(
    (mutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      updateVariation({
        domMutations: variation.domMutations.filter(
          (m) => !mutations.includes(m)
        ),
      });
    },
    [updateVariation, variation]
  );

  const setDomMutations = useCallback(
    (mutations: DeclarativeMutation[]) => {
      if (!variation || !updateVariation) return;
      updateVariation({
        domMutations: mutations,
      });
    },

    [updateVariation, variation]
  );

  const setInnerHTML = useCallback(
    (html: string) => {
      addDomMutations([
        {
          action: "set",
          attribute: "html",
          value: html,
          selector: elementUnderEditSelector,
        },
      ]);
    },
    [elementUnderEditSelector, addDomMutations]
  );

  const undoInnerHTMLMutations = useMemo(() => {
    const htmlMutations = (variation?.domMutations ?? []).filter(
      (mutation) =>
        mutation.attribute === "html" &&
        mutation.selector === elementUnderEditSelector
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
          !IGNORED_ATTRS.includes(e.name)
      );
      const changed = attrs.filter(
        (attr) => attr.value !== elementUnderEdit.getAttribute(attr.name)
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
    [elementUnderEdit, addDomMutations]
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
        }))
      );
    },
    [elementUnderEditSelector, addDomMutations]
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
    [elementUnderEditSelector, addDomMutations]
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
    [elementUnderEditSelector, addDomMutations]
  );

  const elementUnderEditMutations = useMemo(
    () =>
      variation?.domMutations.filter((m) =>
        elementUnderEdit && elementUnderEditSelector
          ? m.selector === elementUnderEditSelector
          : true
      ) ?? [],
    [elementUnderEdit, variation, elementUnderEditSelector]
  );

  const removeDomMutation = useCallback(
    (mutation: DeclarativeMutation) => {
      removeDomMutations([mutation]);
    },
    [removeDomMutations]
  );

  // upon every DOM mutation, we revert all changes and replay them to ensure
  // that the DOM is in the correct state
  const mutateRevert = useRef<(() => void) | null>(null);
  useEffect(() => {
    // run reverts if they exist
    if (mutateRevert?.current) mutateRevert.current();

    const revertCallbacks: Array<() => void> = [];

    variation?.domMutations.forEach((mutation) => {
      const controller = mutate.declarative(mutation);
      revertCallbacks.push(controller.revert);
    });

    mutateRevert.current = () => {
      revertCallbacks.reverse().forEach((c) => c());
    };
  }, [variation]);

  // event handlers
  useEffect(() => {
    if (!isEnabled) return;

    const onPointerMove = throttle((event: MouseEvent) => {
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

      // don't intercept cilcks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();

      setElementUnderEdit(element);
    };

    const clickHandler = (event: MouseEvent) => {
      const element = event.target as HTMLElement;

      // don't intercept cilcks on the visual editor itself
      if (element.id === CONTAINER_ID) return;

      event.preventDefault();
      event.stopPropagation();
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
  }, [isEnabled, elementUnderEdit]);

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
  };
};

export default useEditMode;
