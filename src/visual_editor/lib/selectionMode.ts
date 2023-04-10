import { finder } from "@medv/finder";
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
let _draggedElement: HTMLElement | null = null;

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

const mouseMoveHandler = (event: MouseEvent) => {
  const { clientX: x, clientY: y } = event;
  const domNode = document.elementFromPoint(x, y);

  if (_isDragging) {
    onDrag({
      x,
      y,
      hoveredElement: domNode,
    });
  } else {
    console.log("DEBUG domNode", domNode);

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
const mouseUpHandler = (event: MouseEvent) => {
  // TODO if we have a dragged element and an edge to drop it in, create DOM mutation
  moveElementTeardown();
};

const mouseDownHandler = (event: MouseEvent) => {
  // don't intercept cilcks on the visual editor itself
  if ((event.target as HTMLElement).id === CONTAINER_ID) return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target as HTMLElement;

  // if the user is clicking on an already selected element, we begin dragging
  if (_selectedElement !== element) {
    _setSelectedElement?.(element);
    moveElementTeardown();
  } else {
    _isDragging = true;
    _draggedElement = element;
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

// called by react component
export const onSelectionModeUpdate = ({
  selectedElement,
  setSelectedElement,
  setHighlightedElementSelector,
}: {
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
  setHighlightedElementSelector: (selector: string) => void;
}) => {
  _selectedElement = selectedElement;
  _setSelectedElement = setSelectedElement;
  _setHighlightedElementSelector = setHighlightedElementSelector;

  clearSelectedElementAttr();
  clearHoverAttribute();

  if (_selectedElement) {
    _selectedElement.setAttribute(selectedAttributeName, "");
  }
};

// called by react component
export const toggleSelectionMode = ({
  isEnabled,
  selectedElement,
  setSelectedElement,
  setHighlightedElementSelector,
}: {
  isEnabled: boolean;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
  setHighlightedElementSelector: (selector: string) => void;
}) => {
  if (isEnabled) {
    _selectedElement = selectedElement;
    _setSelectedElement = setSelectedElement;
    _setHighlightedElementSelector = setHighlightedElementSelector;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("click", clickHandler);
  } else {
    teardown();
  }
};
