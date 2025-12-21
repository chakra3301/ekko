#!/bin/bash
# Quick test script for onboarding

SESSION_TOKEN="$1"

if [ -z "$SESSION_TOKEN" ]; then
    echo "Usage: ./test-onboarding.sh YOUR_SESSION_TOKEN"
    echo ""
    echo "To get your session token:"
    echo "1. Sign in at http://localhost:3003/api/auth/signin"
    echo "2. Open DevTools (F12) → Application → Cookies"
    echo "3. Copy the value of 'next-auth.session-token'"
    exit 1
fi

echo "Testing artist onboarding..."
echo ""

curl -X POST http://localhost:3003/api/onboarding/artist \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "displayName": "Test Artist",
    "disciplines": ["Photography", "Portrait Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom"],
    "availability": "OPEN",
    "bio": "Test bio for onboarding"
  }' | jq .

echo ""
echo "Done! Check Prisma Studio at http://localhost:51212/ to verify the database rows."

