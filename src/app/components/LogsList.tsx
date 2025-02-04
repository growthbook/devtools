import { LogUnion } from "@growthbook/growthbook";
import { Badge, Button, Container } from "@radix-ui/themes";
import React, { useMemo } from "react";
import useTabState from "../hooks/useTabState";
import LogCard from "./LogCard";

export type LogFilter = LogUnion["logType"];
const filterCopy: Record<LogFilter, string> = {
  debug: "Debug events",
  event: "Log events",
  feature: "Feature tracking callbacks",
  experiment: "Experiment tracking callbacks",
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
        {(Object.entries(filterCopy) as Array<[LogFilter, string]>).map(
          ([filter, copy]) => (
            <Button
              key={filter}
              variant={filters.includes(filter) ? "solid" : "outline"}
              onClick={() => toggleFilter(filter)}
            >
              {copy}
              <Badge>{logTypeCounts[filter]}</Badge>
            </Button>
          )
        )}
      </Container>
      {filteredLogEvents.map((evt, i) => {
        return (
          <div key={i}>
            <LogCard logEvent={evt} />
          </div>
        );
      })}
    </div>
  );
}
