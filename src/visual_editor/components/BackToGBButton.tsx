import clsx from "clsx";
import React, { FC } from "react";

const BackToGBButton: FC<{
  experimentUrl: string | null;
}> = ({ experimentUrl }) => (
  <button
    className={clsx(
      "w-full",
      "p-2",
      "bg-indigo-800",
      "rounded",
      "text-white",
      "font-semibold",
      "text-lg"
    )}
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
