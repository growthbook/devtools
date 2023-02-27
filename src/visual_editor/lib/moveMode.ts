const highlightedAttributeName = "gb-move-mode-highlighted";

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

const teardown = () => {
  clearHighlightedElementAttr();
  document.removeEventListener("mousemove", mouseMoveHandler, true);
};

export const toggleMoveMode = (isEnabled: boolean) => {
  if (isEnabled) {
    document.addEventListener("mousemove", mouseMoveHandler, true);
  } else {
    teardown();
  }
};
