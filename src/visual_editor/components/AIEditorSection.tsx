import clsx from "clsx";
import React, { FC, ReactNode } from "react";
import VisualEditorSection from "./VisualEditorSection";

const AIEditorSectionTitle: FC<{}> = () => (
  <div className="gb-ai-section-title gb-text-transparent">
    AI-Powered Copy Suggestion
  </div>
);

const AIEditorSection: FC<{
  isVisible: boolean;
  children: ReactNode;
}> = ({ children, isVisible }) => {
  return (
    <div className="gb-overflow-hidden">
      <div
        className={clsx("gb-transition-all", "gb-duration-500", {
          "-gb-mt-12": !isVisible,
          "gb-mt-0": isVisible,
          "gb-delay-500": isVisible,
        })}
      >
        {isVisible && (
          <VisualEditorSection
            isCollapsible
            title={<AIEditorSectionTitle />}
            tooltip="Enhance your written content using GPT-powered AI. Transform human-readable text into any desired emotion effortlessly."
          >
            {children}
          </VisualEditorSection>
        )}
      </div>
    </div>
  );
};

export default AIEditorSection;
