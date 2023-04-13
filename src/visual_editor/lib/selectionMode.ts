import { finder } from "@medv/finder";
import { DeclarativeMutation } from "dom-mutator";
import { CONTAINER_ID } from "..";
import { onDrag, teardown as moveElementTeardown } from "./moveElement";

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
const mouseMoveHandler = (event: MouseEvent) => {
  const { clientX: x, clientY: y } = event;
  const domNode = document.elementFromPoint(x, y);

  if (_isDragging) {
    ({
      draggedToParent: _draggedToParent,
      draggedToSibling: _draggedToSibling,
    } = onDrag({
      x,
      y,
      elementUnderCursor: domNode,
    }));
  } else {
    if (!domNode || domNode === _prevDomNode) return;

    clearHoverAttribute();
    domNode.setAttribute(hoverAttributeName, "");
    _prevDomNode = domNode;
    // use default finder since this is for display only
    _setHighlightedElementSelector?.(finder(domNode));
  }
};

// only the 'click' event can prevent the default behavior when clicking on
// a link or button or similar
const clickHandler = (event: MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

// on mouse up, we stop dragging
const mouseUpHandler = () => {
  if (_selectedElement && _draggedToParent) {
    if (
      _selectedElement.parentElement !== _draggedToParent ||
      (_selectedElement.nextElementSibling !== _draggedToSibling &&
        _selectedElement !== _draggedToSibling)
    ) {
      _addDomMutation?.({
        action: "set",
        attribute: "position",
        parentSelector: finder(_draggedToParent),
        insertBeforeSelector: _draggedToSibling
          ? finder(_draggedToSibling)
          : undefined,
        selector: finder(_selectedElement),
      });
    }
  }
  moveElementTeardown();
  _isDragging = false;
  _draggedToParent = null;
  _draggedToSibling = null;
};

const mouseDownHandler = (event: MouseEvent) => {
  // don't intercept cilcks on the visual editor itself
  if ((event.target as HTMLElement).id === CONTAINER_ID) return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target as HTMLElement;

  // if the user is clicking on an already selected element, we begin dragging
  if (_selectedElement === element) {
    _isDragging = true;
  } else {
    _setSelectedElement?.(element);
    moveElementTeardown();
  }
};

const teardown = () => {
  _selectedElement = null;
  _setSelectedElement = null;
  clearHoverAttribute();
  clearSelectedElementAttr();
  moveElementTeardown();
  document.removeEventListener("mousemove", mouseMoveHandler);
  document.removeEventListener("mousedown", mouseDownHandler);
  document.removeEventListener("mouseup", mouseUpHandler);
  document.removeEventListener("click", clickHandler);
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
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("click", clickHandler);

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
