# Start Dev Server

## The server appears to have stopped. Here's how to restart it:

### Step 1: Check if server is running

```bash
# Check if anything is on port 3000
lsof -ti:3000

# If nothing is returned, server is not running
```

### Step 2: Start the dev server

```bash
npm run dev
```

### Step 3: Wait for compilation

You should see:
```
✓ Starting...
✓ Ready in XXXms
○ Compiling / ...
✓ Compiled / in XXXms
```

### Step 4: Verify server is running

Once you see "Ready", the server is running. Then try:
```
http://localhost:3000
```

## Alternative: Use a different port

If port 3000 is in use:

```bash
PORT=3001 npm run dev
```

Then access:
```
http://localhost:3001
```

## Troubleshooting

### Port already in use?

```bash
# Find what's using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Then start server
npm run dev
```

### Server starts but pages don't load?

1. Check terminal for errors
2. Make sure you see "Ready" message
3. Try accessing `http://localhost:3000` (root page)
4. Check browser console (F12) for errors

### Still getting -102 error?

- Make sure server is actually running (check terminal)
- Try `http://127.0.0.1:3000` instead of `localhost`
- Check firewall/antivirus isn't blocking
- Try a different browser

