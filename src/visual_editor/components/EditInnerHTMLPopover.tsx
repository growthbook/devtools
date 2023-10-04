import React, { useEffect, useState } from "react";
import FloatingPopover from "./FloatingPopover";
import { isHtmlTooLarge } from "./ElementDetails";

export default function EditInnerHTMLPopover({
  setInnerHTML,
  elementUnderEdit,
  close,
}: {
  setInnerHTML: (html: string) => void;
  elementUnderEdit: Element | null;
  close: () => void;
}) {
  const [html, setHtml] = useState(elementUnderEdit?.innerHTML ?? "");

  useEffect(() => {
    if (!elementUnderEdit) return;
    setHtml(elementUnderEdit.innerHTML);
  }, [elementUnderEdit]);

  const onSave = () => {
    setInnerHTML(html);
    close();
  };

  if (elementUnderEdit && isHtmlTooLarge(elementUnderEdit.innerHTML)) {
    return (
      <FloatingPopover
        title="Edit Inner HTML"
        anchorElement={elementUnderEdit}
        onClose={close}
      >
        <div className="gb-flex gb-justify-end gb-py-2">
          The innerHTML of this element is too large to display / edit.
        </div>
      </FloatingPopover>
    );
  }

  return (
    <FloatingPopover
      title="Edit Inner HTML"
      anchorElement={elementUnderEdit}
      onClose={close}
    >
      <div className="gb-flex gb-flex-col gb-justify-end gb-py-2">
        <div>
          Edit the innner HTML of this element and click Save to apply the
          change.
        </div>
        <textarea
          className="gb-my-2 gb-w-full gb-h-32 gb-p-2 gb-border gb-border-gray-200"
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
        <div className="gb-flex gb-justify-end">
          <button className="gb-px-4 gb-py-2" onClick={close}>
            Cancel
          </button>
          <button
            className="gb-px-4 gb-py-2 gb-bg-indigo-700 gb-text-white"
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </FloatingPopover>
  );
}
