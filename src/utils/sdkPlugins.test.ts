import {
  autoAttributesPlugin,
  growthbookTrackingPlugin,
  thirdPartyTrackingPlugin,
} from "@growthbook/growthbook/plugins";
import {
  customPluginName,
  identifyPlugin,
  isMinifiedName,
  pluginUses,
  isThirdPartyTrackingSource,
} from "./sdkPlugins";

const source = (fn: (...args: any[]) => any) =>
  Function.prototype.toString.call(fn);

describe("identifyPlugin", () => {
  // The browser-only factories check for window and touch document on creation
  beforeAll(() => {
    Object.assign(globalThis, {
      window: {},
      document: { addEventListener: () => {}, title: "", cookie: "" },
    });
  });
  afterAll(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  // These run against the SDK's real plugin functions, so a marker the SDK
  // drops or renames fails here rather than in the field
  it("recognises the SDK's own plugins", () => {
    expect(identifyPlugin(source(growthbookTrackingPlugin()))).toBe(
      "growthbookTrackingPlugin",
    );
    expect(identifyPlugin(source(thirdPartyTrackingPlugin()))).toBe(
      "thirdPartyTrackingPlugin",
    );
    expect(identifyPlugin(source(autoAttributesPlugin()))).toBe(
      "autoAttributesPlugin",
    );
  });

  it("returns undefined for a custom plugin", () => {
    expect(
      identifyPlugin(
        source((gb: { setAttributes: (a: object) => void }) =>
          gb.setAttributes({ plan: "pro" }),
        ),
      ),
    ).toBeUndefined();
  });
});

describe("isThirdPartyTrackingSource", () => {
  it("doesn't mistake a hand-written GA callback for the plugin", () => {
    const custom = (e: { key: string }) =>
      (window as any).gtag("event", "experiment_viewed", {
        experiment_id: e.key,
      });
    expect(isThirdPartyTrackingSource(source(custom))).toBe(false);
  });
});

describe("customPluginName", () => {
  it("uses a plugin's own function name", () => {
    function sessionPlugin() {}
    expect(customPluginName(sessionPlugin.name)).toBe("sessionPlugin");
    expect(customPluginName(sessionPlugin.bind(null).name)).toBe(
      "sessionPlugin",
    );
  });

  it("treats anonymous and minified names as unnamed", () => {
    expect(customPluginName("")).toBeUndefined();
    expect(customPluginName("e")).toBeUndefined();
    expect(customPluginName("anonymous")).toBeUndefined();
  });
});

describe("pluginUses", () => {
  const sdkMethods = new Set(["setAttributes", "getAttributes", "subscribe"]);

  it("lists the SDK methods a plugin calls, once each", () => {
    const plugin = (gb: any) => {
      gb.subscribe(() => gb.setAttributes({ ...gb.getAttributes() }));
      gb.setAttributes({});
    };
    expect(pluginUses(source(plugin), sdkMethods).sort()).toEqual([
      "getAttributes",
      "setAttributes",
      "subscribe",
    ]);
  });

  it("ignores calls on built-in globals that share an SDK method's name", () => {
    const plugin = (gb: any) => {
      console.log("ready");
      gb.log("ready");
    };
    expect(pluginUses(source(plugin), new Set(["log"]))).toEqual(["log"]);
    expect(
      pluginUses(
        source(() => console.log("ready")),
        new Set(["log"]),
      ),
    ).toEqual([]);
  });

  it("ignores calls that aren't SDK methods", () => {
    const plugin = () => document.addEventListener("click", () => {});
    expect(pluginUses(source(plugin), sdkMethods)).toEqual([]);
  });
});

describe("isMinifiedName", () => {
  it("flags the one- and two-letter names minifiers produce", () => {
    expect(isMinifiedName("C")).toBe(true);
    expect(isMinifiedName("Ie")).toBe(true);
    expect(isMinifiedName("subscribe")).toBe(false);
  });
});
