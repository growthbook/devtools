import { LogUnion } from "@growthbook/growthbook";
import { Box, Checkbox, Flex, Text } from "@radix-ui/themes";
import React, { ReactNode, useMemo, useState } from "react";
import useTabState from "../hooks/useTabState";
import { useSearch } from "../hooks/useSearch";
import SearchBar from "./SearchBar";
import { LogType, reshapeEventLog } from "../utils/logs";
import * as Accordion from "@radix-ui/react-accordion";
import { PiCaretRightFill, PiFlagFill, PiFlaskFill } from "react-icons/pi";
import ValueField from "./ValueField";
import clsx from "clsx";

export const HEADER_H = 40;

const filterCopy: Record<LogType, string> = {
  event: "Events",
  feature: "Features",
  experiment: "Experiments",
};

const responsiveCopy: Record<LogType, ReactNode> = {
  event: "Event",
  feature: <PiFlagFill />,
  experiment: <PiFlaskFill />,
};

export default function LogsList({
  logEvents,
  isResponsive,
  isTiny,
}: {
  logEvents: LogUnion[];
  isResponsive: boolean;
  isTiny: boolean;
}) {
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
    [filters, logEvents],
  );

  const reshapedEvents = useMemo(
    () => filteredLogEvents.map(reshapeEventLog),
    [filteredLogEvents],
  );

  const {
    items: events,
    searchInputProps,
    clear: clearSearch,
    SortableHeader,
  } = useSearch({
    items: reshapedEvents,
    defaultSortField: "timestamp",
  });

  const smTextSizeClass = isTiny ? "text-xs" : "text-sm";
  const xsTextSizeClass = isTiny ? "text-2xs" : "text-xs";
  const colWidth = isResponsive ? "40" : "20";

  return (
    <div className="flex flex-col w-full h-full">
      <div
        className="w-full flex items-center justify-between gap-4 px-3 border-b border-b-gray-a4 bg-surface text-xs font-semibold shadow-sm"
        style={{
          height: HEADER_H,
          zIndex: 2000,
        }}
      >
        <SearchBar
          flexGrow="0"
          className="inline-block"
          style={{ maxWidth: 200 }}
          autoFocus
          placeholder="Search Logs"
          searchInputProps={searchInputProps}
          clear={clearSearch}
        />
        <div className="flex flex-shrink gap-3">
          {(Object.entries(filterCopy) as Array<[LogType, string]>).map(
            ([filter, copy]) => (
              <Text as="label" size="1" key={filter}>
                <Flex gap="1" className="cursor-pointer select-none">
                  <Checkbox
                    variant="soft"
                    checked={filters.includes(filter)}
                    onCheckedChange={() => toggleFilter(filter)}
                  />
                  {!isResponsive ? copy : responsiveCopy[filter]}
                </Flex>
              </Text>
            ),
          )}
        </div>
      </div>
      <Flex
        className={clsx(
          "w-full items-center bg-gray-a2 shadow-sm uppercase text-gray-11 font-semibold",
          xsTextSizeClass,
        )}
        style={{ height: 35 }}
        px="4"
      >
        <SortableHeader
          field="timestamp"
          className={`w-[20%] min-w-[70px] px-1`}
        >
          Timestamp
        </SortableHeader>
        <SortableHeader field="logType" className={`w-[${colWidth}%] px-1`}>
          Log Type
        </SortableHeader>
        <SortableHeader field="eventInfo" className={`w-[${colWidth}%] px-1`}>
          Event Info
        </SortableHeader>
        {!isResponsive && <div className="w-[40%] pr-2">Event Details</div>}
      </Flex>
      <Box px="4" flexGrow={"1"} overflowY="auto">
        {!events.length && (
          <Box py="3">
            <em>No logs to display</em>
          </Box>
        )}
        <Accordion.Root
          className="accordion w-full"
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
                    className={clsx("w-full py-1", {
                      "border-t border-t-gray-4": i > 0,
                      smTextSizeClass,
                    })}
                  >
                    <div className="w-[20%] min-w-[70px] px-1 text-left text-nowrap text-ellipsis flex items-center">
                      <PiCaretRightFill className="caret mr-0.5" size={12} />
                      <Text className={xsTextSizeClass}>
                        {formattedDateTime}
                      </Text>
                    </div>
                    <div
                      className={clsx(
                        `w-[${colWidth}%]`,
                        "px-1",
                        "text-left",
                        "flex",
                        "items-center",
                        xsTextSizeClass,
                      )}
                    >
                      {evt.logType}
                    </div>
                    <div
                      className={clsx(
                        `w-[${colWidth}%]`,
                        "px-1",
                        "text-left",
                        "text-nowrap",
                        "text-ellipsis",
                        "line-clamp-1",
                        "overflow-hidden",
                        "flex",
                        "items-center",
                        xsTextSizeClass,
                      )}
                    >
                      {evt.eventInfo}
                    </div>
                    {!isResponsive && (
                      <div className="w-[40%] px-2 text-left">
                        <Text
                          className={clsx(
                            "text-nowrap text-gray-10 inline-block w-full overflow-auto",
                            xsTextSizeClass,
                          )}
                          style={{ scrollbarWidth: "none" }}
                        >
                          {JSON.stringify(evt.details)}
                        </Text>
                      </div>
                    )}
                  </Flex>
                </Accordion.Trigger>
                <Accordion.Content>
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
                </Accordion.Content>
              </Accordion.Item>
            );
          })}
        </Accordion.Root>
      </Box>
    </div>
  );
}
