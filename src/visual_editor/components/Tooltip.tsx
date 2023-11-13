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
            <div className="gb-z-max gb-bg-slate-700 gb-text-xs gb-text-slate-300 gb-rounded gb-px-4 gb-py-2 gb-shadow-lg gb-max-w-sm">
              {label}
              <RadixTooltip.Arrow className="gb-fill-slate-700" />
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
