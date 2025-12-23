# Fix Build Error - Permission Issue

## Current Error

```
Error: Failed to read source code from 
/Users/lucaorion/ekko/node_modules/next/dist/client/components/router-reducer/create-router-cache-key.js

Caused by: Operation not permitted (os error 1)
```

This is a **file permission issue** with the `node_modules` directory.

## Solutions (Try in Order)

### Solution 1: Fix File Permissions

```bash
# Fix permissions on node_modules
chmod -R u+r node_modules/next

# Or fix all node_modules
chmod -R u+r node_modules
```

### Solution 2: Reinstall Dependencies

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

### Solution 3: Clear All Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Solution 4: Check Disk Space

```bash
# Check if you have enough disk space
df -h
```

### Solution 5: Run with Different Permissions

If you're on macOS and using certain security settings:

```bash
# Try running with sudo (be careful!)
sudo npm run dev
```

Or check if you need to allow Terminal/your IDE to access the directory in System Preferences.

### Solution 6: Use a Different Node Version

Sometimes Node version issues can cause permission problems:

```bash
# Check Node version
node --version

# If using nvm, try a different version
nvm use 18
# or
nvm use 20
```

### Solution 7: Check File System

```bash
# Check if the file exists and is readable
ls -la node_modules/next/dist/client/components/router-reducer/create-router-cache-key.js

# If it doesn't exist, reinstall
npm install
```

## Quick Fix Script

Run this sequence:

```bash
# 1. Stop any running dev servers
pkill -f "next dev"

# 2. Clear caches
rm -rf .next node_modules/.cache

# 3. Fix permissions
chmod -R u+r node_modules/next 2>/dev/null || true

# 4. Try to start dev server
npm run dev
```

## Alternative: Use Production Build

If dev server continues to fail, try production build:

```bash
# Build for production
npm run build

# Start production server
npm start
```

Production builds sometimes avoid the permission issues.

## Check System Settings (macOS)

If on macOS, check:

1. **System Preferences → Security & Privacy → Privacy → Files and Folders**
   - Make sure Terminal/your IDE has access to the project directory

2. **System Preferences → Security & Privacy → Privacy → Full Disk Access**
   - Make sure Terminal/your IDE has full disk access if needed

## Verify Fix

After applying a solution, verify:

```bash
# Try to read the problematic file
cat node_modules/next/dist/client/components/router-reducer/create-router-cache-key.js | head -5

# If this works, the dev server should work
npm run dev
```

## If Nothing Works

1. **Check if it's a sandbox/container issue**:
   - If running in Docker, check volume permissions
   - If running in a VM, check shared folder permissions

2. **Try a fresh clone**:
   ```bash
   # Backup your .env and other important files
   cp .env .env.backup
   
   # Remove everything except source files
   rm -rf node_modules .next
   
   # Reinstall
   npm install
   ```

3. **Check for antivirus/security software**:
   - Some security software blocks access to node_modules
   - Add exception for your project directory

## Expected Result

After fixing, you should see:

```
✓ Ready in X seconds
○ Compiling / ...
✓ Compiled / in XXXms
```

Then the signin page should work at:
```
http://localhost:3000/api/auth/signin
```

