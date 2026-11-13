import { createWriteTracker } from "./writeTracker";

describe("createWriteTracker", () => {
  it("applies every broadcast when no write is in flight", () => {
    const tracker = createWriteTracker();
    expect(tracker.shouldApply("search", undefined)).toBe(true);
    expect(tracker.shouldApply("search", "someone-else")).toBe(true);
  });

  it("ignores echoes of earlier writes while a later write is unconfirmed", () => {
    const tracker = createWriteTracker();
    const a = tracker.begin("search");
    const ab = tracker.begin("search");
    const abc = tracker.begin("search");

    expect(tracker.shouldApply("search", a)).toBe(false);
    expect(tracker.shouldApply("search", ab)).toBe(false);
    expect(tracker.shouldApply("search", abc)).toBe(true);
  });

  it("ignores broadcasts the store sent before confirming the latest write", () => {
    const tracker = createWriteTracker();
    const write = tracker.begin("search");

    expect(tracker.shouldApply("search", undefined)).toBe(false);
    expect(tracker.shouldApply("search", write)).toBe(true);
    expect(tracker.shouldApply("search", undefined)).toBe(true);
  });

  it("ignores a stale echo that arrives after the latest write is confirmed", () => {
    const tracker = createWriteTracker();
    const a = tracker.begin("search");
    const ab = tracker.begin("search");

    expect(tracker.shouldApply("search", ab)).toBe(true);
    expect(tracker.shouldApply("search", a)).toBe(false);
    expect(tracker.shouldApply("search", undefined)).toBe(true);
  });

  it("applies another UI's write once this UI's write is confirmed", () => {
    const panel = createWriteTracker();
    const popup = createWriteTracker();
    const mine = panel.begin("search");
    const theirs = popup.begin("search");

    expect(panel.shouldApply("search", theirs)).toBe(false);
    expect(panel.shouldApply("search", mine)).toBe(true);
    expect(panel.shouldApply("search", theirs)).toBe(true);
  });

  it("delivers the confirming echo to every listener of the property", () => {
    const tracker = createWriteTracker();
    const write = tracker.begin("search");

    expect(tracker.shouldApply("search", write)).toBe(true);
    expect(tracker.shouldApply("search", write)).toBe(true);
  });

  it("tracks properties independently", () => {
    const tracker = createWriteTracker();
    tracker.begin("search");
    expect(tracker.shouldApply("currentTab", undefined)).toBe(true);
  });

  it("stops waiting for a write that failed to send", () => {
    const tracker = createWriteTracker();
    const first = tracker.begin("search");
    const second = tracker.begin("search");

    tracker.abandon("search", first);
    expect(tracker.shouldApply("search", undefined)).toBe(false);

    tracker.abandon("search", second);
    expect(tracker.shouldApply("search", undefined)).toBe(true);
  });
});
