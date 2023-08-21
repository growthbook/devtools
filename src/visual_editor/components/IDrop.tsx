import clsx from "clsx";
import React, { FC, useState } from "react";
import { IoMdInformationCircle } from "react-icons/io";

const IDrop: FC<{ tooltip: string }> = ({ tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      className="gb-text-light gb-normal-case"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <IoMdInformationCircle className="gb-w-3 gb-h-3" />
      <div
        className={clsx(
          "gb-absolute",
          "gb-top-4",
          "gb-left-0",
          "gb-w-64",
          "gb-z-max",
          "gb-bg-slate-600",
          "gb-p-2",
          "gb-rounded",
          "gb-font-normal",
          "gb-transition-opacity",
          {
            "gb-hidden gb-opacity-0": !showTooltip,
            "gb-opacity-100": showTooltip,
          }
        )}
      >
        {tooltip}
      </div>
    </div>
  );
};

export default IDrop;
