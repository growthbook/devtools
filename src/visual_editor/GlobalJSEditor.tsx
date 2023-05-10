import React, { FC, useEffect, useState } from "react";

const GlobalJSEditor: FC<{
  js?: string;
  onSubmit: (js: string) => void;
}> = ({ js: _js = "", onSubmit }) => {
  const [js, setJs] = useState(_js);

  const validate = (js: string) => {
    console.log("validate", { js });
    let isValid = true;
    let error;
    try {
      new Function(js);
    } catch (e: any) {
      isValid = false;
      error = e.message;
    }

    return { isValid, error };
  };

  const onSave = (js: string) => {
    console.log("onSave", { js });
    const { isValid, error } = validate(js);

    if (!isValid) {
      alert(error);
      return;
    }

    onSubmit(js);
  };

  return (
    <div className="gb-px-4 gb-pb-4">
      <textarea
        className="gb-w-full gb-h-64 gb-rounded gb-p-2"
        placeholder="Enter JS here"
        value={js}
        onChange={(e) => setJs(e.currentTarget.value)}
      />
      <button
        className="gb-mt-2 gb-p-2 gb-px-4 gb-border-indigo-500 gb-border-2 gb-rounded gb-text-indigo-500 gb-font-semibold"
        onClick={() => onSave(js)}
      >
        Save
      </button>
    </div>
  );
};

export default GlobalJSEditor;
