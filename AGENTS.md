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

## Commit Message Policy (Conventional Commits)
- Language: English for subject and body.
- Format: `type(scope): subject` (imperative, ≤50 chars, no period).
- Types: `feat|fix|docs|refactor|perf|test|build|ci|chore|style|revert`.
- Scope: `options|background|content|popup|lib|build|manifest` (extend as needed).
- Body: blank line after subject, use bullets; ~72 chars per line.
- Footer: link issues at the end, e.g., `Refs: #123` / `Closes: #123`.
- Granularity: split logically independent changes (manifest, build, logic).
- Fixups: prefer `--amend`; if history is shared already, `rebase -i` with `reword`.

### CLI rules for newline‑safe bodies
- Use `$'…'` with real newlines or `-F -` (heredoc). Do not embed literal `\n`.

Examples

```
git commit -m $'feat(options): add options page and saved prompt support\n\n- manifest: add options_ui and storage permission\n- background: read user prompt from chrome.storage\n- build(dev): watch and copy extension/ static to dist\n- chore: add storage util (getUserPrompt)'
```

```
git commit --amend -m $'fix(url): encode page URL safely\n\n- escape newlines and spaces\n- add unit test for unicode\n\nCloses: #123'
```

```
git commit -F - <<'MSG'
feat(build): watch and copy static assets in dev

- mirror extension/ to dist/ on change
- debounce copy to avoid bursts
MSG
```
