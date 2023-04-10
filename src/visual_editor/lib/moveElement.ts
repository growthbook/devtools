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
  element,
  position,
}: {
  element: Element;
  position: "left" | "right" | "top" | "bottom";
}) => {
  const visualMarker = document.createElement("div");

  visualMarker.setAttribute(dragTargetEdgeAttributeName, "");
  element.appendChild(visualMarker);

  if (["left", "right"].includes(position)) {
    visualMarker.style.top = "0";
    visualMarker.style.bottom = "0";
    visualMarker.style.width = "4px";
  } else {
    visualMarker.style.left = "0";
    visualMarker.style.right = "0";
    visualMarker.style.height = "4px";
  }

  visualMarker.style[`${position}`] = "0";
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

let _targetElement: Element | null = null;
let _edgePosition: "top" | "bottom" | "left" | "right" | null = null;
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

  if (_targetElement === element && edgePosition === _edgePosition) return;

  _targetElement = element;
  _edgePosition = edgePosition;

  clearDragTargetEdges();

  createHighlightEdge({
    element,
    position: edgePosition,
  });
};

let _hoveredElement: Element | null = null;
let _hoveredElementContainerFlow: "vertical" | "horizontal" = "vertical";
export const onDrag = ({
  x,
  y,
  hoveredElement,
}: {
  x: number;
  y: number;
  hoveredElement: Element | null;
}) => {
  if (!hoveredElement || !hoveredElement.parentElement) return;

  if (hoveredElement !== _hoveredElement) {
    clearDragTargetAttribute();
    _hoveredElementContainerFlow = getContainerFlow(hoveredElement);
  }

  // on hover of element
  //  1. get container flow
  //  2. highlight appropriate edge based on flow and position of cursor
  highlightEdge({
    element: hoveredElement,
    orientation: _hoveredElementContainerFlow,
    mouseX: x,
    mouseY: y,
  });

  _hoveredElement = hoveredElement;
};

export const teardown = () => {
  _hoveredElement = null;
  _targetElement = null;
  _edgePosition = null;
  _containerElement = null;
  _containerFlow = "vertical";
};
