import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BiChevronRight } from "react-icons/bi";
export default function SelectedElementPopoverMenu({
  selectedElement,
}: {
  selectedElement: Element | null;
}) {
  if (!selectedElement) return null;
  const tagName = selectedElement.tagName;
  return (
    <div
      className="gb-relative gb-bg-white gb-rounded gb-shadow gb-overflow-hidden gb-text-sm"
      style={{ minWidth: "12rem" }}
    >
      <div className="gb-text-white gb-bg-gray-700 gb-py-2 gb-px-4">
        {tagName}
      </div>
      <DropdownMenu.Item>
        <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
          Edit innerHTML
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item>
        <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
          Rearrange
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Item>
        <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
          Other Action
        </div>
      </DropdownMenu.Item>
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger className="DropdownMenuSubTrigger">
          <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer gb-flex gb-justify-between">
            Select Parent
            <BiChevronRight />
          </div>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          <DropdownMenu.Item className="DropdownMenuItem">
            <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
              div
            </div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="DropdownMenuItem">
            <div className="gb-text-gray-700 gb-bg-white  gb-py-2 gb-px-4 gb-cursor-pointer">
              div
            </div>
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    </div>
  );
}
