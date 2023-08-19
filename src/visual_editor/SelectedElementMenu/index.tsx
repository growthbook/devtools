import * as Dropdown from "@radix-ui/react-dropdown-menu";
import React from "react";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";
import Menu from "./Menu";

export default function SelectedElementMenu({
  selectedElement,
}: {
  selectedElement: Element | null;
  clearSelectedElement: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const domRect = useFloatingAnchor(selectedElement);

  if (!domRect) return null;

  const { top, left, width, height } = domRect;

  return (
    <>
      <Dropdown.Root defaultOpen modal={false}>
        <Dropdown.Trigger asChild>
          <div
            ref={containerRef}
            className="gb-z-max"
            style={{
              position: "fixed",
              top,
              left,
              width,
              height,
            }}
          />
        </Dropdown.Trigger>
        <Dropdown.Portal container={containerRef.current}>
          <Dropdown.Content
            side="right"
            sideOffset={8}
            align="start"
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <Menu selectedElement={selectedElement} />
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </>
  );
}
