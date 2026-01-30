# CI/CD Test Suite Documentation

This document describes the complete CI/CD test suite setup for the Next.js 16 + React 19 + TypeScript project.

## Overview

The project includes a comprehensive testing and quality assurance pipeline with the following components:

- **Type Checking** - TypeScript static analysis
- **Code Formatting** - Prettier for consistent code style
- **Linting** - ESLint with Next.js configuration
- **Unit Testing** - Jest with React Testing Library
- **E2E Testing** - Playwright for browser automation
- **Security Auditing** - npm audit for vulnerability scanning
- **CI/CD Automation** - GitHub Actions workflow

## Available Scripts

### Development Scripts

```bash
npm run dev          # Start development server at localhost:3000
npm run build        # Build for production
npm run start        # Run production build
```

### Quality Assurance Scripts

```bash
npm run lint         # Run ESLint on all source files
npm run typecheck    # Run TypeScript type checking (no emit)
npm run format       # Auto-format all files with Prettier
npm run format:check # Check if files are formatted correctly
npm run audit        # Run security audit (moderate level)
```

### Testing Scripts

```bash
npm test             # Run Jest unit tests
npm run test:watch   # Run Jest in watch mode
npm run test:coverage # Run Jest with coverage report
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run Playwright tests with UI mode
```

## Configuration Files

### TypeScript Configuration

- **File**: `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - `strict: true` - Enable all strict type checking
  - `noEmit: true` - Don't emit files (Next.js handles build)
  - Path alias: `@/*` maps to project root

### Prettier Configuration

- **File**: `.prettierrc`
- **Format Settings**:
  - Semi-colons: Yes
  - Single quotes: No (double quotes)
  - Print width: 80 characters
  - Tab width: 2 spaces
  - Trailing commas: ES5
  - Line endings: LF

### ESLint Configuration

- **File**: `eslint.config.mjs`
- **Extends**:
  - `eslint-config-next/core-web-vitals`
  - `eslint-config-next/typescript`
- **Ignores**: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Jest Configuration

- **File**: `jest.config.ts`
- **Test Environment**: jsdom (for React component testing)
- **Coverage**: Collects from `app/` and `lib/` directories
- **Excluded**: E2E tests and API route tests
- **Setup**: `jest.setup.ts` with Testing Library and polyfills

### Playwright Configuration

- **File**: `playwright.config.ts`
- **Test Directory**: `e2e/`
- **Browsers**: Chromium, Firefox, WebKit
- **Base URL**: `http://localhost:3000`
- **Features**:
  - Automatic dev server startup
  - Retry on failure (CI only)
  - HTML reporter
  - Trace on first retry

## GitHub Actions CI Workflow

### File: `.github/workflows/ci.yml`

### Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Pipeline Steps

1. **Checkout code** - Clone the repository
2. **Setup Node.js 20.x** - Install Node with npm cache
3. **Install dependencies** - Run `npm ci` for clean install
4. **Run linter** - Execute ESLint checks
5. **Type check** - Run TypeScript compiler
6. **Format check** - Verify Prettier formatting
7. **Unit tests** - Run Jest test suite
8. **Build** - Create production build
9. **Install Playwright** - Set up browsers for E2E tests
10. **E2E tests** - Run Playwright test suite
11. **Upload report** - Save Playwright results (30 days)
12. **Security audit** - Check for vulnerabilities (non-blocking)

### CI Success Criteria

All of the following must pass:

- ✅ Lint: No ESLint errors
- ✅ Type check: No TypeScript errors
- ✅ Format: All files properly formatted
- ✅ Unit tests: All Jest tests passing
- ✅ Build: Production build succeeds
- ✅ E2E tests: All Playwright tests passing

Note: Security audit failures are non-blocking (continue-on-error: true)

## Test Coverage

### Unit Tests (Jest)

**Tested Components:**

- `lib/api.ts` - API utility functions (apiGet, apiPost, uploadFile)
- `app/components/page/page.tsx` - Home page component

**Test Count**: 23 unit tests

**Coverage Areas**:

- API request/response handling
- Error handling and edge cases
- Component rendering and state management
- User interactions and async operations

### E2E Tests (Playwright)

**Test File**: `e2e/home.spec.ts`

**Tested Scenarios**:

1. Main heading visibility
2. Loading state behavior
3. Page structure and semantics
4. Responsive design (desktop and mobile)

**Browsers**: Chromium, Firefox, WebKit

## Running Tests Locally

### Run All Quality Checks (CI Simulation)

```bash
npm run lint && \
npm run typecheck && \
npm run format:check && \
npm test && \
npm run audit
```

### Run Full Test Suite

```bash
# Unit tests
npm test

# E2E tests (requires build)
npm run build
npm run test:e2e
```

### Watch Mode for Development

```bash
# Unit tests with watch
npm run test:watch

# E2E tests with UI
npm run test:e2e:ui
```

## Troubleshooting

### Type Check Failures

- Ensure all imports are properly typed
- Check for missing type definitions
- Verify `@types/*` packages are installed

### Format Check Failures

```bash
# Auto-fix formatting issues
npm run format
```

### E2E Test Failures

```bash
# Run with UI mode for debugging
npm run test:e2e:ui

# Check Playwright report
npx playwright show-report
```

### Build Failures

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run typecheck`

## Best Practices

### Before Committing

1. Run format: `npm run format`
2. Run all checks: `npm run lint && npm run typecheck && npm test`
3. Ensure build succeeds: `npm run build`

### Before Creating PR

1. Run full CI simulation (see above)
2. Run E2E tests: `npm run test:e2e`
3. Check for security issues: `npm run audit`
4. Review test coverage: `npm run test:coverage`

### Writing Tests

- **Unit Tests**: Place `.test.ts(x)` files next to source files
- **E2E Tests**: Place `.spec.ts` files in `e2e/` directory
- Follow AAA pattern: Arrange, Act, Assert
- Write descriptive test names
- Mock external dependencies

## Dependencies

### Testing Libraries

- `jest` v30.2.0 - Test framework
- `@testing-library/react` v16.3.2 - React component testing
- `@testing-library/jest-dom` v6.9.1 - DOM matchers
- `@playwright/test` v1.58.0 - E2E testing
- `whatwg-fetch` - Fetch API polyfill

### Code Quality Tools

- `prettier` v3.8.1 - Code formatter
- `eslint` v9 - JavaScript/TypeScript linter
- `typescript` v5 - Type checking

## Notes

### API Route Tests

API route tests in `app/api/**/*.test.ts` are excluded from Jest because they require the Next.js Edge Runtime. These should be tested via:

- E2E tests (Playwright)
- Integration tests with a test server
- Manual testing in development

### Coverage Thresholds

Currently, no coverage thresholds are enforced. To add them, update `jest.config.ts`:

```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## Additional Resources

- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
