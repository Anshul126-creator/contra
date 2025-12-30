# Contra Backend

## Available Scripts

- `npm run dev` – Start development server with hot reload (tsx)
- `npm run build` – Compile TypeScript into `dist`
- `npm run start` – Run compiled server from `dist`
- `npm run lint` – Run ESLint using the project config
- `npm run test` – Run Vitest unit tests (watch mode with `npm run test -- --watch`)

## Testing

Tests live alongside source files with the `.test.ts` suffix. Vitest is configured via `vitest.config.ts`. Supertest is used for exercising HTTP routes without needing to run the server on a real port.

## Linting

ESLint is configured via `eslint.config.mjs` and enforces the following:

- TypeScript recommendations (including type-aware checks)
- Consistent import ordering via `eslint-plugin-simple-import-sort`
- Best practices from `eslint-plugin-import`

You can auto-fix most issues with `npm run lint -- --fix`.
