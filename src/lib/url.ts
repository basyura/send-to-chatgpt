export function buildChatGptUrl(prompt: string, pageUrl: string): string {
  const safePrompt = (prompt ?? '').trim();
  const safeUrl = (pageUrl ?? '').trim();
  // Compose as: https://chatgpt.com/?q={Prompt}%0A{EncodedURL}
  const query = `${safePrompt}\n${safeUrl}`;
  const encoded = encodeURIComponent(query);
  return `https://chatgpt.com/?q=${encoded}`;
}

