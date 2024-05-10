import { finder } from "@medv/finder";

export default function getSelector(
  element: Element,
  options?: { ignoreClassNames: boolean }
) {
  let selector = "";
  try {
    selector = finder(element, {
      seedMinLength: 3,
      ...(options?.ignoreClassNames && { className: () => false }),
      attr: (name) => name.startsWith("data-"),
    });
  } catch (e) {
    selector =
      element.tagName.toLowerCase() +
      (element.id ? `#${element.id}` : "") +
      (element.className ? `.${element.className}` : "");
  }
  return selector;
}
