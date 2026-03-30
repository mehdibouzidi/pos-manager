# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` with Angular app code. Key areas:
  - `src/app/{core,frontend,backend,layouts}`: application modules and features.
  - `src/@vex/*`: UI utilities, styles, components, animations.
  - `src/assets/`: images, fonts, i18n.
  - `src/environments/`: `environment.ts`, `environment.dev.ts`, `environment.prod.ts`.
- Output: `dist/vex/` (Angular build artifacts).
- Infra: `Dockerfile`, `nginxconf/`.

## Build, Test, and Development Commands
- `npm start`: run locally with `ng serve -c dev`.
- `npm run build`: production build (`ng build --configuration production`).
- `npm test`: unit tests via Karma/Jasmine.
- `npm run lint`: lint according to Angular/ESLint setup.
- Node: use `nvm use` (Node `16`, see `.nvmrc`). If npm install issues arise, `.npmrc` enables `legacy-peer-deps`.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (`.editorconfig`).
- Quotes: single quotes for TS; default for HTML/SCSS (`.prettierrc`).
- Styles: SCSS; global styles in `src/styles.scss` and Tailwind via `src/@vex/styles/tailwind.scss`.
- Angular prefixes: use selector prefix `vex-` (see `angular.json`).
- Filenames: `feature-name.component.ts`, `.service.ts`, `.module.ts`, `.spec.ts`.
- Run Prettier before committing: `npx prettier --write .` (or your editor’s Prettier integration).

## Testing Guidelines
- Framework: Jasmine + Karma (`karma.conf.js`).
- Test files: colocate and name `*.spec.ts`.
- Run: `npm test` (opens Chrome; updates on file change).
- Coverage: artifacts under `coverage/vex` (if enabled by reporter).

## Commit & Pull Request Guidelines
- Conventional commits preferred: `feat:`, `fix:`, `chore:`, `refactor:`, etc. Example: `feat: add customer service feature (#40)`.
- Keep messages imperative and scoped.
- PRs must include: concise description, linked issues/PR numbers, screenshots or GIFs for UI changes, and any config notes (e.g., env keys like `api_source`).

## Security & Configuration Tips
- Environment config: set API base at `src/environments/*` via `api_source` (e.g., dev: `http://localhost:8080/`).
- Do not commit secrets. Prefer per-environment files and CI variables.
- Verify production builds locally with `npm run build` and serve `dist/vex/` behind Nginx config in `nginxconf/` when applicable.

