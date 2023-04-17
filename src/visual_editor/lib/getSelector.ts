import { finder } from "@medv/finder";

export default function getSelector(element: Element) {
  return finder(element, {
    seedMinLength: 5,
  });
}
