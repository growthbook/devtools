import clsx from "clsx";
import React, { FC, ReactNode } from "react";
import VisualEditorSection from "./VisualEditorSection";

const AIEditorSectionTitle: FC<{}> = () => (
  <div className="ai-section-title text-transparent">
    AI-Powered Copy Suggestion
  </div>
);

const AIEditorSection: FC<{
  isVisible: boolean;
  children: ReactNode;
}> = ({ children, isVisible }) => {
  return (
    <div className="overflow-hidden">
      <div
        className={clsx("transition-all", "duration-500", {
          "-mt-12": !isVisible,
          "mt-0": isVisible,
          "delay-500": isVisible,
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
