#!/bin/bash
# Test script for feed and post creation
# Tests POST /api/posts and GET /api/feed endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
SESSION_TOKEN="${SESSION_TOKEN:-}"

echo "🧪 Testing Feed and Post Creation"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if session token is provided
if [ -z "$SESSION_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  SESSION_TOKEN not set. You need to authenticate first.${NC}"
  echo "   To get a session token:"
  echo "   1. Sign in at ${BASE_URL}/api/auth/signin"
  echo "   2. Copy the 'next-auth.session-token' cookie value"
  echo "   3. Run: export SESSION_TOKEN='your-token-here'"
  echo ""
  echo "   Or run this script with: SESSION_TOKEN='your-token' ./scripts/test-feed.sh"
  echo ""
  exit 1
fi

echo "📝 Step 1: Create a new post"
echo "----------------------------"
POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/posts" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}" \
  -d '{
    "content": "Test post from curl script - '$(date +%s)'",
    "mediaUrls": ["/mock-storage/test-post.jpg"],
    "postType": "IMAGE"
  }')

HTTP_CODE=$(echo "$POST_RESPONSE" | tail -n1)
POST_BODY=$(echo "$POST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✅ Post created successfully${NC}"
  POST_ID=$(echo "$POST_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   Post ID: $POST_ID"
  echo "$POST_BODY" | python3 -m json.tool 2>/dev/null || echo "$POST_BODY"
else
  echo -e "${RED}❌ Failed to create post (HTTP $HTTP_CODE)${NC}"
  echo "$POST_BODY"
  exit 1
fi

echo ""
echo "📰 Step 2: Get Latest feed"
echo "--------------------------"
LATEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/feed?mode=latest&limit=5" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}")

LATEST_HTTP_CODE=$(echo "$LATEST_RESPONSE" | tail -n1)
LATEST_BODY=$(echo "$LATEST_RESPONSE" | sed '$d')

if [ "$LATEST_HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Latest feed retrieved successfully${NC}"
  POST_COUNT=$(echo "$LATEST_BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $POST_COUNT posts"
  
  # Check if our post is in the feed
  if echo "$LATEST_BODY" | grep -q "$POST_ID"; then
    echo -e "${GREEN}✅ Created post appears in Latest feed${NC}"
  else
    echo -e "${YELLOW}⚠️  Created post not found in Latest feed (may need to refresh)${NC}"
  fi
  
  echo ""
  echo "Latest feed (first 3 posts):"
  echo "$LATEST_BODY" | python3 -m json.tool 2>/dev/null | head -50 || echo "$LATEST_BODY" | head -20
else
  echo -e "${RED}❌ Failed to get Latest feed (HTTP $LATEST_HTTP_CODE)${NC}"
  echo "$LATEST_BODY"
  exit 1
fi

echo ""
echo "🎯 Step 3: Get For You feed (sorted by verification)"
echo "-----------------------------------------------------"
FORYOU_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/feed?mode=foryou&limit=5" \
  -H "Cookie: next-auth.session-token=${SESSION_TOKEN}")

FORYOU_HTTP_CODE=$(echo "$FORYOU_RESPONSE" | tail -n1)
FORYOU_BODY=$(echo "$FORYOU_RESPONSE" | sed '$d')

if [ "$FORYOU_HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ For You feed retrieved successfully${NC}"
  FORYOU_POST_COUNT=$(echo "$FORYOU_BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $FORYOU_POST_COUNT posts"
  
  # Extract verification tiers from posts
  echo ""
  echo "Verification tier order (should be PLATINUM > BLACK > RED > NONE):"
  echo "$FORYOU_BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for i, post in enumerate(data.get('posts', [])[:5], 1):
        tier = post.get('author', {}).get('artistProfile', {}).get('verificationTier', 'NONE')
        name = post.get('author', {}).get('artistProfile', {}).get('displayName', 'Unknown')
        print(f'  {i}. {tier:8} - {name}')
except:
    print('  (Could not parse JSON)')
" 2>/dev/null || echo "  (Could not parse verification tiers)"
  
  echo ""
  echo "For You feed (first 3 posts):"
  echo "$FORYOU_BODY" | python3 -m json.tool 2>/dev/null | head -50 || echo "$FORYOU_BODY" | head -20
else
  echo -e "${RED}❌ Failed to get For You feed (HTTP $FORYOU_HTTP_CODE)${NC}"
  echo "$FORYOU_BODY"
  exit 1
fi

echo ""
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "  - Post creation: ✅"
echo "  - Latest feed: ✅"
echo "  - For You feed: ✅"
echo "  - Verification sorting: Check output above"

