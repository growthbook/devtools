import React, {useEffect} from "react";

export default function LogsTab() {
  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div className="box mb-3">
      <div className="label lg">Event Logs</div>
      TODO
    </div>
  );
}
