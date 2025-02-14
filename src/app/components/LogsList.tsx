import { LogUnion } from "@growthbook/growthbook";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Text,
} from "@radix-ui/themes";
import React, { useMemo, useState } from "react";
import useTabState from "../hooks/useTabState";
import { useSearch } from "../hooks/useSearch";
import SearchBar from "./SearchBar";
import { LogType, reshapeEventLog } from "../utils/logs";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill } from "react-icons/pi";
import ValueField from "./ValueField";
import clsx from "clsx";

const filterCopy: Record<LogType, string> = {
  event: "Events",
  feature: "Features",
  experiment: "Experiments",
  debug: "Debug",
};

export default function LogsList({ logEvents }: { logEvents: LogUnion[] }) {
  const [filters, setFilters] = useTabState<LogType[]>("logTypeFilter", [
    "event",
    "experiment",
    "feature",
  ]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleFilter = (filter: LogType) => {
    if (filters.includes(filter)) {
      setFilters(filters.filter((existingFilter) => existingFilter !== filter));
    } else {
      setFilters([...filters, filter]);
    }
  };

  const filteredLogEvents = useMemo(
    () => logEvents.filter((evt) => filters.includes(evt.logType)),
    [filters, logEvents]
  );

  const reshapedEvents = useMemo(
    () => filteredLogEvents.map(reshapeEventLog),
    [filteredLogEvents]
  );

  const {
    items: events,
    searchInputProps,
    SortableHeader,
  } = useSearch({
    items: reshapedEvents,
    defaultSortField: "timestamp",
  });

  return (
    <Flex direction="column" className="w-full" style={{ height: "100%" }}>
      <Flex
        align="center"
        mt="2"
        px="4"
        className="border-b border-b-slate-200"
      >
        <SearchBar flexGrow="0" autoFocus searchInputProps={searchInputProps} />
        <Flex
          ml="auto"
          gapX="4"
          gapY="1"
          wrap={{
            initial: "wrap",
            md: "nowrap",
          }}
        >
          {(Object.entries(filterCopy) as Array<[LogType, string]>).map(
            ([filter, copy]) => (
              <Text as="label" size="2" key={filter}>
                <Flex gap="1">
                  <Checkbox
                    checked={filters.includes(filter)}
                    onCheckedChange={() => toggleFilter(filter)}
                  />
                  {copy}
                </Flex>
              </Text>
            )
          )}
        </Flex>
      </Flex>
      <Flex
        className="w-full items-center bg-slate-a2 shadow-sm uppercase text-slate-11  text-xs font-semibold "
        style={{ height: 35 }}
        px="4"
      >
        <SortableHeader field="timestamp" className="w-[20%] px-1">
          Timestamp
        </SortableHeader>
        <SortableHeader field="logType" className="w-[20%] px-1">
          Log Type
        </SortableHeader>
        <SortableHeader field="eventInfo" className="w-[20%] px-1">
          Event Info
          {/* TODO: tooltip? */}
        </SortableHeader>
        <div className="w-[40%] pr-2">Event Details</div>
      </Flex>
      <Box px="4" flexGrow={"1"} overflowY="auto">
        {!events.length && (
          <Box py="3">
            <em>No logs to display</em>
          </Box>
        )}
        <Accordion.Root
          className="accordion"
          type="multiple"
          value={[...expandedItems]}
          onValueChange={(newValues) => setExpandedItems(new Set(newValues))}
        >
          {events.map((evt, i) => {
            const timestamp = parseInt(evt.timestamp);
            const date = new Date(timestamp);
            const formattedDateTime =
              date.toLocaleDateString() === new Date().toLocaleDateString()
                ? date.toLocaleTimeString(undefined, { hourCycle: "h24" })
                : date.toLocaleString(undefined, { hourCycle: "h24" });
            const isExpanded = expandedItems.has(i.toString());
            return (
              <Accordion.Item key={i} value={i.toString()}>
                <Accordion.Trigger className="trigger w-full mb-0.5">
                  <Flex
                    className={clsx(
                      "w-full",
                      i > 0 ? "border-t border-t-slate-200" : "",
                      "py-1",
                      "text-sm"
                    )}
                  >
                    <div className="w-[20%] px-1 text-left">
                      <PiCaretRightFill className="caret mr-0.5" size={12} />
                      <Text className="text-xs">{formattedDateTime}</Text>
                    </div>
                    <div className="w-[20%] px-1 text-left">{evt.logType}</div>
                    <div
                      className={clsx(
                        "w-[20%]",
                        "px-1",
                        "text-left",
                        isExpanded ? "" : "line-clamp-1"
                      )}
                    >
                      {evt.eventInfo}
                    </div>
                    <div className="w-[40%] px-2 text-left">
                      {isExpanded ? (
                        <ValueField
                          value={evt.details}
                          valueType="json"
                          jsonStringifySpaces={2}
                          maxHeight={120}
                          customPrismOuterStyle={{
                            border: "none",
                            borderRadius: "unset",
                            background: "transparent",
                          }}
                        />
                      ) : (
                        <Text
                          size="2"
                          className="text-ellipsis line-clamp-1 overflow-hidden text-slate-9"
                        >
                          {JSON.stringify(evt.details)}
                        </Text>
                      )}
                    </div>
                  </Flex>
                </Accordion.Trigger>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </Box>
    </Flex>
  );
}
