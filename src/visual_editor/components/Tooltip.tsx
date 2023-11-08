import React, { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { shadowRoot } from "..";

const Tooltip = ({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        {/* @ts-expect-error */}
        <RadixTooltip.Portal container={shadowRoot}>
          <RadixTooltip.Content sideOffset={5} asChild>
            <div className="gb-z-max gb-bg-white gb-text-xs gb-rounded gb-px-2 gb-py-1 gb-shadow-md">
              {label}
              <RadixTooltip.Arrow className="gb-fill-white" />
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
