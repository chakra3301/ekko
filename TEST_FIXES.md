# Test Fixes

## Issue: Missing Jest Dependency

The error `Cannot find module '@jest/test-sequencer'` indicates a missing Jest dependency.

### Fix

Add the missing dependency to `package.json`:

```json
"@jest/test-sequencer": "^29.7.0"
```

Then reinstall:

```bash
npm install
```

## Issue: Test Suites Failing

If all test suites fail with 0 tests, check:

1. **Jest configuration** - Ensure `jest.config.js` is correct
2. **Test file patterns** - Verify test files match Jest patterns
3. **Module resolution** - Check path aliases in `jest.config.js` and `tsconfig.json`

## Running Tests After Fix

```bash
# Install dependencies
npm install

# Generate Prisma Client (required)
npm run db:generate

# Run tests
npm test
```

## Common Issues

### 1. Module Resolution Errors

If you see "Cannot find module" errors:

- Check `jest.config.js` has correct `moduleNameMapper`
- Verify `tsconfig.json` paths match
- Ensure imports use `@/` prefix correctly

### 2. Prisma Client Not Generated

If tests fail with Prisma errors:

```bash
npm run db:generate
```

### 3. Next.js Router Mock Issues

If router mocks fail:

- Check `jest.setup.js` has router mocks
- Verify mocks are loaded before tests

### 4. TypeScript Errors in Tests

If TypeScript errors occur:

```bash
npm run type-check
```

Fix any type errors before running tests.

