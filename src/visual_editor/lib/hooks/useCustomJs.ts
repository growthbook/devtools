import { useEffect, useState } from "react";
import { VisualEditorVariation } from "../../../../devtools";

const validate = (js: string) => {
  let error;
  try {
    new Function(js);
  } catch (e: any) {
    error = e.message;
  }
  return error;
};

let _globalScriptTag: HTMLScriptElement | null = null;

/**
 * This hook is used to manage the custom js for the visual editor. It manages
 * the validation and execution of the js. It also manages the creation and
 * removal of the script tag that is used to execute the js.
 */
export default function useCustomJs({
  variation,
  updateVariation,
}: {
  variation: VisualEditorVariation;
  updateVariation: (variation: Partial<VisualEditorVariation>) => void;
}): {
  customJs: string;
  customJsError: string;
  setCustomJs: (customJs: string) => void;
} {
  const [customJsError, setCustomJsError] = useState("");

  const setCustomJs = (customJs: string) => {
    const error = validate(customJs);
    if (error) setCustomJsError(error);
    else {
      setCustomJsError("");
      updateVariation({
        ...variation,
        js: customJs,
      });
    }
  };

  useEffect(() => {
    setCustomJsError("");
    if (_globalScriptTag) _globalScriptTag?.remove();
    if (!variation?.js) return;
    _globalScriptTag = document.createElement("script");
    document.body.appendChild(_globalScriptTag);
    window.__gb_global_js_err = setCustomJsError;
    _globalScriptTag.innerHTML =
      `try { ${variation?.js} } catch(e) { window.__gb_global_js_err(e.message); }` ??
      "";
  }, [variation?.js]);

  return {
    customJs: variation?.js ?? "",
    customJsError,
    setCustomJs,
  };
}
