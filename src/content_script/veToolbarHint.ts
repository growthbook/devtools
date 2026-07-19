// In-page hint shown when the user clicks "Open in Visual Editor" in
// GrowthBook and the standalone Visual Editor extension is installed but
// its side panel isn't open. The panel can't open itself on this page (no
// user gesture survives the navigation from the GrowthBook app), so we
// point the user at the extensions toolbar, with a button that attempts to
// open the panel directly (works when the click gesture propagates across
// the extension boundary; the arrow guidance is the fallback).
//
// Deliberately plain DOM in a closed shadow root — the legacy visual
// editor bundle (and its React/Tailwind) is not loaded on this path, and
// the content script should stay lean.

const HINT_CONTAINER_ID = "__gb_ve_toolbar_hint";
const AUTO_FADE_MS = 10_000;

export function showVeToolbarHint() {
  if (document.getElementById(HINT_CONTAINER_ID)) return;

  const container = document.createElement("div");
  container.id = HINT_CONTAINER_ID;
  const shadow = container.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = `
    .wrapper {
      position: fixed;
      top: 10px;
      right: 16px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .wrapper.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .arrow {
      font-size: 28px;
      line-height: 1;
      color: #6366f1;
      margin-right: 28px;
      animation: gb-ve-bounce 1s ease-in-out infinite;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    @keyframes gb-ve-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    .card {
      margin-top: 4px;
      max-width: 340px;
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #6366f1;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      padding: 14px 16px;
      font-size: 13px;
      line-height: 1.45;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .header img {
      width: 18px;
      height: 18px;
    }
    .close {
      margin-left: auto;
      cursor: pointer;
      border: none;
      background: none;
      color: #94a3b8;
      font-size: 15px;
      line-height: 1;
      padding: 2px 4px;
    }
    .close:hover { color: #f8fafc; }
    .body { color: #cbd5e1; }
    .open-btn {
      display: block;
      width: 100%;
      margin-top: 10px;
      padding: 8px 10px;
      background: #3730a3;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .open-btn:hover { background: #4338ca; }
    .open-btn:disabled { background: #475569; cursor: default; }
  `;

  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";
  wrapper.innerHTML = `
    <div class="arrow">&#8679;</div>
    <div class="card">
      <div class="header">
        <img alt="" src="${chrome.runtime.getURL("js/logo128.png")}" />
        <span>Open the new Visual Editor</span>
        <button class="close" title="Dismiss">&#10005;</button>
      </div>
      <div class="body">
        This experiment now opens in the GrowthBook Visual Editor extension.
        Open its side panel from the extensions toolbar above (puzzle icon)
        to start editing.
      </div>
      <button class="open-btn">Open Visual Editor</button>
    </div>
  `;

  shadow.appendChild(style);
  shadow.appendChild(wrapper);
  document.body.appendChild(container);

  // next frame so the entrance transition runs
  requestAnimationFrame(() => wrapper.classList.add("visible"));

  const remove = () => {
    wrapper.classList.remove("visible");
    window.setTimeout(() => container.remove(), 300);
  };

  let fadeTimer = window.setTimeout(remove, AUTO_FADE_MS);
  // don't fade away mid-read
  wrapper.addEventListener("mouseenter", () => window.clearTimeout(fadeTimer));
  wrapper.addEventListener("mouseleave", () => {
    fadeTimer = window.setTimeout(remove, AUTO_FADE_MS);
  });

  wrapper.querySelector(".close")?.addEventListener("click", remove);

  const openBtn = wrapper.querySelector(".open-btn") as HTMLButtonElement;
  openBtn.addEventListener("click", () => {
    openBtn.disabled = true;
    try {
      chrome.runtime.sendMessage(
        { type: "BG_OPEN_NEW_VE_PANEL" },
        (resp?: { opened: boolean }) => {
          void chrome.runtime.lastError;
          if (resp?.opened) {
            remove();
          } else {
            // Gesture didn't propagate across the extension boundary —
            // fall back to directing the user at the toolbar.
            openBtn.textContent =
              "Couldn't open automatically — use the toolbar above ⇧";
          }
        },
      );
    } catch {
      openBtn.textContent =
        "Couldn't open automatically — use the toolbar above ⇧";
    }
  });
}
