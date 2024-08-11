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
          "text-light text-xs font-semibold uppercase p-4",
          {
            "flex justify-between": onClose,
            "shadow-xl": isExpanded,
            "mb-2": isExpanded,
          }
        )}
      >
        <div className="flex items-center relative">
          <div
            className={clsx({
              "cursor-pointer": isCollapsible,
            })}
            onClick={toggleExpanded}
          >
            {title}
          </div>
          {tooltip && (
            <div className="ml-2 cursor-pointer" onClick={toggleExpanded}>
              <IDrop tooltip={tooltip} />
            </div>
          )}
          {isCollapsible ? (
            <RxCaretDown
              className={clsx(
                "w-4 h-4 cursor-pointer text-link mx-2",
                {
                  "rotate-180": !isExpanded,
                }
              )}
              onClick={toggleExpanded}
            />
          ) : null}
        </div>

        {onClose && (
          <button className="text-link" onClick={onClose}>
            <RxCross1 className="w-3 h-3" />
          </button>
        )}
      </div>

      {!isCollapsible || (isCollapsible && isExpanded) ? children : null}
    </>
  );
};

export default VisualEditorSection;
