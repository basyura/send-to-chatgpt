import { DEFAULT_PROMPT } from "../lib/config";
import { buildChatGptUrl } from "../lib/url";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "chatgpt-sumup",
    title: "Summarize with ChatGPT",
    contexts: ["page", "selection", "link"]
  });
});

async function openChatGptForTab(tab?: chrome.tabs.Tab) {
  if (!tab || !tab.url) return;
  const url = buildChatGptUrl(DEFAULT_PROMPT, tab.url);
  await chrome.tabs.create({ url });
}

chrome.action.onClicked.addListener(async (tab) => {
  // User clicked the toolbar button
  await openChatGptForTab(tab);
});

chrome.contextMenus.onClicked.addListener(async (_info, tab) => {
  await openChatGptForTab(tab);
});

