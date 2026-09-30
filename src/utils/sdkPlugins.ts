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

// Minifiers shorten names to a letter or two, which say nothing about what they were
export function isMinifiedName(name: string): boolean {
  return name.length <= 2;
}

// A custom plugin's own function name, when it has a meaningful one.
// Functions made with new Function() are called "anonymous"
export function customPluginName(name: string): string | undefined {
  const clean = name.replace(/^bound /, "");
  if (isMinifiedName(clean) || clean === "anonymous") return undefined;
  return clean;
}

// Globals keep their names through minification, so a call on one can't be an SDK method
const BUILT_IN_GLOBALS = new Set([
  "console",
  "window",
  "document",
  "globalThis",
  "self",
  "navigator",
  "location",
  "localStorage",
  "sessionStorage",
  "Math",
  "JSON",
  "Object",
  "Array",
  "Promise",
  "Date",
]);

// SDK methods a plugin's code calls. Method names survive minification, and
// checking against the live instance's methods drops everything else
export function pluginUses(source: string, sdkMethods: Set<string>): string[] {
  const uses = new Set<string>();
  for (const [, object, method] of source.matchAll(
    /([A-Za-z_$][\w$]*)?\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g,
  )) {
    if (object && BUILT_IN_GLOBALS.has(object)) continue;
    if (sdkMethods.has(method)) uses.add(method);
  }
  return [...uses];
}
