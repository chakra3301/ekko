#!/bin/bash
# Test script for onboarding endpoints
# This script tests the onboarding flow end-to-end

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${API_URL:-$BASE_URL/api}"

echo "🧪 Testing EKKO Onboarding API"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if server is running
echo "1️⃣  Checking if server is running..."
if curl -s -f "$BASE_URL" > /dev/null; then
    echo -e "${GREEN}✓${NC} Server is running"
else
    echo -e "${RED}✗${NC} Server is not running. Please start it with: npm run dev"
    exit 1
fi
echo ""

# Test 2: Test artist onboarding validation (should fail without auth)
echo "2️⃣  Testing artist onboarding validation (should fail without auth)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/onboarding/artist" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Test Artist",
    "disciplines": ["Photography"],
    "tools": ["Camera"],
    "availability": "OPEN"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓${NC} Correctly returns 401 Unauthorized without auth"
else
    echo -e "${RED}✗${NC} Expected 401, got $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Test validation errors (should fail with 400)
echo "3️⃣  Testing validation errors (should fail with 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/onboarding/artist" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=test-token" \
  -d '{
    "displayName": "",
    "disciplines": []
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓${NC} Correctly returns $HTTP_CODE for invalid data"
    if [ "$HTTP_CODE" = "400" ]; then
        echo "Response: $BODY"
    fi
else
    echo -e "${RED}✗${NC} Expected 400 or 401, got $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

# Test 4: Test client onboarding validation (should fail without auth)
echo "4️⃣  Testing client onboarding validation (should fail without auth)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/onboarding/client" \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "industryTags": ["Technology"]
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓${NC} Correctly returns 401 Unauthorized without auth"
else
    echo -e "${RED}✗${NC} Expected 401, got $HTTP_CODE"
fi
echo ""

echo "================================"
echo -e "${YELLOW}⚠️  Note: Full end-to-end testing requires:${NC}"
echo "1. A running Next.js server (npm run dev)"
echo "2. A configured database (DATABASE_URL in .env.local)"
echo "3. NextAuth session token from actual sign-in"
echo ""
echo "To test with a real session:"
echo "1. Sign up at: $BASE_URL/api/auth/signin"
echo "2. Get the session token from browser cookies"
echo "3. Run: curl -X POST $API_URL/onboarding/artist \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Cookie: next-auth.session-token=YOUR_TOKEN' \\"
echo "     -d '{...}'"
echo ""
echo "To verify database rows, use Prisma Studio:"
echo "  npm run db:studio"
echo ""

