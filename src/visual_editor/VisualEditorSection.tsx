import clsx from "clsx";
import React, { FC, ReactNode, useState } from "react";
import { RxCross1, RxCaretDown } from "react-icons/rx";

const VisualEditorSection: FC<{
  children: ReactNode;
  title: string;
  onClose?: () => void;
  isExpanded?: boolean;
  isCollapsible?: boolean;
}> = ({
  children,
  title,
  onClose,
  isExpanded: _isExpanded = false,
  isCollapsible = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(_isExpanded);
  return (
    <>
      <div
        className={clsx(
          "gb-text-light gb-text-xs gb-font-semibold gb-uppercase gb-p-4",
          {
            "gb-flex gb-justify-between": onClose,
            "gb-shadow-xl": isExpanded,
            "gb-mb-2": isExpanded,
          }
        )}
      >
        <div className="gb-flex">
          {title}
          {isCollapsible ? (
            <RxCaretDown
              className={clsx(
                "gb-w-4 gb-h-4 gb-cursor-pointer gb-text-link gb-mx-2",
                {
                  "gb-rotate-180": !isExpanded,
                }
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          ) : null}
        </div>

        {onClose && (
          <button className="gb-text-link" onClick={onClose}>
            <RxCross1 className="gb-w-3 gb-h-3" />
          </button>
        )}
      </div>

      {!isCollapsible || (isCollapsible && isExpanded) ? children : null}
    </>
  );
};

export default VisualEditorSection;
