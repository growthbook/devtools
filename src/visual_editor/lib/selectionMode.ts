const highlightAttribute = "gb-selection-mode-highlighted";
const selectedAttribute = "gb-selection-mode-selected";

const clearSelected = () => {
  const selected = document.querySelectorAll(`[${selectedAttribute}]`)?.[0];
  selected?.removeAttribute(selectedAttribute);
};

const clearHighlights = () => {
  const highlights = document.querySelectorAll(`[${highlightAttribute}]`);

  highlights.forEach((highlight) => {
    highlight.removeAttribute(highlightAttribute);
  });
};

let _prevDomNode: Element | null = null;

const mouseMoveHandler = (event: MouseEvent) => {
  const { clientX: x, clientY: y } = event;
  const domNode = document.elementFromPoint(x, y);
  if (!domNode || domNode === _prevDomNode) return;
  clearHighlights();
  domNode.setAttribute(highlightAttribute, "");
  _prevDomNode = domNode;
};

export const toggleSelectionMode = ({
  isEnabled,
  selectedElement,
  setSelectedElement,
}: {
  isEnabled: boolean;
  selectedElement: HTMLElement | null;
  setSelectedElement: (element: HTMLElement) => void;
}) => {
  const clickHandler = (event: MouseEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    clearSelected();
    clearHighlights();

    const element = event.target as HTMLElement;

    element.setAttribute(selectedAttribute, "");

    setSelectedElement(element);

    document.removeEventListener("mousemove", mouseMoveHandler);
  };

  if (!selectedElement) {
    clearSelected();
  }

  if (isEnabled) {
    if (!selectedElement)
      document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mousedown", clickHandler);
  } else {
    clearHighlights();
    clearSelected();
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mousedown", clickHandler);
  }
};
