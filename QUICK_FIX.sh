#!/bin/bash
# Quick fix script for Next.js build permission errors

echo "🔧 Fixing Next.js build permissions..."

# Stop any running dev servers
echo "1. Stopping dev servers..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Clear Next.js cache
echo "2. Clearing .next cache..."
rm -rf .next

# Try to fix permissions on Next.js files
echo "3. Fixing permissions on node_modules/next..."
if [ -d "node_modules/next" ]; then
    chmod -R u+r node_modules/next 2>/dev/null || echo "   ⚠️  Could not fix permissions (may need sudo)"
else
    echo "   ⚠️  node_modules/next not found, will reinstall"
fi

# Check if we can read the problematic file
echo "4. Checking file access..."
if [ -f "node_modules/next/dist/client/components/router-reducer/create-router-cache-key.js" ]; then
    if [ -r "node_modules/next/dist/client/components/router-reducer/create-router-cache-key.js" ]; then
        echo "   ✅ File is readable"
    else
        echo "   ❌ File exists but is not readable"
        echo "   Try: sudo chmod -R u+r node_modules/next"
    fi
else
    echo "   ⚠️  File not found, node_modules may need reinstall"
    echo "   Run: npm install"
fi

echo ""
echo "✅ Fix script completed!"
echo ""
echo "Next steps:"
echo "  1. If permissions were fixed, try: npm run dev"
echo "  2. If file not found, run: npm install"
echo "  3. If still failing, try: sudo npm run dev (be careful!)"

