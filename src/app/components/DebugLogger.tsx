import { DebugLog } from "devtools";
import React, { useState } from "react";
import { Link } from "@radix-ui/themes";
import ValueField from "@/app/components/ValueField";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill } from "react-icons/pi";

export default function DebugLogger({
  logs,
  startCollapsed = true,
  showContext = true,
}: {
  logs: DebugLog[];
  startCollapsed?: boolean;
  showContext?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(startCollapsed);

  return (
    <div>
      <div className="flex items-end text-xs mb-2">
        <span>Debug log</span>
        <Link
          size="1"
          role="button"
          className="hover:underline ml-2 -mb-1"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCollapsed(!collapsed);
          }}
        >
          {collapsed ? "Show" : "Hide"}
        </Link>
      </div>
      {!collapsed && (
        <div className="text-xs border border-slate-a4 rounded-sm bg-slate-2 py-1 px-3">
          {logs.map((log, i) => {
            return (
              <div className="my-1">
                <div className="py-1 px-2 font-mono text-indigo-11 border-l-2 border-l-indigo-6">
                  {log[0]}
                </div>
                {showContext && Object.keys(log?.[1] || {}).length ? (
                  <div className="py-1 pl-2 pr-2 text-2xs">
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
                        <Accordion.Content className="accordionInner overflow-hidden w-full py-2">
                          <ValueField value={log[1]} valueType="json" />
                        </Accordion.Content>
                      </Accordion.Item>
                    </Accordion.Root>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
