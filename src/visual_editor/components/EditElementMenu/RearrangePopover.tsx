import React from "react";
import FloatingPopover from "../FloatingPopover";

export default function RearrangePopover({
  selectedElement,
}: {
  selectedElement: Element | null;
}) {
  return (
    <FloatingPopover title="Rearrange element" anchorElement={selectedElement}>
      Click and drag the element now!{" "}
    </FloatingPopover>
  );
}
