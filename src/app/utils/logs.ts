import { LogUnion } from "@growthbook/growthbook";

export interface FlattenedLogEvent {
  logType: string;
  timestamp: string;
  eventInfo: string;
  details: Record<string, unknown>;
  context: {
    source?: string;
    clientKey?: string;
  };
}
export type LogType = LogUnion["logType"];
export type LogUnionWithSource = LogUnion & {
  source?: string;
  clientKey?: string;
};

export function reshapeEventLog(evt: LogUnionWithSource): FlattenedLogEvent {
  switch (evt.logType) {
    case "event":
      return {
        logType: evt.logType,
        timestamp: evt.timestamp,
        eventInfo: evt.eventName,
        details: evt.properties || {},
        context: {
          source: evt.source,
          clientKey: evt.clientKey,
        },
      };
    case "experiment":
      return {
        logType: evt.logType,
        timestamp: evt.timestamp,
        eventInfo: evt.experiment.name || "",
        details: {
          experiment: evt.experiment,
          result: evt.result,
        },
        context: {
          source: evt.source,
          clientKey: evt.clientKey,
        },
      };
    case "feature":
      return {
        logType: evt.logType,
        timestamp: evt.timestamp,
        eventInfo: evt.featureKey,
        details: {
          featureKey: evt.featureKey,
          result: evt.result,
        },
        context: {
          source: evt.source,
          clientKey: evt.clientKey,
        },
      };
  }
}
