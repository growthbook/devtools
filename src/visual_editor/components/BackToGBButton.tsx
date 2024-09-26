import clsx from "clsx";
import React, { FC } from "react";

const BackToGBButton: FC<{
  experimentUrl: string | null;
}> = ({ experimentUrl }) => (
  <button
    className="gb-w-full gb-p-2 gb-bg-indigo-800 hover:gb-bg-indigo-700 gb-rounded gb-text-white gb-font-semibold gb-text-lg gb-transition-colors"
    onClick={() => {
      if (experimentUrl) {
        window.location.href = experimentUrl;
      } else {
        window.history.back();
      }
    }}
  >
    Back to GrowthBook
  </button>
);

export default BackToGBButton;
