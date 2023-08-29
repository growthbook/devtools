import React from "react";
import FloatingPopover from "./FloatingPopover";

export default function RearrangePopover({
  elementToBeDragged,
}: {
  elementToBeDragged: Element | null;
}) {
  return (
    <FloatingPopover
      title="Rearrange element"
      anchorElement={elementToBeDragged}
    >
      Click and drag the element to rearrange it.
    </FloatingPopover>
  );
}
