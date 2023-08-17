import React from "react";

export default function FloatingContextMenu({
  parentElement,
}: {
  parentElement: Element | null;
}) {
  if (!parentElement) return null;
  const { top, left, width, height } = parentElement.getBoundingClientRect();

  return (
    <div
      className=""
      style={{
        position: "fixed",
        top,
        left,
        width,
        height,
      }}
    ></div>
  );
}
