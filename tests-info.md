# Testing Documentation

This document explains all testing infrastructure and practices for the frontend-data-transform-engine project.

## Test Commands

| Command                 | Description                       |
| ----------------------- | --------------------------------- |
| `npm test`              | Run unit tests with Jest          |
| `npm run test:watch`    | Run tests in watch mode           |
| `npm run test:coverage` | Run tests with coverage report    |
| `npm run test:e2e`      | Run E2E tests with Playwright     |
| `npm run test:e2e:ui`   | Run E2E tests with interactive UI |

## Testing Stack

### Unit & Integration Tests

- **Jest** (v30) - Test runner
- **React Testing Library** (v16) - Component testing utilities
- **jest-dom** - Custom DOM matchers
- **user-event** - User interaction simulation

### End-to-End Tests

- **Playwright** (v1.58) - Browser automation and E2E testing

## Test File Structure

Tests are colocated with their source files:

```
app/
├── components/
│   └── page/
│       ├── page.tsx          # Component
│       ├── page.test.tsx     # Unit tests
│       └── page.scss         # Styles
├── api/
│   └── health/
│       ├── route.ts          # API route
│       └── route.test.ts     # API tests
lib/
├── api.ts                    # API utilities
└── api.test.ts               # API utility tests
e2e/
└── home.spec.ts              # E2E tests
```

## Test Files

### Unit Tests

#### `lib/api.test.ts`

Tests for the API client utilities:

- `ApiError` class creation and properties
- `apiGet()` - GET requests, error handling, response parsing
- `apiPost()` - POST requests with JSON body
- `uploadFile()` - File uploads with FormData
- Edge cases: empty responses, null values, URL construction

#### `app/components/page/page.test.tsx`

Tests for the Home page component:

- Rendering and display
- API connection states (loading, connected, error)
- User interface elements

#### `app/api/health/route.test.ts`

Tests for the health check API route:

- Successful backend connection
- Backend response forwarding
- Error handling (network errors, timeouts, invalid JSON)
- Environment variable usage
- Response format validation

### E2E Tests

#### `e2e/home.spec.ts`

End-to-end tests for the home page:

- Main heading visibility
- Loading state display
- Page structure (semantic HTML)
- Responsive design (desktop and mobile viewports)

## Configuration Files

### `jest.config.ts`

Jest configuration:

- Uses `next/jest` for Next.js integration
- Test environment: jsdom
- Module aliases: `@/*` maps to project root
- Excludes E2E tests from Jest runs
- Coverage collection from `app/` and `lib/`

### `jest.setup.ts`

Test setup file:

- Imports `@testing-library/jest-dom` matchers
- Sets `NEXT_PUBLIC_API_URL` environment variable

### `playwright.config.ts`

Playwright configuration:

- Tests in `e2e/` directory
- Runs against Chromium, Firefox, and WebKit
- Auto-starts dev server on port 3000
- HTML reporter for test results

## Writing Tests

### Unit Test Pattern

```typescript
import { render, screen } from "@testing-library/react";
import Component from "./component";

describe("Component", () => {
  it("should render correctly", () => {
    // Arrange
    render(<Component />);

    // Act
    const element = screen.getByRole("button");

    // Assert
    expect(element).toBeInTheDocument();
  });
});
```

### API Test Pattern

```typescript
global.fetch = jest.fn();
const mockedFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("API Function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data", async () => {
    // Arrange
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "test" }),
    } as Response);

    // Act
    const result = await apiGet("/endpoint");

    // Assert
    expect(result).toEqual({ data: "test" });
  });
});
```

### E2E Test Pattern

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature", () => {
  test("should work", async ({ page }) => {
    // Arrange & Act
    await page.goto("/");

    // Assert
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
```

## Code Quality Checks

In addition to tests, the project runs these quality checks:

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run lint`         | ESLint static analysis           |
| `npm run typecheck`    | TypeScript type checking         |
| `npm run format:check` | Prettier formatting verification |
| `npm run audit`        | Security vulnerability scan      |

## CI/CD Pipeline

All tests run automatically in GitHub Actions on push/PR to main:

1. Install dependencies
2. Lint
3. Type check
4. Format check
5. Unit tests
6. Build
7. E2E tests
8. Security audit

See `.github/workflows/ci.yml` for the full pipeline configuration.

## Coverage

Generate a coverage report:

```bash
npm run test:coverage
```

Coverage is collected from:

- `app/**/*.{ts,tsx}`
- `lib/**/*.{ts,tsx}`

Excluded from coverage:

- Type definition files (`*.d.ts`)
- `node_modules/`
- `.next/`
- `coverage/`
