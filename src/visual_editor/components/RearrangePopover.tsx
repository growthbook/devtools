import React from "react";
import FloatingPopover from "./FloatingPopover";

export default function RearrangePopover({
  elementToBeDragged,
  cancel,
}: {
  elementToBeDragged: Element | null;
  cancel: () => void;
}) {
  return (
    <FloatingPopover
      title="Rearrange element"
      anchorElement={elementToBeDragged}
    >
      <div>Click and drag the element to rearrange it.</div>
      <div className="gb-flex gb-justify-end gb-py-2">
        <button onClick={cancel}>Done</button>
      </div>
    </FloatingPopover>
  );
}
