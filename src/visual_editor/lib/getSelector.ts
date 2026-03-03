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
    selector =
      element.tagName.toLowerCase() +
      (element.id ? `#${CSS.escape(element.id)}` : "") +
      (element.className
        ? element.className
          .split(' ')
          .map(c => `.${CSS.escape(c)}`)
          .join('')
        : "");
  }
  return selector;
}
