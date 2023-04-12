const dragTargetAttributeName = "gb-selection-mode-drag-target";
const dragTargetEdgeAttributeName = "gb-selection-mode-drag-target-edge";

const clearDragTargetEdges = () => {
  const targetEdges = document.querySelectorAll(
    `[${dragTargetEdgeAttributeName}]`
  );
  targetEdges.forEach((targetEdge) => {
    targetEdge.remove();
  });
};

const clearDragTargetAttribute = () => {
  const targetElements = document.querySelectorAll(
    `[${dragTargetAttributeName}]`
  );
  targetElements.forEach((targetElement) => {
    targetElement.removeAttribute(dragTargetAttributeName);
  });
  clearDragTargetEdges();
};

let _containerElement: Element | null = null;
let _containerFlow: "vertical" | "horizontal" = "vertical";
const getContainerFlow = (element: Element): "vertical" | "horizontal" => {
  if (!element.parentElement || element.parentElement === _containerElement)
    return _containerFlow;

  const computedStyle = window.getComputedStyle(element.parentElement);
  const display = computedStyle.getPropertyValue("display");
  const flexDirection = computedStyle.getPropertyValue("flex-direction");
  const gridAutoFlow = computedStyle.getPropertyValue("grid-auto-flow");
  const containerDirection = computedStyle.getPropertyValue("direction");

  if (display === "flex") {
    _containerFlow = flexDirection === "column" ? "vertical" : "horizontal";
  } else if (display === "grid") {
    _containerFlow = gridAutoFlow === "column" ? "vertical" : "horizontal";
  } else if (containerDirection === "rtl" || containerDirection === "ltr") {
    _containerFlow = "horizontal";
  }

  _containerElement = element.parentElement;

  return _containerFlow;
};

const createHighlightEdge = ({
  elementX,
  elementY,
  elementBottom,
  elementRight,
  position,
}: {
  elementX: number;
  elementY: number;
  elementBottom: number;
  elementRight: number;
  position: "left" | "right" | "top" | "bottom";
}) => {
  const visualMarker = document.createElement("div");

  visualMarker.setAttribute(dragTargetEdgeAttributeName, "");

  document.body.appendChild(visualMarker);

  const borderStyle = "4px solid red";
  switch (position) {
    case "left":
      visualMarker.style.top = `${elementY}px`;
      visualMarker.style.left = `${elementX}px`;
      visualMarker.style.height = `${elementBottom - elementY}px`;
      visualMarker.style.borderLeft = borderStyle;
      break;
    case "right":
      visualMarker.style.top = `${elementY}px`;
      visualMarker.style.left = `${elementRight}px`;
      visualMarker.style.height = `${elementBottom - elementY}px`;
      visualMarker.style.borderRight = borderStyle;
      break;
    case "top":
      visualMarker.style.top = `${elementY}px`;
      visualMarker.style.left = `${elementX}px`;
      visualMarker.style.width = `${elementRight - elementX}px`;
      visualMarker.style.borderTop = borderStyle;
      break;
    case "bottom":
      visualMarker.style.top = `${elementBottom}px`;
      visualMarker.style.left = `${elementX}px`;
      visualMarker.style.width = `${elementRight - elementX}px`;
      visualMarker.style.borderBottom = borderStyle;
      break;
    default:
      break;
  }
};

const getEdgePosition = ({
  top,
  bottom,
  left,
  right,
  mouseX,
  mouseY,
  orientation,
}: {
  top: number;
  bottom: number;
  left: number;
  right: number;
  mouseX: number;
  mouseY: number;
  orientation: "horizontal" | "vertical";
}): "left" | "right" | "top" | "bottom" => {
  if (orientation === "horizontal") {
    return mouseX - left < right - mouseX ? "left" : "right";
  }
  return mouseY - top < bottom - mouseY ? "top" : "bottom";
};

let _lastTargetElement: Element | null = null;
let _lastEdgePosition: "top" | "bottom" | "left" | "right" | null = null;
const highlightEdge = ({
  element,
  orientation,
  mouseX,
  mouseY,
}: {
  element: Element;
  orientation: "vertical" | "horizontal";
  mouseX: number;
  mouseY: number;
}) => {
  const {
    x: elementX,
    y: elementY,
    bottom: elementBottom,
    right: elementRight,
  } = element.getBoundingClientRect();

  element.setAttribute(dragTargetAttributeName, "");

  const edgePosition = getEdgePosition({
    top: elementY,
    bottom: elementBottom,
    left: elementX,
    right: elementRight,
    mouseX,
    mouseY,
    orientation,
  });

  const landedParent = element.parentElement;
  const landedSibling = ["left", "top"].includes(edgePosition)
    ? element
    : element.nextElementSibling;

  if (_lastTargetElement !== element || _lastEdgePosition !== edgePosition) {
    _lastTargetElement = element;
    _lastEdgePosition = edgePosition;

    clearDragTargetEdges();

    createHighlightEdge({
      elementX,
      elementY,
      elementBottom,
      elementRight,
      position: edgePosition,
    });
  }

  return { landedParent, landedSibling };
};

let _lastElementUnderCursor: Element | null = null;
let _lastContainerFlow: "vertical" | "horizontal" = "vertical";
export const onDrag = ({
  x,
  y,
  elementUnderCursor,
}: {
  x: number;
  y: number;
  elementUnderCursor: Element | null;
}) => {
  if (!elementUnderCursor || !elementUnderCursor.parentElement)
    return {
      draggedToParent: null,
      draggedToSibling: null,
    };

  if (elementUnderCursor !== _lastElementUnderCursor) {
    clearDragTargetAttribute();
    _lastContainerFlow = getContainerFlow(elementUnderCursor);
  }

  // on hover of element
  //  1. get container flow
  //  2. highlight appropriate edge based on flow and position of cursor
  const { landedParent, landedSibling } = highlightEdge({
    element: elementUnderCursor,
    orientation: _lastContainerFlow,
    mouseX: x,
    mouseY: y,
  });

  _lastElementUnderCursor = elementUnderCursor;

  return {
    draggedToParent: landedParent,
    draggedToSibling: landedSibling,
  };
};

export const teardown = () => {
  _lastElementUnderCursor = null;
  _lastTargetElement = null;
  _lastEdgePosition = null;
  _containerElement = null;
  _containerFlow = "vertical";
  clearDragTargetEdges();
  clearDragTargetAttribute();
};
