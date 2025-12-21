# Fix Missing Dependencies

## Issue
The packages `clsx` and `tailwind-merge` are listed in `package.json` but not installed in `node_modules`.

## Solution

Run this command in your terminal (outside of the sandbox):

```bash
npm install
```

This will install all missing dependencies including `clsx` and `tailwind-merge`.

## Alternative: Install specific packages

If `npm install` doesn't work, try:

```bash
npm install clsx tailwind-merge
```

## After Installation

1. **Restart the dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **The error should be gone** and the feed page should compile successfully.

## Verify Installation

After running `npm install`, check:

```bash
ls node_modules/clsx
ls node_modules/tailwind-merge
```

Both should exist.

## Why This Happened

The packages are in `package.json` but weren't installed in `node_modules`. This can happen if:
- `node_modules` was deleted
- Dependencies weren't installed after adding to `package.json`
- Installation was interrupted

Running `npm install` will fix it.

