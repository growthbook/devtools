import { DebugLog } from "devtools";
import React, { useState } from "react";
import { Link } from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill } from "react-icons/pi";
import clsx from "clsx";

export default function DebugLogger({
  logs,
  startCollapsed = true,
  showContext = true,
}: {
  logs?: DebugLog[];
  startCollapsed?: boolean;
  showContext?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  return (
    <div>
      <div className="flex items-end text-xs mb-1">
        <Link
          size="2"
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCollapsed(!collapsed);
          }}
        >
          <PiCaretRightFill className={clsx("caret mr-0.5", { "open": !collapsed})} size={12}/>
          Debug log
        </Link>
      </div>
      {!collapsed && (
        <div className="text-xs border border-slate-a3 rounded-sm bg-neutral-50 py-1 px-2">
          {logs?.length ? logs.map((log, i) => {
            return (
              <div className="my-0.5">
                <DebugMessage message={log[0]}/>
                {showContext && Object.keys(log?.[1] || {}).length ? (
                  <div className="py-0.5 mb-1 pl-2 text-2xs border-l-2 border-l-slate-900/20">
                    <Accordion.Root
                      className="accordion"
                      type="single"
                      collapsible
                    >
                      <Accordion.Item value="debug-log">
                        <Accordion.Trigger className="trigger mb-0.5">
                          <Link
                            size="1"
                            role="button"
                            className="hover:underline"
                          >
                            <PiCaretRightFill
                              className="caret mr-0.5"
                              size={12}
                            />
                            context
                          </Link>
                        </Accordion.Trigger>
                        <Accordion.Content className="accordionInner overflow-hidden w-full">
                          <ValueField value={log[1]} valueType="json"/>
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>
                  </div>
                ) : null}
              </div>
            );
          }) : (
            <em className="text-2xs">No logs found</em>
          )}
        </div>
      )}
    </div>
  );
}

export function DebugMessage({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={clsx("px-2 font-mono text-semibold text-slate-12 border-l-2 border-l-slate-900/20 leading-4", className)}>
      {message}
    </div>
  );
}
