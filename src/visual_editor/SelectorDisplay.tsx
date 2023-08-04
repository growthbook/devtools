import React, { FC } from "react";

const SelectorDisplay: FC<{ selector: string | null }> = ({ selector }) => {
  if (!selector) return null;

  const parentElement = document.querySelector(selector);

  if (!parentElement) return null;

  const { left, bottom } = parentElement.getBoundingClientRect();

  return (
    <div
      className="gb-fixed gb-p-2 gb-bg-indigo-800 gb-text-white gb-text-xs"
      style={{ top: bottom + 8, left }}
    >
      {selector}
    </div>
  );
};

export default SelectorDisplay;
