import React, { FC } from "react";
import { BiBrain, BiX } from "react-icons/bi";

const AICopySuggestor: FC<{ parentElement: Element }> = ({ parentElement }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { left, top } = parentElement.getBoundingClientRect();

  return (
    <div
      className="gb-fixed"
      style={{ top: top - 38, right: left }}
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      {isMenuOpen && (
        <>
          <div className="gb-absolute gb-bottom-9 gb-left-0 gb-text-white">
            <div className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110">
              Energetic
            </div>
            <div className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110">
              Concise
            </div>
            <div className="gb-text-sm gb-p-2 gb-bg-indigo-700 gb-mb-2 gb-font-semibold gb-rounded gb-cursor-pointer gb-transition-transform hover:gb-scale-110">
              Humorous
            </div>
          </div>
        </>
      )}
      <div className="gb-p-2 gb-logo-bg gb-text-white gb-text-lg gb-rounded-full gb-cursor-pointer gb-transition-transform hover:gb-scale-110">
        {isMenuOpen ? (
          <BiX className="w-6 h-6" />
        ) : (
          <BiBrain className="w-6 h-6" />
        )}
      </div>
    </div>
  );
};

export default AICopySuggestor;
