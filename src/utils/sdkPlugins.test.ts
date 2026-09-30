import {
  autoAttributesPlugin,
  growthbookTrackingPlugin,
  thirdPartyTrackingPlugin,
} from "@growthbook/growthbook/plugins";
import { identifyPlugin, isThirdPartyTrackingSource } from "./sdkPlugins";

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
