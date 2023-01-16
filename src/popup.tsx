import React from "react";
import ReactDOM from "react-dom";
import "./global.css";

const Popup = () => {
  return (
    <div className="w-96 p-4">
      <div className="text-2xl mb-4">GrowthBook DevTools v2</div>
      <ul className="list-disc pl-4 text-xl">
        <li>
          <a href="#" className="hover:underline">
            Enable visual editor by providing API Key
          </a>
        </li>
      </ul>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
