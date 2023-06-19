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
        {copy}
      </div>

      <div className="gb-w-24 gb-text-xs gb-text-slate-400 gb-mt-2">
        Make it more...
      </div>
      <div className="gb-flex gb-mr-4 gb-mt-2 gb-text-sm">
        <div className="gb-p-1 gb-flex-1 gb-flex gb-items-center gb-justify-center">
          concise
        </div>
        <div className="gb-p-1 gb-flex-1 gb-flex gb-items-center gb-justify-center">
          energetic
        </div>
        <div className="gb-p-1 gb-flex-1 gb-flex gb-items-center gb-justify-center">
          humorous
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
