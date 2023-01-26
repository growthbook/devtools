export const toggleNormalMode = (isEnabled: boolean) => {};

const highlightAttribute = "gb-selection-mode-highlighted";

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

export const toggleSelectionMode = (isEnabled: boolean) => {
  if (isEnabled) {
    document.addEventListener("mousemove", mouseMoveHandler);
  } else {
    clearHighlights();
    document.removeEventListener("mousemove", mouseMoveHandler);
  }
};

export const toggleCssMode = (isEnabled: boolean) => {};

export const toggleMutationMode = (isEnabled: boolean) => {};

export const toggleScreenshotMode = (isEnabled: boolean) => {};
