import React, {useEffect} from "react";

export default function LogsTab() {
  useEffect(() => window.scrollTo({ top: 0 }), []);

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="label lg mb-2">Event Logs</div>
      <div className="box mb-3">
        TODO
      </div>
    </div>
  );
}
