import React, { FC, useEffect } from "react";
import { useApiEndpoint } from "../utils/hooks";

const FeaturesList: FC<{}> = () => {
  const { data, loading } = useApiEndpoint<{ features: Array<any> }>(
    "/features"
  );

  return (
    <div className="text-2xl flex flex-col">
      Features
      <div className="text-sm">
        {loading
          ? "Loading..."
          : data?.features.map((feature: any) => (
              <div key={feature.id}>{feature.id}</div>
            ))}
      </div>
    </div>
  );
};

export default FeaturesList;
