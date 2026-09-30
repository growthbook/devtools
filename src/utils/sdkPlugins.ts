// String literals from each SDK plugin's returned function; they survive minification
const PLUGIN_MARKERS: [name: string, matches: (source: string) => boolean][] = [
  [
    "growthbookTrackingPlugin",
    (s) => s.includes("clientKey must be specified to use event logging"),
  ],
  ["thirdPartyTrackingPlugin", (s) => isThirdPartyTrackingSource(s)],
  ["autoAttributesPlugin", (s) => s.includes("growthbookrefresh")],
  [
    "devtoolsPlugin",
    (s) =>
      s.includes("devtoolsPlugin can only be set on a user-scoped instance"),
  ],
];

export function identifyPlugin(source: string): string | undefined {
  return PLUGIN_MARKERS.find(([, matches]) => matches(source))?.[0];
}

// "experiment_viewed" alone is a common GA event name, but only the plugin checks for a "gtm" tracker
export function isThirdPartyTrackingSource(source: string): boolean {
  return source.includes("experiment_viewed") && /["'`]gtm["'`]/.test(source);
}

// A custom plugin's own function name, when it has a meaningful one. Minifiers shorten names
// to a letter or two, and functions made with new Function() are called "anonymous"
export function customPluginName(name: string): string | undefined {
  const clean = name.replace(/^bound /, "");
  if (clean.length <= 2 || clean === "anonymous") return undefined;
  return clean;
}
