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
export function setForcedFeatures(features: Map<string, any>) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.setForcedFeatures(features);
}
export function setForcedVariations(vars: Record<string, number>) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.setForcedVariations(vars);
}
export function setAttributeOverrides(overrides: Record<string, any>) {
  const gb = getGrowthBookInstance();
  if(!gb) return;
  gb.setAttributeOverrides(overrides);
}