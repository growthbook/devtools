import React, { FC, useEffect, useState } from "react";

const CustomJSEditor: FC<{
  js?: string;
  onSubmit: (js: string) => void;
}> = ({ js: incomingJs, onSubmit }) => {
  const [js, setJs] = useState(incomingJs ?? "");

  useEffect(() => {
    setJs(incomingJs ?? "");
  }, [incomingJs]);

  return (
    <div className="gb-px-4">
      <textarea
        className="gb-w-full gb-h-64 gb-rounded gb-p-2"
        placeholder="Enter JS here"
        value={js}
        onChange={(e) => setJs(e.currentTarget.value)}
      />
      <div className="gb-flex gb-flex-col">
        <button
          disabled={incomingJs === js}
          className="gb-mt-2 gb-p-2 gb-px-4 gb-border-indigo-500 disabled:opacity-30 disabled:gb-border-gray-500 gb-border-2 gb-rounded disabled:gb-text-gray-500 gb-text-indigo-500 gb-font-semibold"
          onClick={() => onSubmit(js)}
        >
          Save
        </button>
        <div className="gb-text-xs gb-pt-2 gb-text-light">
          Note: Side-effects made by this JS cannot be undone. If you want to
          revert the changes, you will have to reload the page.
        </div>
      </div>
    </div>
  );
};

export default CustomJSEditor;
