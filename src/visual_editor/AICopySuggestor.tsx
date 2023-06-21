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
  const [tone, setTone] = useState<"concise" | "energetic" | "humorous">(
    "concise"
  );
  const [isHighlighted, setIsHighlighted] = useState(false);

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
          "gb-z-20",
          {
            "gb-border-gb": isHighlighted,
          }
        )}
        style={{ flex: 2, maxHeight: "3rem" }}
      >
        {copy}
      </div>

      <div className="gb-w-24 gb-text-xs gb-text-slate-400 gb-mt-2 gb-w-full gb-relative">
        <div className="gb-bg-dark gb-relative gb-z-20 gb-inline-block">
          Make it more...
        </div>

        {/* top center */}
        <div
          className={clsx(
            "gb-z-10",
            "-gb-top-2",
            "gb-bottom-0",
            "gb-inset-x-1/2",
            "gb-absolute",
            "gb-border-l",
            "gb-border-slate-700",
            {
              "gb-border-gb": isHighlighted,
            }
          )}
          style={{ width: "1px", height: "14px" }}
        ></div>
        {/* left arm */}
        <div
          className={clsx(
            "gb-z-10",
            "gb-bottom-0",
            "gb-absolute",
            "gb-border-l",
            "gb-border-t",
            "gb-h-9",
            "gb-border-slate-700",
            {
              "gb-border-gb": isHighlighted && tone === "concise",
            }
          )}
          style={{ width: "102px", top: "4px", left: "50px" }}
        ></div>
        {/* center arm */}
        <div
          className={clsx(
            "gb-z-10",
            "gb-bottom-0",
            "gb-absolute",
            "gb-border-l",
            "gb-h-9",
            "gb-border-slate-700",
            {
              "gb-border-gb": isHighlighted && tone === "energetic",
            }
          )}
          style={{ width: "0px", top: "5px", left: "152px" }}
        ></div>
        {/* right arm */}
        <div
          className={clsx(
            "gb-z-10",
            "gb-bottom-0",
            "gb-absolute",
            "gb-border-r",
            "gb-border-t",
            "gb-border-slate-700",
            "gb-h-9",
            {
              "gb-border-gb": isHighlighted && tone === "humorous",
            }
          )}
          style={{ width: "85px", top: "4px", left: "153px" }}
        ></div>
      </div>

      <div
        className="gb-flex gb-mr-4 gb-mt-2 gb-text-sm gb-h-7 gb-z-20"
        onMouseOver={() => setIsHighlighted(true)}
        onMouseOut={() => setIsHighlighted(false)}
      >
        <div
          className={clsx(
            "gb-flex-1",
            "gb-flex",
            "gb-rounded-l",
            "gb-bg-slate-700",
            "gb-cursor-pointer",
            {
              "gb-logo-bg": isHighlighted && tone === "concise",
            }
          )}
        >
          <div
            className={clsx(
              "gb-bg-slate-900",
              "gb-flex-1",
              "gb-flex",
              "gb-justify-center",
              "gb-items-center",
              "gb-rounded-l"
            )}
            style={{ margin: "1px" }}
            onMouseOver={() => setTone("concise")}
          >
            concise
          </div>
        </div>
        <div
          className={clsx(
            "gb-flex-1",
            "gb-flex",
            "gb-bg-slate-700",
            "gb-cursor-pointer",
            {
              "gb-logo-bg": isHighlighted && tone === "energetic",
            }
          )}
        >
          <div
            className={clsx(
              "gb-bg-slate-900",
              "gb-flex-1",
              "gb-flex",
              "gb-justify-center",
              "gb-items-center"
            )}
            style={{ margin: "1px" }}
            onMouseOver={() => setTone("energetic")}
          >
            energetic
          </div>
        </div>
        <div
          className={clsx(
            "gb-flex-1",
            "gb-flex",
            "gb-bg-slate-700",
            "gb-rounded-r",
            "gb-cursor-pointer",
            {
              "gb-logo-bg": isHighlighted && tone === "humorous",
            }
          )}
        >
          <div
            className="gb-bg-slate-900 gb-flex-1 gb-flex gb-justify-center gb-items-center gb-rounded-r"
            style={{ margin: "1px" }}
            onMouseOver={() => setTone("humorous")}
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
