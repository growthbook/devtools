import clsx from "clsx";
import React, { FC, MouseEvent, useCallback, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import { CopyMode, TransformCopyFn } from "./lib/hooks/useApi";

const ModeButton: FC<{
  onClick: (e: MouseEvent<HTMLDivElement>) => Promise<void>;
  mode: string;
  isDisabled: boolean;
}> = ({ onClick, mode, isDisabled }) => {
  return (
    <div
      className={clsx(
        "gb-text-xs",
        "gb-px-2",
        "gb-py-1",
        "gb-mr-2",
        "gb-mb-2",
        "gb-font-semibold",
        "gb-rounded",
        "gb-text-light",
        {
          "gb-bg-slate-600": !isDisabled,
          "gb-bg-slate-500": isDisabled,
          "gb-cursor-pointer": !isDisabled,
        }
      )}
      onClick={isDisabled ? () => {} : onClick}
    >
      {mode}
    </div>
  );
};

const AICopySuggestor: FC<{
  parentElement: Element;
  setHTML: (html: string) => void;
  transformCopy: TransformCopyFn;
  copy: string;
}> = ({ parentElement, setHTML, transformCopy, copy }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<"limit-reached" | "unknown" | null>(null);

  const replaceCopy = useCallback(
    (mode: string) => async (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      setIsLoading(true);

      const { transformed: newCopy, dailyLimitReached } = await transformCopy(
        parentElement.innerHTML,
        mode as CopyMode
      );

      if (dailyLimitReached) {
        setError("limit-reached");
      } else if (!newCopy) {
        setError("unknown");
      } else {
        setHTML(newCopy);
      }

      setIsLoading(false);
    },
    [parentElement, setHTML, setIsLoading, transformCopy]
  );

  return (
    <div className="gb-text-light gb-flex gb-flex-col gb-ml-4">
      <div className="gb-w-24 gb-text-xs gb-text-slate-400">Original</div>
      <div
        className={clsx(
          "gb-text-slate-400",
          "gb-text-ellipsis",
          "gb-overflow-hidden",
          "gb-text-sm",
          "gb-bg-slate-900",
          "gb-mr-4",
          "gb-mt-2",
          "gb-p-2",
          "gb-rounded",
          "gb-border",
          "gb-border-slate-700",
          "gb-z-20"
        )}
        style={{ flex: 2, maxHeight: "3rem" }}
      >
        {copy}
      </div>

      <div className="gb-w-24 gb-text-xs gb-text-slate-400 gb-mt-2 gb-w-full gb-relative">
        Make it more...
        <div
          className="gb-z-10 -gb-top-2 gb-bottom-0 gb-inset-x-1/2 gb-absolute gb-h-6 gb-border-l gb-border-slate-700 gb-h-9"
          style={{ width: "1px" }}
        ></div>
      </div>

      <div className="gb-flex gb-mr-4 gb-mt-2 gb-text-sm gb-h-7 gb-z-20">
        <div className="gb-flex-1 gb-flex gb-logo-bg gb-rounded-l">
          <div
            className="gb-bg-slate-700 gb-flex-1 gb-flex gb-justify-center gb-items-center gb-rounded-l"
            style={{ margin: "1px" }}
          >
            concise
          </div>
        </div>
        <div className="gb-flex-1 gb-flex gb-bg-slate-700">
          <div
            className="gb-bg-slate-900 gb-flex-1 gb-flex gb-justify-center gb-items-center"
            style={{ margin: "1px" }}
          >
            energetic
          </div>
        </div>
        <div className="gb-flex-1 gb-flex gb-bg-slate-700 gb-rounded-r">
          <div
            className="gb-bg-slate-900 gb-flex-1 gb-flex gb-justify-center gb-items-center gb-rounded-r"
            style={{ margin: "1px" }}
          >
            humorous
          </div>
        </div>
      </div>

      <div className="gb-w-24 gb-text-xs gb-text-ai-label gb-mt-2">
        Transformed{" "}
      </div>
      <div
        className={clsx(
          "gb-text-slate-200",
          "gb-text-ellipsis",
          "gb-overflow-hidden",
          "gb-text-sm",
          "gb-bg-slate-900",
          "gb-mr-4",
          "gb-mt-2",
          "gb-p-2",
          "gb-rounded"
        )}
        style={{ flex: 2, maxHeight: "3rem" }}
      >
        Dude, where's my car?
      </div>
      <button
        className={clsx(
          "gb-mr-4",
          "gb-p-2",
          "gb-bg-indigo-800",
          "gb-rounded",
          "gb-text-white",
          "gb-font-semibold",
          "gb-text-sm",
          "gb-mt-2"
        )}
        onClick={() => {}}
      >
        Apply Change
      </button>
    </div>
  );
};

export default AICopySuggestor;
