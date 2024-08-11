import clsx from "clsx";
import React, { FC, useState } from "react";
import { IoMdInformationCircle } from "react-icons/io";

const IDrop: FC<{ tooltip: string }> = ({ tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className="text-light normal-case"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <IoMdInformationCircle className="w-3 h-3" />
      <div
        className={clsx(
          "absolute",
          "top-4",
          "left-0",
          "w-64",
          "z-max",
          "bg-slate-600",
          "p-2",
          "rounded",
          "font-normal",
          "transition-opacity",
          {
            "hidden opacity-0": !showTooltip,
            "opacity-100": showTooltip,
          }
        )}
      >
        {tooltip}
      </div>
    </div>
  );
};

export default IDrop;
