import { finder } from "@medv/finder";
import { REARRANGE_CLASSNAME_PREFIX } from "./hooks/useRearrangeMode";

export default function getSelector(element: Element) {
  // TODO - this is a hack - we should use the finder library to find the selector
  if (
    element.className &&
    element.className.includes?.(REARRANGE_CLASSNAME_PREFIX)
  ) {
    const className = element.className
      .split(" ")
      .find((c) => c.startsWith(REARRANGE_CLASSNAME_PREFIX));
    return `.${className}`;
  }

  return finder(element, {
    seedMinLength: 3,
  });
}
