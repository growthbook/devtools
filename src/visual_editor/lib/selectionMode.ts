import { shadowRoot } from "..";

const highlightedAttributeName = "gb-selection-mode-highlighted";
const selectedAttributeName = "gb-selection-mode-selected";

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
};

let _selectedElement: HTMLElement | null;
let _setSelectedElement: ((element: HTMLElement | null) => void) | null;

const clickHandler = (event: MouseEvent) => {
  // don't intercept cilcks on the visual editor itself
  if ((event.target as HTMLElement).id === "visual-editor-container") return;

  event.preventDefault();
  event.stopPropagation();

  const element = event.target as HTMLElement;
  _setSelectedElement?.(element);
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
}: {
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
}) => {
  _selectedElement = selectedElement;
  _setSelectedElement = setSelectedElement;

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
}: {
  isEnabled: boolean;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement | null) => void;
}) => {
  if (isEnabled) {
    _selectedElement = selectedElement;
    _setSelectedElement = setSelectedElement;
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("click", clickHandler, true);
  } else {
    teardown();
  }
};
