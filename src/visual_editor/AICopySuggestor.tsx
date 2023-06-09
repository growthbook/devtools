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
}> = ({ parentElement, setHTML, transformCopy }) => {
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
      <div className="gb-flex gb-flex-wrap gb-relative">
        {[
          "energetic",
          "concise",
          "humorous",
          "explosive",
          "soothing",
          "compassionate",
          "punny",
        ].map((e) => (
          <ModeButton
            isDisabled={isLoading || error === "limit-reached"}
            onClick={replaceCopy(e)}
            mode={e}
          />
        ))}
        {isLoading && (
          <div className="gb-absolute gb-inset-0 gb-flex gb-justify-center gb-items-center gb-text-light">
            <BiLoaderCircle className="gb-animate-spin" />
          </div>
        )}
      </div>
      {error && (
        <div className="gb-text-xs gb-text-red-400">
          {error === "limit-reached"
            ? "Your daily limit for generative content has been reached."
            : "An unknown error occurred."}
        </div>
      )}
    </div>
  );
};

export default AICopySuggestor;
