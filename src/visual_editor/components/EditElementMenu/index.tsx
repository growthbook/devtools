import React from "react";
import { BsCodeSlash } from "react-icons/bs";
import { MdMoveUp } from "react-icons/md";
import FloatingMenu from "../FloatingMenu";
import { VisualEditorMode } from "../Toolbar";

interface EditElementMenuProps {
  mode: VisualEditorMode;
  setMode: (mode: VisualEditorMode) => void;
  selectedElement: Element | null;
}

export default function EditElementMenu({
  selectedElement,
  setMode,
}: EditElementMenuProps) {
  if (!selectedElement) return null;

  return (
    <FloatingMenu
      key="default"
      title={selectedElement.tagName}
      anchorElement={selectedElement}
      menuItems={[
        {
          icon: BsCodeSlash,
          label: "Edit innerHTML",
          onSelect: () => {
            setMode("edit-innerHtml");
          },
        },
        {
          icon: MdMoveUp,
          label: "Rearrange",
          onSelect: () => {
            setMode("rearrange");
          },
        },
        {
          label: "Select parent",
          children: [
            {
              label: "div",
              onSelect: () => {
                console.log("select parent div");
              },
            },
            {
              label: "div",
              onSelect: () => {
                console.log("select parent div");
              },
            },
          ],
        },
      ]}
    />
  );
}
