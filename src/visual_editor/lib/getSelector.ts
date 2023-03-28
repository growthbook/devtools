import { finder } from "@medv/finder";

export default function getSelector(element: HTMLElement) {
  return finder(element, {
    seedMinLength: 5,
    // ignore class names since they can be generated randomly with some libraries (styled-compoonents, css modules)
    className: (_name) => false,
  });
}
