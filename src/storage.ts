import { useEffect, useState } from "react";

const NAMESPACE = "gb-devtools";
const VERSION = "v1";
const API_KEY = `${NAMESPACE}-${VERSION}-api-key`;

export const loadApiKey = async () => {
  const result = await chrome.storage.sync.get([API_KEY]);
  return result[API_KEY] || null;
};

export const saveApiKey = (apiKey: string) =>
  chrome.storage.sync.set({ [API_KEY]: apiKey });

export const clearApiKey = () => chrome.storage.sync.remove([API_KEY]);