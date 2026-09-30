import React from "react";
import { Tooltip } from "@radix-ui/themes";
import { MissingAttribute } from "@/utils/missingAttributes";

const MAX_LISTED = 3;

function listNames(names: string[]) {
  const shown = names.slice(0, MAX_LISTED).join(", ");
  const rest = names.length - MAX_LISTED;
  return rest > 0 ? `${shown} and ${rest} more` : shown;
}

export function NotSetBadge({
  reason = "Not set for the current user",
}: {
  reason?: string;
}) {
  return (
    <Tooltip content={reason}>
      <span className="ml-1 rounded px-1 text-2xs font-normal bg-amber-a3 text-amber-11 align-middle whitespace-nowrap">
        not set
      </span>
    </Tooltip>
  );
}

export function MissingAttributesList({
  missing,
}: {
  missing: MissingAttribute[];
}) {
  return (
    <ul className="mt-1">
      {missing.map(({ attribute, features, hashFor }) => (
        <li key={attribute} className="mb-0.5">
          <code className="font-semibold">{attribute}</code>
          {hashFor.length ? (
            <span> needed to bucket users into {listNames(hashFor)}.</span>
          ) : null}
          {features.length ? (
            <span> Targeted by {listNames(features)}.</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
