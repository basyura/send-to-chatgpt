import { DEFAULT_PROMPT } from "../lib/config";
import { buildChatGptUrl, isValidPageUrl } from "../lib/url";
import { getUserPrompt } from "../lib/storage";

async function openChatGptForTab(tab?: chrome.tabs.Tab) {
  if (!tab || !tab.url) return;
  if (!isValidPageUrl(tab.url)) return;
  const prompt = await getUserPrompt(DEFAULT_PROMPT);
  const url = buildChatGptUrl(prompt, tab.url);
  await chrome.tabs.create({ url });
}

chrome.action.onClicked.addListener(async (tab) => {
  // User clicked the toolbar button
  await openChatGptForTab(tab);
});

chrome.contextMenus.onClicked.addListener(async (_info, tab) => {
  await openChatGptForTab(tab);
});
