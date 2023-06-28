import clsx from "clsx";
import React, { FC, MouseEvent, useCallback, useState } from "react";
import { CopyMode, TransformCopyFn } from "./lib/hooks/useApi";
import TextareaAutosize from "react-textarea-autosize";
import { BiLoaderCircle } from "react-icons/bi";

const AICopySuggestor: FC<{
  parentElement: Element;
  setHTML: (html: string) => void;
  transformCopy: TransformCopyFn;
  copy: string;
}> = ({ parentElement, setHTML, transformCopy, copy }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<"limit-reached" | "unknown" | null>(null);
  const [tone, setTone] = useState<"concise" | "energetic" | "humorous" | null>(
    null
  );
  const [generatedCopy, setGeneratedCopy] = useState<string>("");

  const generateCopy = useCallback(
    (mode: string) => async (e: MouseEvent<any>) => {
      e.stopPropagation();

      if (isLoading) return;

      setError(null);
      setIsLoading(true);

      setGeneratedCopy("");

      const { transformed: newCopy, dailyLimitReached } = await transformCopy(
        parentElement.innerHTML,
        mode as CopyMode
      );

      if (dailyLimitReached) {
        setError("limit-reached");
      } else if (!newCopy) {
        setError("unknown");
      } else {
        setGeneratedCopy(newCopy);
      }

      setIsLoading(false);
    },
    [parentElement, setIsLoading, transformCopy, setGeneratedCopy]
  );

  const reset = useCallback(() => {
    setGeneratedCopy("");
    setTone(null);
  }, []);

  const applyCopy = useCallback(() => {
    setHTML(generatedCopy);
    reset();
  }, [setHTML, generatedCopy, setGeneratedCopy]);

  return (
    <div className="gb-flex gb-flex-col gb-ml-4">
      <div className="gb-bg-dark gb-text-light gb-flex gb-flex-col">
        <div className="gb-w-24 gb-text-xs gb-text-slate-400">
          Original copy
        </div>
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
            "gb-transition-colors",
            {
              "gb-border-gb": tone,
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
              "gb-transition-colors",
              {
                "gb-border-gb": tone,
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
              "gb-rounded-l",
              "gb-transition-colors",
              {
                "gb-border-gb": tone === "concise",
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
              "gb-transition-colors",
              {
                "gb-border-gb": tone === "energetic",
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
              "gb-rounded-r",
              "gb-transition-colors",
              {
                "gb-border-gb": tone === "humorous",
              }
            )}
            style={{ width: "85px", top: "4px", left: "153px" }}
          ></div>
        </div>

        <div
          className="gb-flex gb-mr-4 gb-mt-2 gb-text-sm gb-h-7 gb-z-20"
          onMouseOut={() => !isLoading && setTone(null)}
        >
          <div
            className={clsx(
              "gb-flex-1",
              "gb-flex",
              "gb-rounded-l",
              "gb-bg-slate-700",
              "gb-cursor-pointer",

              "gb-transition-colors",
              {
                "gb-logo-bg": tone === "concise",
              }
            )}
          >
            <button
              className={clsx(
                "gb-bg-slate-900",
                "gb-flex-1",
                "gb-flex",
                "gb-justify-center",
                "gb-items-center",
                "gb-rounded-l"
              )}
              style={{ margin: "1px" }}
              onClick={generateCopy("concise")}
              onMouseOver={() => !isLoading && setTone("concise")}
            >
              concise
            </button>
          </div>
          <div
            className={clsx(
              "gb-flex-1",
              "gb-flex",
              "gb-bg-slate-700",
              "gb-cursor-pointer",
              {
                "gb-logo-bg": tone === "energetic",
              }
            )}
          >
            <button
              className={clsx(
                "gb-bg-slate-900",
                "gb-flex-1",
                "gb-flex",
                "gb-justify-center",
                "gb-items-center"
              )}
              style={{ margin: "1px" }}
              onMouseOver={() => !isLoading && setTone("energetic")}
              onClick={generateCopy("energetic")}
            >
              energetic
            </button>
          </div>
          <div
            className={clsx(
              "gb-flex-1",
              "gb-flex",
              "gb-bg-slate-700",
              "gb-rounded-r",
              "gb-cursor-pointer",
              {
                "gb-logo-bg": tone === "humorous",
              }
            )}
          >
            <button
              className="gb-bg-slate-900 gb-flex-1 gb-flex gb-justify-center gb-items-center gb-rounded-r"
              style={{ margin: "1px" }}
              onMouseOver={() => !isLoading && setTone("humorous")}
              onClick={generateCopy("humorous")}
            >
              humorous
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="gb-text-xs gb-text-red-400 gb-mt-3">
          {error === "limit-reached"
            ? "Your daily limit for generative content has been reached."
            : "An unknown error occurred."}
        </div>
      )}

      <div className="gb-overflow-hidden">
        <div
          className={clsx(
            "gb-flex gb-justify-center gb-items-center gb-transition-all",
            {
              "-gb-mt-32": !isLoading,
              "gb-mt-4": isLoading,
            }
          )}
        >
          <BiLoaderCircle className="gb-animate-spin gb-text-indigo-500" />
        </div>
      </div>

      <div className="gb-overflow-hidden gb-pr-4">
        <div
          className={clsx("gb-transition-all", {
            "-gb-mt-32": !generatedCopy,
            "gb-mt-0": !!generatedCopy,
          })}
        >
          <div className="gb-w-24 gb-text-xs gb-text-ai-label gb-mt-2">
            Transformed{" "}
          </div>
          <TextareaAutosize
            className={clsx(
              "gb-text-slate-200",
              "gb-text-ellipsis",
              "gb-overflow-hidden",
              "gb-text-sm",
              "gb-bg-slate-900",
              "gb-w-full",
              "gb-mt-2",
              "gb-p-2",
              "gb-rounded",
              "gb-outline-none"
            )}
            style={{ flex: 2 }}
            value={generatedCopy}
            onChange={(e) => setGeneratedCopy(e.currentTarget.value)}
          />
          <button
            className={clsx(
              "gb-p-2",
              "gb-bg-indigo-800",
              "gb-rounded",
              "gb-text-white",
              "gb-font-semibold",
              "gb-text-sm",
              "gb-mt-2"
            )}
            onClick={applyCopy}
          >
            Apply
          </button>
          <button className="gb-ml-4 gb-text-indigo-600" onClick={reset}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopySuggestor;
