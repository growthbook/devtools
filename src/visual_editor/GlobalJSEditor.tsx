import React, { FC, useCallback, useEffect, useState } from "react";

const validate = (js: string) => {
  let error;
  try {
    new Function(js);
  } catch (e: any) {
    error = e.message;
  }
  return error;
};

const GlobalJSEditor: FC<{
  js?: string;
  onSubmit: (js: string) => void;
  onError: (error: string) => void;
}> = ({ js: _js = "", onSubmit, onError }) => {
  const [js, setJs] = useState(_js);

  const onSave = useCallback(
    (js: string) => {
      const error = validate(js);
      if (error) return onError(error);
      onSubmit(js);
    },
    [onSubmit, onError]
  );

  useEffect(() => {
    setJs(_js);
  }, [_js]);

  return (
    <div className="gb-px-4 gb-pb-4">
      <textarea
        className="gb-w-full gb-h-64 gb-rounded gb-p-2"
        placeholder="Enter JS here"
        value={js}
        onChange={(e) => setJs(e.currentTarget.value)}
      />
      <button
        disabled={_js === js}
        className="gb-mt-2 gb-p-2 gb-px-4 gb-border-indigo-500 disabled:opacity-30 disabled:gb-border-gray-500 gb-border-2 gb-rounded disabled:gb-text-gray-500 gb-text-indigo-500 gb-font-semibold"
        onClick={() => onSave(js)}
      >
        Save
      </button>
    </div>
  );
};

export default GlobalJSEditor;
