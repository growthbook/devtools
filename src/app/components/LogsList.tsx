import { LogUnion } from "@growthbook/growthbook";
import { Badge, Button, Container, Flex, Text } from "@radix-ui/themes";
import React, { useMemo } from "react";
import useTabState from "../hooks/useTabState";
import LogCard from "./LogCard";
import { useSearch } from "../hooks/useSearch";
import SearchBar from "./SearchBar";

export type LogFilter = LogUnion["logType"];
const filterCopy: Record<LogFilter, string> = {
  event: "Events",
  feature: "Features",
  experiment: "Experiments",
  debug: "Debug",
};

export default function LogsList({ logEvents }: { logEvents: LogUnion[] }) {
  const [filters, setFilters] = useTabState<LogFilter[]>("logFilter", [
    "event",
    "experiment",
    "feature",
  ]);

  const toggleFilter = (filter: LogFilter) => {
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

  const {
    items: events,
    searchInputProps,
    SortableTH,
  } = useSearch({
    items: filteredLogEvents,
    defaultSortField: "timestamp",
  });

  const logTypeCounts = useMemo(() => {
    const counts: Record<LogFilter, number> = {
      debug: 0,
      event: 0,
      experiment: 0,
      feature: 0,
    };
    logEvents.forEach((evt) => {
      counts[evt.logType] += 1;
    });
    return counts;
  }, [logEvents]);

  return (
    <div>
      <Container mb="1">
        <div className="label md mb-2">Filter logs</div>
        <Flex align="center">
          <SearchBar
            flexGrow="0"
            autoFocus
            searchInputProps={searchInputProps}
          />
          <Flex justify="between">
            {(Object.entries(filterCopy) as Array<[LogFilter, string]>).map(
              ([filter, copy]) => (
                <Button
                  key={filter}
                  variant={filters.includes(filter) ? "solid" : "outline"}
                  onClick={() => toggleFilter(filter)}
                  mx="1"
                  size="1"
                >
                  {copy}
                  <Badge>{logTypeCounts[filter]}</Badge>
                </Button>
              )
            )}
          </Flex>
        </Flex>
      </Container>
      <table style={{ borderSpacing: "4px", borderCollapse: "separate" }}>
        <thead>
          <tr>
            <SortableTH field="timestamp" className="font-normal">
              <Text>Timestamp</Text>
            </SortableTH>
            <SortableTH field="logType" className="font-normal">
              <Text wrap="nowrap">Log Type</Text>
            </SortableTH>
            <th className="font-normal">Event</th>
          </tr>
        </thead>
        <tbody>
          {events.map((evt, i) => {
            const timestamp = parseInt(evt.timestamp);
            const date = new Date(timestamp);
            const formattedDateTime =
              date.toLocaleDateString() === new Date().toLocaleDateString()
                ? date.toLocaleTimeString(undefined, { hourCycle: "h24" })
                : date.toLocaleString(undefined, { hourCycle: "h24" });
            return (
              <tr className="text-xs" key={i}>
                <td>
                  <Text>{formattedDateTime}</Text>
                </td>
                <td>
                  <Text>{evt.logType}</Text>
                </td>
                <td>
                  <LogCard key={i} logEvent={evt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
