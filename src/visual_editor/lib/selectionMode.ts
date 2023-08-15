import { finder } from "@medv/finder";
import { DeclarativeMutation } from "dom-mutator";
import { throttle } from "lodash";
import { CONTAINER_ID } from "..";
import { onDrag, teardown as moveElementTeardown } from "./moveElement";
import getSelector from "./getSelector";

export const hoverAttributeName = "gb-selection-mode-hover";
export const selectedAttributeName = "gb-selection-mode-selected";

// state vars
let _selectedElement: HTMLElement | null;
let _setSelectedElement: ((element: HTMLElement | null) => void) | null;
let _setHighlightedElementSelector: ((selector: string) => void) | null;
let _prevDomNode: Element | null = null;
let _isDragging: boolean = false;
let _addDomMutation: ((mutation: DeclarativeMutation) => void) | null = null;

const clearSelectedElementAttr = () => {
  const selected = document.querySelectorAll(`[${selectedAttributeName}]`)?.[0];
  selected?.removeAttribute(selectedAttributeName);
};

const clearHoverAttribute = () => {
  const hoveredElements = document.querySelectorAll(`[${hoverAttributeName}]`);
  hoveredElements.forEach((hoveredElement) => {
    hoveredElement.removeAttribute(hoverAttributeName);
  });
};

let _draggedToParent: Element | null = null;
let _draggedToSibling: Element | null = null;
const pointerMoveHandler = throttle((event: MouseEvent) => {
  console.log("pointerMoveHandler");
  const { clientX: x, clientY: y } = event;
  const domNode = document.elementFromPoint(x, y);
  // return prevNode if current node is our frame component
  if (domNode?.hasAttribute("gb-highlight-frame")) return;

  if (_isDragging && _selectedElement) {
    ({
      draggedToParent: _draggedToParent,
      draggedToSibling: _draggedToSibling,
    } = onDrag({
      x,
      y,
      elementUnderCursor: domNode,
      draggedElement: _selectedElement,
    }));
  } else {
    if (!domNode || domNode === _prevDomNode) return;

    clearHoverAttribute();
    domNode.setAttribute(hoverAttributeName, "");
    _prevDomNode = domNode;
    // use default finder since this is for display only
    _setHighlightedElementSelector?.(finder(domNode));
  }
}, 50);

// only the 'click' event can prevent the default behavior when clicking on
// a link or button or similar
const clickHandler = (event: MouseEvent) => {
  const element = event.target as HTMLElement;

  // don't intercept cilcks on the visual editor itself
  if (element.id === CONTAINER_ID) return;

  event.preventDefault();
  event.stopPropagation();
};

const dragElementTeardown = () => {
  moveElementTeardown();
  _isDragging = false;
  _draggedToParent = null;
  _draggedToSibling = null;
};

// on mouse up, we stop dragging if applicable
const pointerUpHandler = () => {
  // if we are finished dragging, create mutation
  if (_selectedElement && _draggedToParent) {
    const parentSelector = getSelector(_draggedToParent);
    const insertBeforeSelector = _draggedToSibling
      ? getSelector(_draggedToSibling)
      : undefined;
    const elementSelector = getSelector(_selectedElement);

    // catch buggy behavior before happens. moving elements around with nth
    // child selectors causes looping behavior
    const trailingNthChildSelectorRegex = /nth-child\([\d]+\)$/;
    if (
      trailingNthChildSelectorRegex.test(elementSelector) ||
      trailingNthChildSelectorRegex.test(insertBeforeSelector ?? "")
    ) {
      alert(
        "The elements are too generic to define a move operation. Please increase specificity by adding an id to the elements you are either dragging or dragging next to and try again."
      );
    } else {
      _addDomMutation?.({
        action: "set",
        attribute: "position",
        parentSelector,
        insertBeforeSelector,
        selector: elementSelector,
      });
    }

    dragElementTeardown();
  }
};

const pointerDownHandler = (event: MouseEvent) => {
  const element = event.target as HTMLElement;

  // don't intercept cilcks on the visual editor itself
  if (element.id === CONTAINER_ID) return;

  event.preventDefault();
  event.stopPropagation();

  // if the user is clicking on an already selected element, we begin dragging
  if (_selectedElement === element) {
    _isDragging = true;
  } else {
    _setSelectedElement?.(element);
    dragElementTeardown();
  }
};

const teardown = () => {
  _selectedElement = null;
  _setSelectedElement = null;
  clearHoverAttribute();
  clearSelectedElementAttr();
  dragElementTeardown();
  document.removeEventListener("click", clickHandler, true);
  document.removeEventListener("pointermove", pointerMoveHandler, true);
  document.removeEventListener("pointerup", pointerUpHandler, true);
  document.removeEventListener("pointerdown", pointerDownHandler, true);
};

// called by react component - on update
export const onSelectionModeUpdate = ({
  selectedElement,
  setSelectedElement,
  setHighlightedElementSelector,
  addDomMutation,
}: {
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
  setHighlightedElementSelector: (selector: string) => void;
  addDomMutation: (mutation: DeclarativeMutation) => void;
}) => {
  _selectedElement = selectedElement;
  _setSelectedElement = setSelectedElement;
  _setHighlightedElementSelector = setHighlightedElementSelector;
  _addDomMutation = addDomMutation;

  clearSelectedElementAttr();
  clearHoverAttribute();

  if (_selectedElement) {
    _selectedElement.setAttribute(selectedAttributeName, "");
  }
};

// called by react component - on init
export const toggleSelectionMode = ({
  isEnabled,
  selectedElement,
  setSelectedElement,
  setHighlightedElementSelector,
  addDomMutation,
}: {
  isEnabled: boolean;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
  setHighlightedElementSelector: (selector: string) => void;
  addDomMutation: (mutation: DeclarativeMutation) => void;
}) => {
  if (isEnabled) {
    document.addEventListener("click", clickHandler, true);
    document.addEventListener("pointermove", pointerMoveHandler, true);
    document.addEventListener("pointerup", pointerUpHandler, true);
    document.addEventListener("pointerdown", pointerDownHandler, true);

    onSelectionModeUpdate({
      selectedElement,
      setSelectedElement,
      setHighlightedElementSelector,
      addDomMutation,
    });
  } else {
    teardown();
  }
};
