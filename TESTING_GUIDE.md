# Testing Guide

This guide explains how to run tests for the EKKO MVP project.

## Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client** (required for tests):
   ```bash
   npm run db:generate
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- page.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="validates"
```

## Test Structure

### Unit Tests
Located in component/API route `__tests__` directories:
- `app/(auth)/onboard/artist/__tests__/page.test.tsx` - Onboarding form tests
- `app/api/onboarding/artist/__tests__/route.test.ts` - API route tests

### Integration Tests
Located in `tests/integration/`:
- `tests/integration/signup-onboarding-search.test.ts` - E2E flow tests

## Test Files

### 1. Onboarding Form Tests
**File**: `app/(auth)/onboard/artist/__tests__/page.test.tsx`

**Tests**:
- ✅ Renders onboarding form
- ✅ Validates display name is required
- ✅ Validates at least one discipline is required
- ✅ Validates at least 3 portfolio items are required
- ✅ Allows adding and removing disciplines
- ✅ Navigates through all steps
- ✅ Allows going back to previous steps

### 2. API Route Tests
**File**: `app/api/onboarding/artist/__tests__/route.test.ts`

**Tests**:
- ✅ Returns 401 if user is not authenticated
- ✅ Returns 403 if user already has a profile
- ✅ Creates artist profile successfully
- ✅ Returns 400 for invalid data

### 3. Integration Tests
**File**: `tests/integration/signup-onboarding-search.test.ts`

**Tests**:
- ✅ Completes full flow: signup → onboarding → search
- ✅ Searches artists by discipline
- ✅ Searches artists by location

## Troubleshooting

### Jest Command Not Found

If you see `jest: command not found`:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Use npx**:
   ```bash
   npx jest
   ```

### Prisma Client Not Generated

If tests fail with Prisma errors:

```bash
npm run db:generate
```

### Module Not Found Errors

If you see module resolution errors:

1. **Check path aliases** in `jest.config.js`
2. **Verify** `tsconfig.json` has correct paths
3. **Restart** your terminal/IDE

### Test Environment Issues

If tests fail with environment errors:

1. **Check** `.env.local` exists (tests use test values)
2. **Verify** `jest.setup.js` is loaded
3. **Check** mocks are properly configured

## CI/CD

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/ci.yml` for CI configuration.

## Writing New Tests

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API Route Test Example
```typescript
import { POST } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/endpoint', () => {
  it('handles request correctly', async () => {
    const request = new NextRequest('...', {
      method: 'POST',
      body: JSON.stringify({ ... }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Coverage Goals

Target coverage:
- **Components**: 80%+
- **API Routes**: 90%+
- **Utilities**: 85%+

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

