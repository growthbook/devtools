import React from "react";
import { FlattenedLogEvent } from "../utils/logs";
import * as Accordion from "@radix-ui/react-accordion";
import { Link } from "@radix-ui/themes";
import { PiCaretRightFill } from "react-icons/pi";
import ValueField from "./ValueField";

export default function LogCard({ logEvent }: { logEvent: FlattenedLogEvent }) {
  const { logType, timestamp, eventInfo, details } = logEvent;

  return (
    <Accordion.Root className="accordion mt-2" type="single" collapsible>
      <Accordion.Item value="debug-log">
        <Accordion.Trigger className="trigger mb-0.5">
          <Link size="2" role="button" className="hover:underline">
            <PiCaretRightFill className="caret mr-0.5" size={12} />
            Event details
          </Link>
        </Accordion.Trigger>
        <Accordion.Content className="accordionInner overflow-hidden w-full">
          <ValueField value={details} valueType="json" maxHeight={200} />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
