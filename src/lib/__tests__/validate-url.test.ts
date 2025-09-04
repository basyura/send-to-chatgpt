import { describe, it, expect } from 'vitest';
import { isValidPageUrl } from '../url';

describe('isValidPageUrl', () => {
  it('accepts http/https non-localhost URLs', () => {
    expect(isValidPageUrl('http://example.com')).toBe(true);
    expect(isValidPageUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('rejects non-URL strings and special schemes', () => {
    expect(isValidPageUrl('not a url')).toBe(false);
    expect(isValidPageUrl('chrome://extensions')).toBe(false);
    expect(isValidPageUrl('about:blank')).toBe(false);
    expect(isValidPageUrl('file:///Users/me/file.txt')).toBe(false);
  });

  it('rejects localhost URLs', () => {
    expect(isValidPageUrl('http://localhost')).toBe(false);
    expect(isValidPageUrl('http://localhost:3000/path')).toBe(false);
    expect(isValidPageUrl('https://localhost')).toBe(false);
  });

  it('rejects local/private IPv4 addresses', () => {
    expect(isValidPageUrl('http://127.0.0.1')).toBe(false);
    expect(isValidPageUrl('http://127.1.2.3')).toBe(false);
    expect(isValidPageUrl('http://0.0.0.0')).toBe(false);
    expect(isValidPageUrl('http://10.0.0.1')).toBe(false);
    expect(isValidPageUrl('http://172.16.0.1')).toBe(false);
    expect(isValidPageUrl('http://172.31.255.255')).toBe(false);
    expect(isValidPageUrl('http://192.168.1.1')).toBe(false);
    expect(isValidPageUrl('http://169.254.10.20')).toBe(false);
    expect(isValidPageUrl('http://100.64.1.2')).toBe(false);
    expect(isValidPageUrl('http://100.127.1.2')).toBe(false);
  });

  it('rejects local IPv6 addresses', () => {
    expect(isValidPageUrl('http://[::1]')).toBe(false);
    expect(isValidPageUrl('http://[0:0:0:0:0:0:0:1]')).toBe(false);
    expect(isValidPageUrl('http://[fe80::1]')).toBe(false);
    expect(isValidPageUrl('http://[fd12:3456:789a::1]')).toBe(false);
    expect(isValidPageUrl('http://[fc00::1]')).toBe(false);
  });
});
