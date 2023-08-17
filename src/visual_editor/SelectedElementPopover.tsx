import React from "react";
import * as Popover from "@radix-ui/react-popover";
import useFloatingAnchor from "./lib/hooks/useFloatingAnchor";

export default function SelectedElementPopover({
  parentElement,
}: {
  parentElement: Element | null;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const domRect = useFloatingAnchor(parentElement);

  if (!domRect) return null;

  const { top, left, width, height } = domRect;

  return (
    <>
      <Popover.Root defaultOpen>
        <Popover.Trigger asChild>
          <div
            ref={containerRef}
            className="gb-flex gb-justify-center gb-items-center gb-z-max"
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
          <Popover.Content side="right">
            <Popover.Close />
            <Popover.Arrow />
            <div className="gb-w-32 gb-h-32 gb-bg-indigo-700">testing</div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
}
