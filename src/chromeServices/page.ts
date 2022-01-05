import type {Experiment, GrowthBook} from "@growthbook/growthbook";
import type {Message, RefreshMessage} from "../types";

declare global {
  interface Window {
    _growthbook?: GrowthBook;
  }
}

function getValidGrowthBookInstance() {
  if(!window._growthbook) return;
  if(!window._growthbook.setAttributeOverrides) {
    console.error("GrowthBook devtools requires a newer version of the javascript or React SDK");
    return;
  }
  return window._growthbook;
}

// Wait for window._growthbook to be available
function onGrowthBookLoad(cb: (gb: GrowthBook) => void) {
  const gb = getValidGrowthBookInstance();
  if(gb) {
    //console.log('window._growthbook already exists');
    cb(gb);
  }
  else {
    //console.log('wait for gbloaded event');
    document.addEventListener("gbloaded", () => {
      //console.log('gbloaded event fired');
      const gb = getValidGrowthBookInstance();
      if(gb) {
        cb(gb);
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
      //console.log("Sending refresh from page", msg);
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
      //console.log("setting overrides in window._growthbook")
      gb.setForcedFeatures(new Map(Object.entries(data.features || {})));
      gb.setForcedVariations(data.variations || {});
      gb.setAttributeOverrides(data.attributes || {});
    })
  }
});

// Request a refresh on load
requestRefresh();