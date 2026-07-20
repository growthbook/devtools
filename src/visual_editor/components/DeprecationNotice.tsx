import React, { FC } from "react";
import GBLogo from "../../../public/logo128.png";
import { NEW_VISUAL_EDITOR_STORE_URL } from "../lib/constants";

// Shown before the legacy editor UI when the standalone Visual Editor
// extension is not installed (when it IS installed, the content script
// never injects this bundle at all — see content_script/index.ts).
const DeprecationNotice: FC<{
  onContinue: () => void;
  onClose: () => void;
}> = ({ onContinue, onClose }) => (
  <div
    className="fixed inset-0 z-max flex items-center justify-center"
    style={{ background: "rgba(0, 0, 0, 0.6)" }}
  >
    <div className="rounded-xl shadow-xl bg-dark w-96 cursor-default exp-creator">
      <div className="flex px-4 h-12 items-center rounded-t-xl logo-bg">
        <div className="h-8">
          <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
        </div>
        <div className="font-semibold text-white grow">
          GrowthBook Visual Editor
        </div>
        <button
          className="text-slate-200 hover:text-white text-base leading-none px-1"
          title="Close the Visual Editor"
          onClick={onClose}
        >
          &#10005;
        </button>
      </div>

      <div className="p-4 text-light text-sm leading-relaxed">
        <p className="mb-2">
          The Visual Editor has moved to its own extension, with a new editing
          experience and the latest features.
        </p>
        <p>
          This built-in editor is deprecated and will be removed in a future
          release.
        </p>

        <button
          className="w-full p-2 mt-4 bg-indigo-800 hover:bg-indigo-700 rounded text-white font-semibold transition-colors"
          onClick={() =>
            window.open(NEW_VISUAL_EDITOR_STORE_URL, "_blank", "noopener")
          }
        >
          Get the new Visual Editor
        </button>
        <button
          className="w-full p-2 mt-1 text-slate-400 hover:text-slate-200 underline transition-colors"
          onClick={onContinue}
        >
          Continue with the legacy editor
        </button>
      </div>
    </div>
  </div>
);

export default DeprecationNotice;
