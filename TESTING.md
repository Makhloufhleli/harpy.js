# Testing Setup Instructions

This document explains the testing infrastructure for the Harpy monorepo.

## Overview

The project uses:

- **Jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **Husky** - Git hooks
- **lint-staged** - Run tests on staged files
- **GitHub Actions** - CI/CD pipeline

## Installation

Since there were permission issues with the terminal, you'll need to manually install the dependencies:

### Option 1: Install from outside VS Code

```bash
cd /Users/user/Workspaces/HEPTA/nestjsx-monorepo
pnpm install
```

### Option 2: Close and reopen VS Code, then:

```bash
pnpm install
```

This will install all dependencies including:

- `jest@^29.7.0`
- `@types/jest@^29.5.12`
- `ts-jest@^29.1.2`
- `husky@^8.0.3`
- `lint-staged@^15.2.0`

## Setup Husky

After installing dependencies, initialize Husky hooks:

```bash
pnpm run prepare
```

This will:

1. Install Husky hooks
2. Setup the pre-commit hook to run tests

## Running Tests

### Run all tests across all packages

```bash
pnpm test
```

### Run tests in watch mode

```bash
pnpm test:watch
```

### Run tests with coverage

```bash
pnpm test:coverage
```

### Run tests for a specific package

```bash
cd packages/harpy-core
pnpm test
```

```bash
cd packages/harpy-cli
pnpm test
```

## Test Structure

### harpy-core Tests

Located in: `packages/harpy-core/src/core/__tests__/`

- **jsx.engine.test.ts** - Tests for JSX rendering engine
- **component-analyzer.test.ts** - Tests for client component detection
- **hydration-manifest.test.ts** - Tests for hydration manifest generation

### harpy-cli Tests

Located in: `packages/harpy-cli/src/__tests__/`

- **create.test.ts** - Tests for project creation command

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pipeline Steps:

1. **Test Job** - Runs on Node 18.x and 20.x
   - Install dependencies
   - Run linter
   - Run tests
   - Generate coverage report
   - Upload coverage to Codecov

2. **Build Job** - Runs after tests pass
   - Build all packages
   - Verify build artifacts

## Pre-commit Hooks

Husky runs `lint-staged` before every commit, which:

- Finds all staged `.ts` and `.tsx` files in `packages/`
- Runs tests for those specific files
- Prevents commit if tests fail

Configuration in `package.json`:

```json
{
  "lint-staged": {
    "packages/**/*.{ts,tsx}": ["pnpm test --bail --findRelatedTests"]
  }
}
```

## Writing New Tests

### Example Test Structure

```typescript
describe("MyFeature", () => {
  let instance: MyFeature;

  beforeEach(() => {
    instance = new MyFeature();
  });

  describe("myMethod", () => {
    it("should do something", () => {
      const result = instance.myMethod();
      expect(result).toBe(expected);
    });

    it("should handle edge cases", () => {
      expect(() => instance.myMethod(null)).toThrow();
    });
  });
});
```

### Best Practices

1. **Group related tests** using `describe()` blocks
2. **Use descriptive test names** starting with "should"
3. **Setup and teardown** with `beforeEach()` and `afterEach()`
4. **Mock external dependencies** using `jest.mock()`
5. **Test edge cases** including error conditions
6. **Aim for 70%+ coverage** (configured in jest.config.js)

## Coverage Thresholds

Both packages have coverage thresholds of 70%:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

If coverage drops below these thresholds, tests will fail.

## Troubleshooting

### "Cannot find type definition file for 'jest'"

This error appears before dependencies are installed. Run:

```bash
pnpm install
```

### Tests fail on commit

If pre-commit tests fail:

1. Fix the failing tests
2. Stage the changes: `git add .`
3. Try committing again

To temporarily skip hooks (not recommended):

```bash
git commit --no-verify -m "message"
```

### Permission errors with pnpm

If you encounter `EPERM` errors:

1. Close VS Code
2. Open terminal outside VS Code
3. Run `pnpm install` from project root
4. Reopen VS Code

## Next Steps

1. **Install dependencies**: `pnpm install`
2. **Setup Husky**: `pnpm run prepare`
3. **Run tests**: `pnpm test`
4. **Check coverage**: `pnpm test:coverage`
5. **Commit changes**: Git hooks will run tests automatically

## Configuration Files

- **Root package.json** - Test scripts and lint-staged config
- **packages/\*/jest.config.js** - Jest configuration per package
- **packages/\*/tsconfig.json** - TypeScript config with Jest types
- **.github/workflows/ci.yml** - GitHub Actions workflow
- **.husky/pre-commit** - Pre-commit hook script

## Test Coverage

View coverage reports in:

- `packages/harpy-core/coverage/`
- `packages/harpy-cli/coverage/`

Open `coverage/lcov-report/index.html` in a browser to see detailed coverage.
