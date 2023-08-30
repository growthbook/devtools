const dragTargetAttributeName = "gb-edit-mode-drag-target";
const dragTargetEdgeAttributeName = "gb-edit-mode-drag-target-edge";

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
  element,
  mouseX,
  mouseY,
}: {
  element: Element;
  mouseX: number;
  mouseY: number;
}): "left" | "right" | "top" | "bottom" => {
  const { x, y, width, height } = element.getBoundingClientRect();
  const distances: {
    edge: "left" | "right" | "top" | "bottom";
    distance: number;
  }[] = [
    { edge: "top", distance: Math.abs(mouseY - y) },
    { edge: "right", distance: Math.abs(mouseX - (x + width)) },
    { edge: "bottom", distance: Math.abs(mouseY - (y + height)) },
    { edge: "left", distance: Math.abs(mouseX - x) },
  ];
  return distances.sort((a, b) => a.distance - b.distance)[0].edge;
};

let _lastTargetElement: Element | null = null;
let _lastEdgePosition: "top" | "bottom" | "left" | "right" | null = null;

const highlightEdge = ({
  element,
  mouseX,
  mouseY,
}: {
  element: Element;
  mouseX: number;
  mouseY: number;
}) => {
  element.setAttribute(dragTargetAttributeName, "");

  const edgePosition = getEdgePosition({
    element,
    mouseX,
    mouseY,
  });

  const landedParent = element.parentElement;
  const landedSibling = ["left", "top"].includes(edgePosition)
    ? element
    : element.nextElementSibling;

  if (_lastTargetElement !== element || _lastEdgePosition !== edgePosition) {
    _lastTargetElement = element;
    _lastEdgePosition = edgePosition;

    clearDragTargetEdges();

    const {
      x: elementX,
      y: elementY,
      bottom: elementBottom,
      right: elementRight,
    } = element.getBoundingClientRect();

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
let _lastLandedParent: Element | null = null;
let _lastLandedSibling: Element | null = null;

export const onDrag = ({
  x,
  y,
  elementUnderCursor,
  draggedElement,
}: {
  x: number;
  y: number;
  elementUnderCursor: Element | null;
  draggedElement: Element;
}) => {
  if (
    // if there is no element under cursor, return
    !elementUnderCursor ||
    // if the element under cursor is the dragged element, return
    // if the element under cursor is a child of the dragged element, return
    draggedElement.contains(elementUnderCursor) ||
    // if the dragged element has no parent, it's not in the DOM, return
    !draggedElement.parentElement

    // TODO determine if we need the following restrictions or not.
    //
    // if the element under cursor is the parent element, return
    // draggedElement.parentElement === elementUnderCursor ||
    // if the element under cursor is NOT a sibling, return
    // draggedElement.parentElement !== elementUnderCursor.parentElement
  )
    return {
      draggedToParent: _lastLandedParent,
      draggedToSibling: _lastLandedSibling,
    };

  if (elementUnderCursor !== _lastElementUnderCursor)
    clearDragTargetAttribute();

  const { landedParent, landedSibling } = highlightEdge({
    element: elementUnderCursor,
    mouseX: x,
    mouseY: y,
  });

  _lastElementUnderCursor = elementUnderCursor;
  _lastLandedParent = landedParent;
  _lastLandedSibling = landedSibling;

  return {
    draggedToParent: landedParent,
    draggedToSibling: landedSibling,
  };
};

export const teardown = () => {
  _lastElementUnderCursor = null;
  _lastTargetElement = null;
  _lastEdgePosition = null;
  _lastLandedParent = null;
  _lastLandedSibling = null;
  _containerElement = null;
  _containerFlow = "vertical";
  clearDragTargetEdges();
  clearDragTargetAttribute();
};
