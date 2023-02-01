import React, { FC } from "react";

const HighlightedElementSelectorDisplay: FC<{ selector: string | null }> = ({
  selector,
}) => {
  if (!selector) return null;

  const parentElement = document.querySelector(selector);

  if (!parentElement) return null;

  const { left, bottom } = parentElement.getBoundingClientRect();

  return (
    <div
      className="fixed p-2 bg-indigo-800 text-white text-xs"
      style={{ top: bottom + 6, left: left - 4 }}
    >
      {selector}
    </div>
  );
};

export default HighlightedElementSelectorDisplay;
