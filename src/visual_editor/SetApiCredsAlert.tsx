import React, { FC } from "react";
import GBLogo from "../../public/logo192.png";

const SetApiCredsAlert: FC<{}> = () => (
  <div className="z-max fixed top-1 right-1 rounded bg-slate-700 text-white w-96">
    <div className="flex px-4 h-12 items-center justify-center logo-bg rounded">
      <div className="h-8">
        <img src={GBLogo} alt="GB Logo" className="w-auto h-full mr-1" />
      </div>
      <div className="font-semibold text-white">GrowthBook Visual Editor</div>
    </div>
    <div className="p-4">
      You need to set your API Key in order for the Visual Editor to work. Click
      the GrowthBook icon in the top right of your browser to open the options.
      Refresh the page afterwards.
    </div>
  </div>
);

export default SetApiCredsAlert;
