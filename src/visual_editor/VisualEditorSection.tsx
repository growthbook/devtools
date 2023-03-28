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
        className={clsx("text-slate-300 text-xs font-semibold uppercase p-4", {
          "flex justify-between": onClose,
          "shadow-xl": isExpanded,
          "mb-2": isExpanded,
        })}
      >
        <div className="flex">
          {title}
          {isCollapsible ? (
            <RxCaretDown
              className={clsx(
                "w-4 h-4 cursor-pointer hover:text-slate-100 mx-2",
                {
                  "rotate-180": !isExpanded,
                }
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          ) : null}
        </div>

        {onClose && (
          <button
            className="text-slate-300 hover:text-slate-100"
            onClick={onClose}
          >
            <RxCross1 className="w-3 h-3" />
          </button>
        )}
      </div>

      {!isCollapsible || (isCollapsible && isExpanded) ? children : null}
    </>
  );
};

export default VisualEditorSection;
