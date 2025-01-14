import clsx from "clsx";
import React, { FC, MouseEvent, useCallback, useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { BiLoaderCircle } from "react-icons/bi";
import { CopyMode } from "../../../devtools";
import { TransformCopyFn } from "../lib/hooks/useAiCopySuggestion";

const AICopySuggestor: FC<{
  parentElement: Element;
  setHTML: (html: string) => void;
  transformCopy: TransformCopyFn;
  transformedCopy: string | null;
  copy: string;
  loading: boolean;
}> = ({
  loading,
  parentElement,
  setHTML,
  copy: _copy,
  transformCopy,
  transformedCopy,
}) => {
  const [tone, setTone] = useState<"concise" | "energetic" | "humorous" | null>(
    null,
  );
  const [generatedCopy, setGeneratedCopy] = useState<string>("");
  const [copy, setCopy] = useState(_copy);

  // the existing human-readble copy from selected element
  useEffect(() => {
    setCopy(_copy);
  }, [_copy]);

  // the generated copy from the AI
  useEffect(() => {
    setGeneratedCopy(transformedCopy ?? "");
  }, [transformedCopy]);

  const generateCopy = useCallback(
    (mode: CopyMode) => async (e: MouseEvent<any>) => {
      e.stopPropagation();

      if (loading) return;

      setGeneratedCopy("");

      transformCopy(parentElement.innerHTML, mode);
    },
    [parentElement, loading, transformCopy, setGeneratedCopy],
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
    <div className="flex flex-col ml-4">
      <div className="bg-dark text-light flex flex-col">
        <div className="w-24 text-xs text-slate-400">
          Original copy
        </div>
        <div
          className={clsx(
            "text-slate-400",
            "text-ellipsis",
            "overflow-hidden",
            "text-sm",
            "bg-slate-900",
            "mr-4",
            "mt-2",
            "p-2",
            "rounded",
            "border",
            "border-slate-700",
            "z-20",
            "transition-colors",
            {
              "border-gb": tone,
            },
          )}
          style={{ flex: 2, maxHeight: "3rem" }}
        >
          {copy}
        </div>

        <div className="w-24 text-xs text-slate-400 mt-2 w-full relative">
          <div className="bg-dark relative z-20 inline-block">
            Make it more...
          </div>

          {/* top center */}
          <div
            className={clsx(
              "-top-2",
              "bottom-0",
              "inset-x-1/2",
              "absolute",
              "border-l",
              "border-slate-700",
              "transition-colors",
              {
                "border-gb": tone,
              },
            )}
            style={{ width: "1px", height: "13px", zIndex: 30 }}
          ></div>
          {/* left arm */}
          <div
            className={clsx(
              "z-10",
              "bottom-0",
              "absolute",
              "border-l",
              "border-t",
              "h-9",
              "border-slate-700",
              "rounded-l",
              "transition-colors",
              {
                "border-gb": tone === "concise",
              },
            )}
            style={{ width: "33%", top: "4px", left: "17%" }}
          ></div>
          {/* center arm */}
          <div
            className={clsx(
              "z-10",
              "bottom-0",
              "absolute",
              "border-l",
              "h-9",
              "border-slate-700",
              "transition-colors",
              {
                "border-gb": tone === "energetic",
              },
            )}
            style={{ width: "0px", top: "4px", left: "50%" }}
          ></div>
          {/* right arm */}
          <div
            className={clsx(
              "z-10",
              "bottom-0",
              "absolute",
              "border-r",
              "border-t",
              "border-slate-700",
              "h-9",
              "rounded-r",
              "transition-colors",
              {
                "border-gb": tone === "humorous",
              },
            )}
            style={{ width: "33%", top: "4px", left: "50%" }}
          ></div>
        </div>

        <div
          className="flex mr-4 mt-2 text-sm h-7 z-20"
          onMouseOut={() => !loading && setTone(null)}
        >
          <div
            className={clsx(
              "flex-1",
              "flex",
              "rounded-l",
              "bg-slate-700",
              "cursor-pointer",

              "transition-colors",
              {
                "logo-bg": tone === "concise",
              },
            )}
          >
            <button
              className={clsx(
                "bg-slate-900",
                "flex-1",
                "flex",
                "justify-center",
                "items-center",
                "rounded-l",
              )}
              style={{ margin: "1px" }}
              onClick={generateCopy("concise")}
              onMouseOver={() => !loading && setTone("concise")}
            >
              concise
            </button>
          </div>
          <div
            className={clsx(
              "flex-1",
              "flex",
              "bg-slate-700",
              "cursor-pointer",
              {
                "logo-bg": tone === "energetic",
              },
            )}
          >
            <button
              className={clsx(
                "bg-slate-900",
                "flex-1",
                "flex",
                "justify-center",
                "items-center",
              )}
              style={{ margin: "1px" }}
              onMouseOver={() => !loading && setTone("energetic")}
              onClick={generateCopy("energetic")}
            >
              energetic
            </button>
          </div>
          <div
            className={clsx(
              "flex-1",
              "flex",
              "bg-slate-700",
              "rounded-r",
              "cursor-pointer",
              {
                "logo-bg": tone === "humorous",
              },
            )}
          >
            <button
              className="bg-slate-900 flex-1 flex justify-center items-center rounded-r"
              style={{ margin: "1px" }}
              onMouseOver={() => !loading && setTone("humorous")}
              onClick={generateCopy("humorous")}
            >
              humorous
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className={clsx(
            "flex justify-center items-center transition-all",
            {
              "-mt-32": !loading,
              "mt-4": loading,
            },
          )}
        >
          <BiLoaderCircle className="animate-spin text-indigo-500" />
        </div>
      </div>

      <div className="overflow-hidden pr-4">
        <div
          className={clsx("transition-all", {
            "-mt-32": !generatedCopy,
            "mt-0": !!generatedCopy,
          })}
        >
          <div className="w-24 text-xs text-ai-label mt-2">
            Transformed{" "}
          </div>
          <TextareaAutosize
            className={clsx(
              "text-slate-200",
              "text-ellipsis",
              "overflow-hidden",
              "text-sm",
              "bg-slate-900",
              "w-full",
              "mt-2",
              "p-2",
              "rounded",
              "outline-none",
            )}
            style={{ flex: 2 }}
            value={generatedCopy}
            onChange={(e) => setGeneratedCopy(e.currentTarget.value)}
          />
          <button
            className={clsx(
              "p-2",
              "bg-indigo-800",
              "rounded",
              "text-white",
              "font-semibold",
              "text-sm",
              "mt-2",
            )}
            onClick={applyCopy}
          >
            Apply
          </button>
          <button className="ml-4 text-indigo-600" onClick={reset}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopySuggestor;
