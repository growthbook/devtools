import clsx from "clsx";
import React, { FC } from "react";

const BackToGBButton: FC<{
  experimentUrl: string;
  children: React.ReactNode;
}> = ({ experimentUrl, children }) => (
  <button
    className={clsx(
      "gb-w-full",
      "gb-p-2",
      "gb-bg-indigo-800",
      "gb-rounded",
      "gb-text-white",
      "gb-font-semibold",
      "gb-text-lg"
    )}
    onClick={() => (window.location.href = experimentUrl)}
  >
    {children}
  </button>
);

export default BackToGBButton;
