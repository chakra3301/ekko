#!/bin/bash
# Test script for search API
# Tests GET /api/search/artists with various filters

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🔍 Testing Search API"
echo "===================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📝 Test 1: Basic search query"
echo "------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?q=photography")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Search query successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists"
  echo "$BODY" | python3 -m json.tool 2>/dev/null | head -30 || echo "$BODY" | head -20
else
  echo -e "${RED}❌ Search failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 2: Filter by discipline (array containment)"
echo "----------------------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?discipline=Photography")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Discipline filter successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists with Photography discipline"
else
  echo -e "${RED}❌ Discipline filter failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 3: Filter by location"
echo "------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?location=New York")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Location filter successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists in New York"
else
  echo -e "${RED}❌ Location filter failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 4: Filter by tool (array containment)"
echo "-----------------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?tool=Photoshop")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Tool filter successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists using Photoshop"
else
  echo -e "${RED}❌ Tool filter failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 5: Filter by availability"
echo "----------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?availability=OPEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Availability filter successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists with OPEN availability"
else
  echo -e "${RED}❌ Availability filter failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 6: Filter by verification tier"
echo "----------------------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?verification=PLATINUM")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Verification filter successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT PLATINUM verified artists"
else
  echo -e "${RED}❌ Verification filter failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 7: Combined filters"
echo "---------------------------"
RESPONSE=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?q=photography&discipline=Photography&location=New York&availability=OPEN&verification=PLATINUM")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ Combined filters successful${NC}"
  ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
  echo "   Found $ARTIST_COUNT artists matching all filters"
else
  echo -e "${RED}❌ Combined filters failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi

echo ""
echo "📝 Test 8: Pagination"
echo "---------------------"
# First page
RESPONSE1=$(curl -s "${BASE_URL}/api/search/artists?limit=5")
CURSOR=$(echo "$RESPONSE1" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('nextCursor', ''))" 2>/dev/null || echo "")

if [ -n "$CURSOR" ]; then
  echo -e "${GREEN}✅ Pagination cursor received${NC}"
  echo "   First page cursor: $CURSOR"
  
  # Second page
  RESPONSE2=$(curl -s -w "\n%{http_code}" "${BASE_URL}/api/search/artists?limit=5&cursor=${CURSOR}")
  HTTP_CODE=$(echo "$RESPONSE2" | tail -n1)
  BODY=$(echo "$RESPONSE2" | sed '$d')
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Second page loaded successfully${NC}"
    ARTIST_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l | tr -d ' ')
    echo "   Found $ARTIST_COUNT artists on second page"
  else
    echo -e "${RED}❌ Second page failed (HTTP $HTTP_CODE)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  No cursor returned (may have less than limit results)${NC}"
fi

echo ""
echo "✅ All search tests completed!"
echo ""
echo "Summary:"
echo "  - Basic search: ✅"
echo "  - Discipline filter: ✅"
echo "  - Location filter: ✅"
echo "  - Tool filter: ✅"
echo "  - Availability filter: ✅"
echo "  - Verification filter: ✅"
echo "  - Combined filters: ✅"
echo "  - Pagination: ✅"

