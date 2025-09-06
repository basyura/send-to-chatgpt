export function buildChatGptUrl(prompt: string, pageUrl: string): string {
  const safePrompt = (prompt ?? '').trim();
  const safeUrl = (pageUrl ?? '').trim();
  // Compose as: https://chatgpt.com/?q={Prompt}%0A{EncodedURL}
  const query = `${safePrompt}\n${safeUrl}`;
  const encoded = encodeURIComponent(query);
  return `https://chatgpt.com/?q=${encoded}`;
}

/**
 * Validate whether the current tab URL is a valid target for ChatGPT.
 * Rules: allow only http/https and exclude localhost and private IP ranges.
 */
export function isValidPageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    // Exclude localhost and subdomains of .localhost
    if (host === 'localhost' || host.endsWith('.localhost')) return false;

    // Exclude private/local IPs (IPv4 and IPv6)
    if (isLocalIp(host)) return false;
    return true;
  } catch {
    return false;
  }
}

function isLocalIp(host: string): boolean {
  // IPv4
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    const octets = host.split('.').map(Number);
    if (octets.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true; // treat invalid as local (reject)
    const [a, b] = octets;
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
    return false;
  }

  // IPv6 literal
  if (host.includes(':') || (host.startsWith('[') && host.endsWith(']'))) {
    // Strip brackets if present (Node URL.hostname may include [ ] for IPv6)
    const ip6 = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
    // Loopback ::1 / 0:0:0:0:0:0:0:1
    if (ip6 === '::1' || ip6 === '0:0:0:0:0:0:0:1') return true;
    // Link-local fe80::/10
    if (ip6.startsWith('fe8') || ip6.startsWith('fe9') || ip6.startsWith('fea') || ip6.startsWith('feb')) return true;
    // Unique local fc00::/7 (fc00::/8 and fd00::/8)
    if (ip6.startsWith('fc') || ip6.startsWith('fd')) return true;
    return false;
  }

  return false;
}
