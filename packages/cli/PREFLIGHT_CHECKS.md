# Harpy CLI - Pre-flight Checks

The Harpy CLI now includes automatic pre-flight checks to detect common environment issues before project creation. This helps users avoid errors and provides actionable solutions.

## Features

### 1. Automatic Pre-flight Checks

When running `harpy create <project-name>`, the CLI automatically verifies:

- **Node.js version**: Checks if Node.js >= 18.0.0 is installed
- **Package manager availability**: Verifies the selected package manager is installed
- **npm version**: Warns if npm is outdated
- **NestJS CLI availability**: Tests if `@nestjs/cli` can be executed via npx
- **Dependency issues**: Detects corrupted npm/npx cache that causes "Cannot find module" errors

### 2. Doctor Command

Run diagnostic checks on your system:

```bash
harpy doctor              # Basic system check
harpy doctor --verbose    # Detailed diagnostic information
```

The doctor command provides:
- System information (Node.js, npm, pnpm, yarn versions)
- Validation of all requirements
- Helpful commands to fix common issues

### 3. Skip Pre-flight Checks

If you need to bypass pre-flight checks (e.g., in CI/CD environments):

```bash
harpy create my-app --skip-preflight
```

## Common Issues Detected

### Issue: "Cannot find module 'lodash/toArray'"

**Cause**: Corrupted npm/npx cache with stale dependencies

**Solution provided**:
```
✖ Pre-flight checks failed:

  NestJS CLI has a corrupted dependency: lodash/toArray

  This is usually caused by a corrupted npm/npx cache.

To fix this issue, try the following:

1. Clear the npx cache:
   rm -rf ~/.npm/_npx

2. Clear npm cache:
   npm cache clean --force

3. Update @nestjs/cli globally (optional):
   npm install -g @nestjs/cli@latest

4. If using an older Node.js version, consider upgrading:
   Current minimum recommended: Node.js 20.0.0
```

### Issue: Outdated Node.js Version

**Cause**: Node.js version < 18.0.0

**Solution provided**:
```
✖ Pre-flight checks failed:

  Node.js version 16.14.0 is too old. Harpy requires Node.js 18.0.0 or higher.
  Current: v16.14.0
  Required: v18.0.0+
  Recommended: v20.0.0+

  Please upgrade Node.js: https://nodejs.org
```

### Issue: Missing Package Manager

**Cause**: Selected package manager not installed

**Solution provided**:
```
✖ Pre-flight checks failed:

  Package manager "pnpm" is not installed or not in PATH
```

## Questions to Ask Users Reporting Issues

When a user reports an error during project creation, ask for:

1. **Node.js version**: `node -v`
2. **npm version**: `npm -v`
3. **Operating system**: (e.g., Ubuntu 22.04, Windows 11, macOS Sonoma)
4. **Output of doctor command**: `harpy doctor --verbose`
5. **Have you tried clearing the cache?**
   - `rm -rf ~/.npm/_npx` (Linux/macOS)
   - `npm cache clean --force`

## Implementation Details

### Pre-flight Checks Module

Located at: `packages/cli/src/utils/preflight-checks.ts`

Key functions:
- `runPreflightChecks()`: Runs all validation checks
- `displayPreflightResults()`: Displays errors/warnings to users
- `getSystemInfo()`: Collects system diagnostic information
- `checkNestCLI()`: Tests @nestjs/cli availability (catches the lodash issue)

### Integration

The checks run automatically before project creation in:
- `packages/cli/src/commands/create.ts`

Unless `--skip-preflight` is provided, the CLI will:
1. Verify Node.js version
2. Check package manager availability  
3. Test NestJS CLI execution
4. Display actionable error messages with fix suggestions
5. Exit with code 1 if critical issues are found
6. Continue with warnings for non-critical issues

## Testing

Tests include the `skipPreflight: true` option to avoid environment checks during unit testing:

```typescript
await createCommand("my-app", {
  includeI18n: true,
  skipInstall: true,
  skipGit: true,
  skipPreflight: true, // Skip environment validation in tests
});
```

## Future Enhancements

Potential improvements:
- [ ] Check for sufficient disk space
- [ ] Verify network connectivity
- [ ] Detect proxy/firewall issues
- [ ] Validate git installation
- [ ] Check for conflicting global packages
- [ ] Add support for offline mode
