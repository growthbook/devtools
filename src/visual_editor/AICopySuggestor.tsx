import React, { FC, MouseEvent, useCallback } from "react";
import { BiBrain, BiX, BiLoaderCircle } from "react-icons/bi";
import transformCopy, { type CopyMode } from "./lib/transformCopy";

const AICopySuggestor: FC<{
  parentElement: Element;
  setHTML: (html: string) => void;
}> = ({ parentElement, setHTML }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { left, top } = parentElement.getBoundingClientRect();

  const replaceCopy = useCallback(
    (mode: CopyMode) => async (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      setIsLoading(true);
      const newCopy = await transformCopy(parentElement.innerHTML, mode);
      if (!newCopy) {
        alert("Unable to generate new copy");
      } else {
        setHTML(newCopy);
      }
      setIsLoading(false);
    },
    [parentElement]
  );

  return (
    <div
      className="gb-fixed"
      style={{ top: top - 38, right: left }}
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      {isMenuOpen && (
        <>
          <div className="gb-absolute gb-bottom-9 gb-left-0 gb-text-white">
            <div
              className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110"
              onClick={replaceCopy("energetic")}
            >
              Energetic
            </div>
            <div
              className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110"
              onClick={replaceCopy("concise")}
            >
              Concise
            </div>
            <div
              className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110"
              onClick={replaceCopy("humorous")}
            >
              Humorous
            </div>
          </div>
        </>
      )}
      <div className="gb-p-2 gb-logo-bg gb-text-white gb-text-lg gb-rounded-full gb-cursor-pointer gb-transition-transform hover:gb-scale-110">
        {isMenuOpen ? (
          <BiX className="w-6 h-6" />
        ) : isLoading ? (
          <BiLoaderCircle className="w-6 h-6" />
        ) : (
          <BiBrain className="w-6 h-6" />
        )}
      </div>
    </div>
  );
};

export default AICopySuggestor;
