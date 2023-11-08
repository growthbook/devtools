import clsx from "clsx";
import React, { FC, ReactNode, useState } from "react";
import { RxCross1, RxCaretDown } from "react-icons/rx";
import IDrop from "./IDrop";

const VisualEditorSection: FC<{
  children: ReactNode;
  title: string | ReactNode;
  onClose?: () => void;
  isExpanded?: boolean;
  isCollapsible?: boolean;
  tooltip?: string;
}> = ({
  children,
  title,
  onClose,
  isExpanded: _isExpanded = false,
  isCollapsible = false,
  tooltip,
}) => {
  const [isExpanded, setIsExpanded] = useState(_isExpanded);
  const toggleExpanded = () => isCollapsible && setIsExpanded(!isExpanded);
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
        <div className="gb-flex gb-items-center gb-relative">
          <div
            className={clsx({
              "gb-cursor-pointer": isCollapsible,
            })}
            onClick={toggleExpanded}
          >
            {title}
          </div>
          {tooltip && (
            <div className="gb-ml-2 gb-cursor-pointer" onClick={toggleExpanded}>
              <IDrop tooltip={tooltip} />
            </div>
          )}
          {isCollapsible ? (
            <RxCaretDown
              className={clsx(
                "gb-w-4 gb-h-4 gb-cursor-pointer gb-text-link gb-mx-2",
                {
                  "gb-rotate-180": !isExpanded,
                }
              )}
              onClick={toggleExpanded}
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
