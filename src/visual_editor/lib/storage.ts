const NAMESPACE = "devtools";
const VERSION = "v1";
const API_HOST = `${NAMESPACE}-${VERSION}-api-host`;
const API_KEY = `${NAMESPACE}-${VERSION}-api-key`;
const APP_ORIGIN = `${NAMESPACE}-${VERSION}-app-origin`;

export const loadApiKey = async () => {
  const result = await chrome.storage.sync.get([API_KEY]);
  return result[API_KEY] || null;
};

export const saveApiKey = async (apiKey: string) => {
  await chrome.storage.sync.set({ [API_KEY]: apiKey });
  const result = await chrome.storage.sync.get([API_KEY]);
  return result[API_KEY];
};

export const clearApiKey = () => chrome.storage.sync.remove([API_KEY]);

export const loadApiHost = async () => {
  const result = await chrome.storage.sync.get([API_HOST]);
  return result[API_HOST] || null;
};

export const saveApiHost = async (apiHost: string) => {
  await chrome.storage.sync.set({ [API_HOST]: apiHost });
  const result = await chrome.storage.sync.get([API_HOST]);
  return result[API_HOST];
};

export const loadAppOrigin = async () => {
  const result = await chrome.storage.sync.get([APP_ORIGIN]);
  return result[APP_ORIGIN] || null;
};

export const saveAppOrigin = async (appOrigin: string) => {
  await chrome.storage.sync.set({ [APP_ORIGIN]: appOrigin });
  const result = await chrome.storage.sync.get([APP_ORIGIN]);
  return result[APP_ORIGIN];
};
