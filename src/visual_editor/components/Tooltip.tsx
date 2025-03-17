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
            <div className="z-max bg-slate-700 text-xs text-slate-300 rounded px-4 py-2 shadow-lg max-w-sm">
              {label}
              <RadixTooltip.Arrow className="fill-slate-700" />
            </div>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
