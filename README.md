# ChatGPT SumUp

Chrome extension that opens ChatGPT (chatgpt.com) with your chosen prompt
followed by the current tab URL. You can trigger it from the toolbar button or
the page context menu. The default prompt is configurable in the Options page.

## Generated URL

- Format: `https://chatgpt.com/?q={Prompt}%0A{EncodedURL}` (joined by newline)
- Example: `https://chatgpt.com/?q=Summarize%0Ahttps%3A%2F%2Fexample.com%2Fpost`

Internally the extension builds `prompt + "\n" + pageUrl`, then URL‑encodes it
and sets it to the `q` parameter.

## Features

- Launch from toolbar action or page context menu
- Configurable default prompt via Options (`chrome.storage.sync`)
- URL validation: only `http/https`; excludes `localhost` and private IPs

## Usage

1) Open any web page
2) Click the extension icon (or right‑click → “Summarize with ChatGPT”)
3) ChatGPT opens with the prompt first and the page URL on the next line

Change the prompt: open the extension’s Options and save your preferred text
(default: `Summarize`).

## Setup / Development

- Install deps: `npm install`
- Dev watch: `npm run dev`
  - Bundles `src/` and mirrors static files from `extension/` to `dist/`
  - Load `dist/` in Chrome once and iterate quickly
- Production build: `npm run build`

Loading into Chrome:

1) Run `npm run build` or `npm run dev`
2) Chrome → Extensions → Enable Developer mode → “Load unpacked”
3) Select the `dist/` directory

## Scripts

- `npm run dev`: watch + build (outputs to `dist/`; copies `extension/`)
- `npm run build`: production build
- `npm run lint`: ESLint
- `npm run format`: Prettier
- `npm test`: unit tests (Vitest)

## Project Structure

- `extension/manifest.json`: Manifest v3 (background is `dist/index.js`)
- `extension/options.html|options.js`: Options UI
- `src/background/`: service worker (entry `index.ts`)
- `src/lib/`: shared helpers (URL builder, config, storage)
- `assets/icons/`: icons
- `dist/`: build output (load this in Chrome)

## Implementation Notes

- Default prompt: `DEFAULT_PROMPT` in `src/lib/config.ts`
- URL builder: `buildChatGptUrl` in `src/lib/url.ts`
- URL validation: `isValidPageUrl` in `src/lib/url.ts`
- Prompt storage: `chrome.storage.sync` via `src/lib/storage.ts`

## Permissions & Privacy

- Permissions: `activeTab`, `contextMenus`, `storage`
- No content scripts read page contents
- Navigates to `chatgpt.com` only

## Tests

- Focus: URL building/validation in `src/lib`
- Run: `npm test`

## Known Limitations

- Pages on `localhost` or private IP ranges are ignored
- Non‑`http/https` schemes (e.g., `chrome://`) are not supported
