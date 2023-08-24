import React, { useState } from "react";
import { BsCodeSlash } from "react-icons/bs";
import { MdMoveUp } from "react-icons/md";
import FloatingMenu from "../FloatingMenu";
import RearrangePopover from "./RearrangePopover";

interface EditElementMenuProps {
  selectedElement: Element | null;
}

export default function EditElementMenu({
  selectedElement,
}: EditElementMenuProps) {
  const [mode, setMode] = useState<"rearrange" | null>(null);

  if (!selectedElement) return null;

  return mode === "rearrange" ? (
    <RearrangePopover selectedElement={selectedElement} />
  ) : (
    <FloatingMenu
      key="default"
      title={selectedElement.tagName}
      anchorElement={selectedElement}
      menuItems={[
        {
          icon: BsCodeSlash,
          label: "Edit innerHTML",
          onSelect: () => {
            console.log("edit innerHTML");
          },
        },
        {
          icon: MdMoveUp,
          label: "Rearrange",
          onSelect: () => {
            console.log("rearrange");
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
