export const PROMPT_KEY = "userPrompt" as const;

export async function getUserPrompt(defaultPrompt: string): Promise<string> {
  try {
    const data = await chrome.storage.sync.get({ [PROMPT_KEY]: defaultPrompt });
    const value = (data?.[PROMPT_KEY] ?? defaultPrompt) as string;
    return (value || defaultPrompt).trim();
  } catch {
    // 失敗時はデフォルト
    return defaultPrompt;
  }
}

