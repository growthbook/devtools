import { debounce } from "lodash";
import { useEffect } from "react";
import { VisualEditorVariation } from "../../../../devtools";

let _globalStyleTag: HTMLStyleElement | null = null;

/**
 * This hook is used to update the global CSS for the variation. It manages
 * the creation and removal of the style tag in the head of the document.
 */
export default function useGlobalCSS({
  variation,
  updateVariation,
}: {
  variation: VisualEditorVariation;
  updateVariation: (variation: Partial<VisualEditorVariation>) => void;
}): {
  globalCss: string;
  setGlobalCss: (globalCss: string) => void;
} {
  const setGlobalCss = debounce((css: string) => {
    updateVariation({ css });
  }, 500);

  useEffect(() => {
    if (_globalStyleTag) _globalStyleTag.remove();
    if (!variation?.css) return;
    _globalStyleTag = document.createElement("style");
    document.head.appendChild(_globalStyleTag);
    _globalStyleTag.innerHTML = variation?.css ?? "";
  }, [variation]);

  return {
    globalCss: variation?.css ?? "",
    setGlobalCss,
  };
}
