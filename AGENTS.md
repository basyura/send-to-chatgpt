# Repository Guidelines

## Project Structure & Module Organization
- Expected layout for the Chrome extension:
  - `extension/manifest.json`: Extension manifest (v3).
  - `src/background/`: Service worker and context‑menu logic.
  - `src/content/`: Content scripts (tab URL capture, messaging).
  - `src/popup/`: Popup UI (optional) and assets.
  - `src/lib/`: Shared helpers (URL building, config).
  - `assets/icons/`: Icons shown in Chrome.
  - `dist/`: Built, unpacked extension to load in Chrome.
- If a folder is missing, create it following the above roles.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start watcher, build to `dist/`, reload on change (if configured).
- `npm run build`: Production build to `dist/` for loading as “Unpacked”.
- `npm run lint` / `npm run format`: Lint and auto‑format the codebase.
- `npm test`: Run unit tests. Check `package.json` for exact scripts.

## Coding Style & Naming Conventions
- Indentation: 2 spaces; line width 100–120.
- Language: TypeScript preferred; `.ts/.tsx` in `src/`.
- Files: `kebab-case.ts` for modules; `PascalCase.tsx` for components; `CONSTANT_CASE` for env‑like constants.
- Tools: ESLint + Prettier (run via `npm run lint` / `format`).
- Imports: Use relative within feature folders; avoid deep cross‑package paths.

## Testing Guidelines
- Framework: Jest/Vitest for unit tests under `src/**/__tests__` or `*.test.ts` colocated.
- Coverage: Focus on `src/lib` (URL building, parsing). UI/tests are optional.
- Run: `npm test` (add `--watch` in local loops).

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat: add context menu` / `fix: encode URL correctly`).
- PRs: Include summary, linked issue, before/after screenshots (or a short clip), and test notes.
- Validation: After `npm run build`, load `dist/` via Chrome → Extensions → Developer mode → Load unpacked.

## Security & Configuration Tips
- Do not store secrets or tokens in the repo or `manifest.json`.
- Keep permissions minimal in `manifest.json` (only needed `host_permissions`).
- Avoid `unsafe-eval`; prefer message passing between background/content.
- Encode user URLs safely when generating the ChatGPT query.

