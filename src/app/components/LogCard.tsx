import { LogUnion } from "@growthbook/growthbook";
import React from "react";
import { Text } from "@radix-ui/themes";

export default function LogCard({ logEvent }: { logEvent: LogUnion }) {
  const { logType, timestamp, ...rest } = logEvent;
  return (
    <div className="box mb-3">
      <Text>Timestamp: {timestamp}</Text>
      <div>{JSON.stringify(rest)}</div>
    </div>
  );
}
