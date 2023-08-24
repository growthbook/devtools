import React, { useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import useFloatingAnchor from "../lib/hooks/useFloatingAnchor";

export default function FloatingPopover({
  anchorElement,
  title,
  children,
}: {
  anchorElement: Element | null;
  title: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const domRect = useFloatingAnchor(anchorElement);

  if (!domRect) return null;

  const { top, left, width, height } = domRect;
  return (
    <Popover.Root defaultOpen open={!!anchorElement} modal={false}>
      <Popover.Trigger asChild>
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
      </Popover.Trigger>
      <Popover.Portal container={containerRef.current}>
        <Popover.Content side="right" sideOffset={8} align="start">
          <Popover.Close />
          <Popover.Arrow />
          <div
            className="gb-relative gb-bg-white gb-rounded gb-shadow gb-overflow-hidden gb-text-sm"
            style={{ minWidth: "12rem" }}
          >
            <div className="gb-text-white gb-bg-gray-700 gb-py-2 gb-px-4">
              {title}
            </div>
            <div className="gb-text-gray-700 gb-bg-white gb-py-2 gb-px-4">
              {children}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
