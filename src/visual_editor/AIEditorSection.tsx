import React, { FC } from "react";
import VisualEditorSection from "./VisualEditorSection";
import { TransformCopyFn } from "./lib/hooks/useApi";
import AICopySuggestor from "./AICopySuggestor";

const AIEditorSectionTitle: FC<{}> = () => (
  <div className="gb-ai-section-title gb-text-transparent">
    AI-Powered Copy Suggestion
  </div>
);

const AIEditorSection: FC<{
  parentElement: Element;
  setHTML: (html: string) => void;
  transformCopy: TransformCopyFn;
}> = ({ parentElement, setHTML, transformCopy }) => {
  return (
    <VisualEditorSection
      isCollapsible
      title={<AIEditorSectionTitle />}
      tooltip="Enhance your written content using GPT-powered AI. Transform human-readable text into any desired emotion effortlessly."
    >
      We got AI stuff up in here
      <AICopySuggestor
        parentElement={parentElement}
        setHTML={setHTML}
        transformCopy={transformCopy}
      />
    </VisualEditorSection>
  );
};

export default AIEditorSection;
