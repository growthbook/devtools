import React, { FC } from "react";
import { TbArrowsMove } from "react-icons/tb";

const MoveTag: FC<{ parentElement: Element | null }> = ({ parentElement }) => {
  if (!parentElement) return null;

  const { left, top } = parentElement.getBoundingClientRect();

  return (
    <div
      className="gb-fixed gb-p-2 gb-bg-indigo-800 gb-text-white gb-text-xs gb-z-max"
      style={{ top: top - 36, left }}
    >
      <TbArrowsMove className="gb-h-4 gb-w-4" />
    </div>
  );
};

export default MoveTag;
