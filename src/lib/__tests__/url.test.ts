import { describe, it, expect } from 'vitest';
import { buildChatGptUrl } from '../url';

describe('buildChatGptUrl', () => {
  it('builds chatgpt.com URL with prompt and newline+encoded page URL', () => {
    const prompt = 'Summarize';
    const page = 'https://example.com/path?q=1&x=y';
    const result = buildChatGptUrl(prompt, page);
    expect(result.startsWith('https://chatgpt.com/?q=')).toBe(true);
    const encoded = result.replace('https://chatgpt.com/?q=', '');
    const decoded = decodeURIComponent(encoded);
    expect(decoded).toBe(`${prompt}\n${page}`);
  });
});

