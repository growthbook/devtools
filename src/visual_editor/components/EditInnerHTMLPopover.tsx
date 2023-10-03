import React from "react";
import FloatingPopover from "./FloatingPopover";

export default function EditInnerHTMLPopover({
  elementUnderEdit,
  cancel,
}: {
  elementUnderEdit: Element | null;
  cancel: () => void;
}) {
  return (
    <FloatingPopover
      title="Edit Inner HTML"
      anchorElement={elementUnderEdit}
      onClose={cancel}
    >
      <div className="gb-flex gb-justify-end gb-py-2">
        <textarea value={elementUnderEdit?.innerHTML}></textarea>
      </div>
    </FloatingPopover>
  );
}
