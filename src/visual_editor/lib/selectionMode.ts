import { finder } from "@medv/finder";
import { shadowRoot } from "..";

export const highlightedAttributeName = "gb-selection-mode-highlighted";
export const selectedAttributeName = "gb-selection-mode-selected";

const clearSelectedElementAttr = () => {
  const selected = document.querySelectorAll(`[${selectedAttributeName}]`)?.[0];
  selected?.removeAttribute(selectedAttributeName);
};

const clearHighlightedElementAttr = () => {
  const highlights = document.querySelectorAll(`[${highlightedAttributeName}]`);
  highlights.forEach((highlight) => {
    highlight.removeAttribute(highlightedAttributeName);
  });
};

let _prevDomNode: Element | null = null;

const mouseMoveHandler = (event: MouseEvent) => {
  const { clientX: x, clientY: y } = event;
  const domNode = document.elementFromPoint(x, y);
  if (!domNode || domNode === _prevDomNode) return;
  clearHighlightedElementAttr();
  domNode.setAttribute(highlightedAttributeName, "");
  _prevDomNode = domNode;
  _setHighlightedElementSelector?.(finder(domNode));
};

let _selectedElement: HTMLElement | null;
let _setSelectedElement: ((element: HTMLElement | null) => void) | null;
let _setHighlightedElementSelector: ((selector: string) => void) | null;

const clickHandler = (event: MouseEvent) => {
  // don't intercept cilcks on the visual editor itself
  if ((event.target as HTMLElement).id === "visual-editor-container") return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target as HTMLElement;
  _setSelectedElement?.(element);
  _setHighlightedElementSelector?.(finder(element));
};

const teardown = () => {
  _selectedElement = null;
  _setSelectedElement = null;
  clearHighlightedElementAttr();
  clearSelectedElementAttr();
  document.removeEventListener("mousemove", mouseMoveHandler);
  document.removeEventListener("click", clickHandler, true);
};

export const updateSelectedElement = ({
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

  if (!_selectedElement) {
    clearSelectedElementAttr();
    document.addEventListener("mousemove", mouseMoveHandler);
  } else {
    clearSelectedElementAttr();
    clearHighlightedElementAttr();
    _selectedElement.setAttribute(selectedAttributeName, "");
    document.removeEventListener("mousemove", mouseMoveHandler);
  }
};

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
    document.addEventListener("click", clickHandler, true);
  } else {
    teardown();
  }
};
