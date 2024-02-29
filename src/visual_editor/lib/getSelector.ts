import { finder } from "@medv/finder";

export default function getSelector(element: Element) {
  let selector = "";
  try {
    selector = finder(element, {
      seedMinLength: 3,
      attr: (name) => name === "data-growthbook-element-id",
    });
  } catch (e) {
    selector =
      element.tagName.toLowerCase() +
      (element.id ? `#${element.id}` : "") +
      (element.className ? `.${element.className}` : "");
  }
  return selector;
}
