import { GrowthBook } from "@growthbook/growthbook";

declare global {
  interface Window {
    _growthbook?: GrowthBook;
  }
}

function getGrowthBookInstance(): GrowthBook|null {
  return window._growthbook ?? null;
}

export function whenGrowthBookExists(callback: () => void) {
  let cancel = false;
  let timer: number;
  const cb = () => {
    if (cancel) return;
    if (getGrowthBookInstance()) {
      callback();
    } else {
      timer = window.setTimeout(cb, 200);
    }
  };
  cb();

  return () => {
    cancel = true;
    clearTimeout(timer);
  };
}

export function getAttributes() {
  const gb = getGrowthBookInstance();
  return gb ? gb.getAttributes() : {};
}

export function getFeatures() {
  const gb = getGrowthBookInstance();
  return gb ? gb.getFeatures() : {};
}

export function getExperimentResults() {
  const gb = getGrowthBookInstance();
  return gb ? gb.getAllResults() : new Map();
}

export function getForcedFeatures() {
  const gb = getGrowthBookInstance();
  return gb ? gb.getForcedFeatures() : new Map();
}

export function revertForcedFeature(key: string) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.unforceFeature(key);
}

export function setAttributes(attributes: Record<string, any>) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.setAttributes(attributes);
}

export function forceVariation(key: string, variation: number) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.forceVariation(key, variation);
}

export function forceFeatureValue(key: string, value: any) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.forceFeature(key, value);
}

