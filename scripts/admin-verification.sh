#!/bin/bash
# Admin script for managing verification requests
# Usage: ./scripts/admin-verification.sh [command] [args]

set -e

# Load admin secret from environment or prompt
ADMIN_SECRET="${ADMIN_SECRET:-}"
if [ -z "$ADMIN_SECRET" ]; then
  echo "Enter admin secret:"
  read -s ADMIN_SECRET
fi

BASE_URL="${BASE_URL:-http://localhost:3000}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

case "$1" in
  list)
    echo -e "${BLUE}Fetching pending verification requests...${NC}"
    curl -s "${BASE_URL}/api/verifications/pending?adminSecret=${ADMIN_SECRET}" \
      -H "x-admin-secret: ${ADMIN_SECRET}" \
      | jq '.'
    ;;
  
  approve)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Request ID required${NC}"
      echo "Usage: $0 approve <request-id> [tier] [note]"
      exit 1
    fi
    
    REQUEST_ID="$2"
    TIER="${3:-RED}"
    NOTE="${4:-Approved by admin}"
    
    echo -e "${BLUE}Approving verification request ${REQUEST_ID}...${NC}"
    curl -X POST "${BASE_URL}/api/verifications/${REQUEST_ID}/approve?adminSecret=${ADMIN_SECRET}" \
      -H "Content-Type: application/json" \
      -H "x-admin-secret: ${ADMIN_SECRET}" \
      -d "{\"verificationTier\": \"${TIER}\", \"adminNote\": \"${NOTE}\"}" \
      | jq '.'
    ;;
  
  reject)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Request ID required${NC}"
      echo "Usage: $0 reject <request-id> <reason>"
      exit 1
    fi
    
    REQUEST_ID="$2"
    REASON="${3:-Rejected by admin}"
    
    echo -e "${BLUE}Rejecting verification request ${REQUEST_ID}...${NC}"
    curl -X POST "${BASE_URL}/api/verifications/${REQUEST_ID}/reject?adminSecret=${ADMIN_SECRET}" \
      -H "Content-Type: application/json" \
      -H "x-admin-secret: ${ADMIN_SECRET}" \
      -d "{\"adminNote\": \"${REASON}\"}" \
      | jq '.'
    ;;
  
  *)
    echo "Usage: $0 [command] [args]"
    echo ""
    echo "Commands:"
    echo "  list                          List all pending verification requests"
    echo "  approve <id> [tier] [note]    Approve a request (tier: RED, BLACK, PLATINUM)"
    echo "  reject <id> <reason>          Reject a request with a reason"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 approve clx123456 RED 'Looks good!'"
    echo "  $0 reject clx123456 'Insufficient evidence'"
    exit 1
    ;;
esac

