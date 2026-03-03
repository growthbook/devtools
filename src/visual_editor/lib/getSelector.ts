import { finder } from "@medv/finder";
import { SelectorError } from "./hooks/useSelectorErrors";

function validateSelector(selector: string): { valid: boolean; error?: string } {
  if (!selector || selector.trim() === "") {
    return { valid: false, error: "Selector is empty" };
  }

  try {
    document.querySelector(selector);
    return { valid: true };
  } catch (e) {
    return {
      valid: false,
      error: e instanceof Error ? e.message : "Invalid CSS selector"
    };
  }
}

function getFallbackSelector(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${CSS.escape(element.id)}` : "";
  const classes = element.className
    ? element.className
      .split(' ')
      .filter(Boolean)
      .map(c => `.${c}`)
      .join('')
    : "";

  return tagName + id + classes;
}

export default function getSelector(
  element: Element,
  options?: {
    ignoreClassNames?: boolean;
    onError?: (error: SelectorError) => void;
  },
): string {
  let selector = "";
  let usedFallback = false;

  try {
    selector = getFallbackSelector(element);
    finder(element, {
      seedMinLength: 3,
      ...(options?.ignoreClassNames && { className: () => false }),
      attr: (name) => false,
    });

    const validation = validateSelector(selector);
    if (!validation.valid) {
      const errorMsg = validation.error || "Invalid selector generated";
      console.warn(`Generated selector is invalid: ${errorMsg}. Using fallback.`);

      if (options?.onError) {
        options.onError({
          selector,
          error: errorMsg,
          timestamp: Date.now(),
          context: "getSelector (validation failed)",
        });
      }

      selector = getFallbackSelector(element);
      usedFallback = true;
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    console.warn("Error generating selector with finder, using fallback:", e);

    if (options?.onError) {
      options.onError({
        selector: "",
        error: errorMsg,
        timestamp: Date.now(),
        context: "getSelector (finder crashed)",
      });
    }

    selector = getFallbackSelector(element);
    usedFallback = true;
  }

  const finalValidation = validateSelector(selector);
  if (!finalValidation.valid) {
    const errorMsg = finalValidation.error || "Failed to generate valid selector";
    console.error("Failed to generate valid selector for element:", element);

    if (options?.onError && !usedFallback) {
      options.onError({
        selector,
        error: errorMsg,
        timestamp: Date.now(),
        context: "getSelector (fallback failed)",
      });
    }

    return element.tagName.toLowerCase();
  }

  return selector;
}

export { validateSelector };
