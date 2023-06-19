import React, { FC, ReactNode } from "react";
import VisualEditorSection from "./VisualEditorSection";

const AIEditorSectionTitle: FC<{}> = () => (
  <div className="gb-ai-section-title gb-text-transparent">
    AI-Powered Copy Suggestion
  </div>
);

const AIEditorSection: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <VisualEditorSection
      isCollapsible
      title={<AIEditorSectionTitle />}
      tooltip="Enhance your written content using GPT-powered AI. Transform human-readable text into any desired emotion effortlessly."
    >
      {children}
    </VisualEditorSection>
  );
};

export default AIEditorSection;
