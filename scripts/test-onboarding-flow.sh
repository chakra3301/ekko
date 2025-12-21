#!/bin/bash
# Interactive test script for onboarding flow

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${API_URL:-$BASE_URL/api}"

echo "🧪 EKKO Onboarding Flow Test"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Get Session Token${NC}"
echo "1. Open your browser and go to: ${BASE_URL}/api/auth/signin"
echo "2. Sign in with Email or Google"
echo "3. Open browser DevTools (F12) > Application > Cookies"
echo "4. Copy the value of 'next-auth.session-token'"
echo ""
read -p "Paste your session token here (or press Enter to skip): " SESSION_TOKEN

if [ -z "$SESSION_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  Skipping API test. You can test manually with:${NC}"
    echo ""
    echo "curl -X POST ${API_URL}/onboarding/artist \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -H 'Cookie: next-auth.session-token=YOUR_TOKEN' \\"
    echo "  -d '{"
    echo "    \"displayName\": \"Test Artist\","
    echo "    \"disciplines\": [\"Photography\"],"
    echo "    \"tools\": [\"Canon EOS R5\"],"
    echo "    \"availability\": \"OPEN\""
    echo "  }'"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 2: Testing Artist Onboarding${NC}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/onboarding/artist" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "displayName": "Test Artist",
    "disciplines": ["Photography", "Portrait Photography"],
    "tools": ["Canon EOS R5", "Adobe Lightroom"],
    "availability": "OPEN",
    "bio": "Test bio for onboarding"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✅ Success! Profile created${NC}"
    echo ""
    echo -e "${BLUE}Step 3: Verify in Database${NC}"
    echo "1. Open Prisma Studio: http://localhost:5555"
    echo "2. Check the 'users' table - profileCompleted should be true"
    echo "3. Check the 'artist_profiles' table - new profile should appear"
    echo ""
    echo "Or run: npm run db:verify"
else
    echo -e "${YELLOW}⚠️  Request failed with status $HTTP_CODE${NC}"
    echo "Check the response above for error details"
fi

echo ""
echo -e "${BLUE}Step 4: Test Client Onboarding (Optional)${NC}"
read -p "Test client onboarding? (y/n): " TEST_CLIENT

if [ "$TEST_CLIENT" = "y" ]; then
    echo ""
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/onboarding/client" \
      -H "Content-Type: application/json" \
      -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
      -d '{
        "companyName": "Test Company Inc",
        "industryTags": ["Technology", "SaaS"]
      }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    if [ "$HTTP_CODE" = "201" ]; then
        echo -e "${GREEN}✅ Client profile created!${NC}"
    fi
fi

echo ""
echo "=============================="
echo "Test complete!"

