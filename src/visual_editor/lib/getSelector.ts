import { finder } from "@medv/finder";

export default function getSelector(
  element: Element,
  options?: { ignoreClassNames: boolean },
) {
  let selector = "";
  try {
    selector = finder(element, {
      seedMinLength: 3,
      ...(options?.ignoreClassNames && { className: () => false }),
      attr: (name) => false, // ignore all attributes
    });
  } catch (e) {
    selector = getFallbackSelector(element);
  }
  return selector;
}

function getFallbackSelector(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${CSS.escape(element.id)}` : "";

  // Handle both string className (HTML elements) and SVGAnimatedString (SVG elements)
  let classes = "";
  if (element.className) {
    let classNameStr = "";
    if (typeof element.className === "string") {
      classNameStr = element.className;
    } else if (typeof element.className === "object" && "baseVal" in element.className) {
      // SVG element with SVGAnimatedString
      classNameStr = (element.className as any).baseVal;
    }

    classes = classNameStr
      ? classNameStr
        .split(' ')
        .filter(Boolean)
        .map(c => `.${CSS.escape(c)}`)
        .join('')
      : "";
  }
  return tagName + id + classes;
} 