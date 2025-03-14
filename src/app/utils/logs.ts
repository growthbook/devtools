import { LogUnion } from "@growthbook/growthbook";

export interface FlattenedLogEvent {
  timestamp: string;
  logType: string;
  eventInfo: string;
  details: Record<string, unknown>;
  source?: string;
}
export type LogType = LogUnion["logType"];
export type LogUnionWithSource = LogUnion & { source?: string };

export function reshapeEventLog(evt: LogUnionWithSource): FlattenedLogEvent {
  switch (evt.logType) {
    case "event":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.eventName,
        details: evt.properties || {},
        source: evt.source,
      };
    case "experiment":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.experiment.name || "",
        details: {
          experiment: evt.experiment,
          result: evt.result,
        },
        source: evt.source,
      };
    case "feature":
      return {
        timestamp: evt.timestamp,
        logType: evt.logType,
        eventInfo: evt.featureKey,
        details: {
          featureKey: evt.featureKey,
          result: evt.result,
        },
        source: evt.source,
      };
  }
}
