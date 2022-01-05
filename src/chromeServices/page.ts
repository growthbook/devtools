import type {Experiment, GrowthBook} from "@growthbook/growthbook";
import type {Message, RefreshMessage} from "../types";

declare global {
  interface Window {
    _growthbook?: GrowthBook;
  }
}

// Wait for window._growthbook to be available
function onGrowthBookLoad(cb: (gb: GrowthBook) => void) {
  if(window._growthbook) {
    console.log('window._growthbook already exists');
    cb(window._growthbook);
  }
  else {
    console.log('wait for gbloaded event');
    document.addEventListener("gbloaded", () => {
      console.log('gbloaded event fired');
      if(window._growthbook) {
        cb(window._growthbook);
      }
    }, false);
  }
}

// Send a refresh message back to content script
function requestRefresh() {
  onGrowthBookLoad((gb) => {
      let experiments: Record<string, Experiment> = {};
      gb.getAllResults().forEach((v, k) => {
        experiments[k] = v.experiment;
      });
    
      const msg: RefreshMessage = {
        type: "GB_REFRESH",
        attributes: gb.getAttributes(),
        features: gb.getFeatures(),
        experiments
      }
      console.log("Sending refresh from page", msg);
      window.postMessage(msg, '*');
  });
}

// Listen for events from content script
window.addEventListener("message", function(msg: MessageEvent<Message>) {
  const data = msg.data;
  //console.log("received message in page", data.type, data);
  if (data.type === "GB_REQUEST_REFRESH") {
    requestRefresh();
  }
  else if(data.type === "GB_SET_OVERRIDES") {
    onGrowthBookLoad((gb) => {
      console.log("setting overrides in window._growthbook")
      gb.setForcedFeatures(new Map(Object.entries(data.features || {})));
      gb.setForcedVariations(data.variations || {});
      gb.setAttributeOverrides(data.attributes || {});
    })
  }
});

// Request a refresh on load
requestRefresh();