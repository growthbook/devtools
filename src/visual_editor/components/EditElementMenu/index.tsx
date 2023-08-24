import React from "react";
import { IconType } from "react-icons";
import { BsCodeSlash } from "react-icons/bs";
import { MdMoveUp } from "react-icons/md";
import FloatingMenu from "../FloatingMenu";

interface MenuItem {
  icon?: IconType;
  label: string;
  onSelect?: () => void;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
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
];

interface EditElementMenuProps {
  selectedElement: Element | null;
}

export default function EditElementMenu({
  selectedElement,
}: EditElementMenuProps) {
  if (!selectedElement) return null;
  return (
    <FloatingMenu
      title={selectedElement.tagName}
      anchorElement={selectedElement}
      menuItems={menuItems}
    />
  );
}
