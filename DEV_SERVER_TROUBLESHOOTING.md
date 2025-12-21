# Dev Server Troubleshooting

## Current Issue

The Next.js dev server is running but encountering a build error:
```
Module build failed: Operation not permitted (os error 1)
Failed to read source code from node_modules/next/dist/client/components/router-reducer/create-href-from-url.js
```

## Solutions

### Solution 1: Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

### Solution 2: Reinstall Dependencies

If clearing cache doesn't work:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Solution 3: Check File Permissions

The error suggests a permission issue. Check if you can read the file:

```bash
ls -la node_modules/next/dist/client/components/router-reducer/create-href-from-url.js
```

If permissions are wrong, fix them:

```bash
chmod -R u+r node_modules/next
```

### Solution 4: Run with Different Permissions

If you're in a sandboxed environment, you may need to run with elevated permissions or outside the sandbox.

### Solution 5: Use a Different Port

Sometimes port conflicts can cause issues:

```bash
PORT=3001 npm run dev
```

## Verification

Once the server starts successfully, you should see:

```
✓ Ready in X seconds
○ Compiling / ...
✓ Compiled / in XXXms
```

Then test the API:

```bash
# Test feed endpoint
curl http://localhost:3000/api/feed?mode=latest \
  -H "Cookie: next-auth.session-token=your-token"
```

## Alternative: Test API Routes Directly

If the dev server continues to have issues, you can test the API routes using Next.js API route testing or by running the build:

```bash
npm run build
npm start
```

This will use the production build which may avoid the development build issues.

