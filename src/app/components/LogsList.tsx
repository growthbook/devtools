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
import {PiCaretRightFill, PiFlagFill, PiFlaskFill} from "react-icons/pi";
import ValueField from "./ValueField";
import clsx from "clsx";
import {MW} from "@/app";

export const HEADER_H = 40;

const filterCopy: Record<LogType, string> = {
  event: "Events",
  feature: "Features",
  experiment: "Experiments",
  debug: "Debug",
};

const responsiveCopy = {
  event: "Event",
  feature: (<PiFlagFill />),
  experiment: (<PiFlaskFill />),
  debug: "Debug"
}

export default function LogsList({
  logEvents,
  isResponsive,
}: {
  logEvents: LogUnion[];
  isResponsive: boolean;
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
    [filters, logEvents]
  );

  const reshapedEvents = useMemo(
    () => filteredLogEvents.map(reshapeEventLog),
    [filteredLogEvents]
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

  return (
    <div className="flex flex-col w-full h-full">
      <div
        className="w-full flex items-center justify-between gap-4 px-3 border-b border-b-slate-4 bg-white text-xs font-semibold shadow-sm"
        style={{
          height: HEADER_H,
          zIndex: 2000,
        }}
      >
        <SearchBar
          flexGrow="0"
          className="inline-block"
          style={{maxWidth: 200}}
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
            )
          )}
        </div>
      </div>
      <Flex
        className={clsx("w-full items-center bg-slate-a2 shadow-sm uppercase text-slate-11 font-semibold", {
          "text-xs": !isResponsive,
          "text-2xs": isResponsive,
        })}
        style={{height: 35}}
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
                ? date.toLocaleTimeString(undefined, {hourCycle: "h24"})
                : date.toLocaleString(undefined, {hourCycle: "h24"});
            const isExpanded = expandedItems.has(i.toString());
            return (
              <Accordion.Item key={i} value={i.toString()}>
                <Accordion.Trigger className="trigger w-full mb-0.5">
                  <Flex
                    className={clsx("w-full py-1", {
                        "border-t border-t-slate-200": i > 0,
                        "text-sm": !isResponsive,
                        "text-xs": isResponsive
                      }
                    )}
                  >
                    <div className="w-[20%] px-1 text-left">
                      <PiCaretRightFill className="caret mr-0.5" size={12}/>
                      <Text className={clsx({
                        "text-xs": !isResponsive,
                        "text-2xs": isResponsive
                      })}>{formattedDateTime}</Text>
                    </div>
                    <div
                      className={clsx("w-[20%] px-1 text-left", {
                        "text-xs": !isResponsive,
                        "text-2xs": isResponsive
                      })}
                    >
                      {evt.logType}
                    </div>
                    <div
                      className={clsx(
                        "w-[20%]",
                        "px-1",
                        "text-left",
                        isExpanded ? "" : "line-clamp-1",
                        {
                          "text-xs": !isResponsive,
                          "text-2xs": isResponsive
                        }
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
                          className={clsx("text-ellipsis line-clamp-1 overflow-hidden text-slate-9", {
                            "text-xs": !isResponsive,
                            "text-2xs": isResponsive
                          })}
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
    </div>
  );
}
