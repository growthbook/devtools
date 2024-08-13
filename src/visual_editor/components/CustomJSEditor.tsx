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
    <div className="px-4">
      <textarea
        className="w-full h-64 rounded p-2 text-black"
        placeholder="Enter JS here"
        value={js}
        onChange={(e) => setJs(e.currentTarget.value)}
      />
      <div className="flex flex-col">
        <button
          disabled={incomingJs === js}
          className="mt-2 p-2 px-4 border-indigo-500 disabled:opacity-30 disabled:border-gray-500 border-2 rounded disabled:text-gray-500 text-indigo-500 font-semibold"
          onClick={() => onSubmit(js)}
        >
          Save
        </button>
        <div className="text-xs pt-2 text-light">
          Note: Side-effects made by this JS cannot be undone. If you want to
          revert the changes, you will have to reload the page.
        </div>
      </div>
    </div>
  );
};

export default CustomJSEditor;
