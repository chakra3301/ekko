# Task 10: Admin CLI & Background Tasks - Implementation Summary

## Overview
Created Node.js CLI scripts for admin moderation tasks and a background script for recomputing search scores.

## Database Changes

### User Model Update
- Added `banned` boolean field (default: `false`)
- Allows banning/unbanning users via CLI

## CLI Scripts

### 1. approveVerification.js
**File**: `scripts/approveVerification.js`

**Purpose**: Approve verification requests and update artist verification tier.

**Usage**:
```bash
node scripts/approveVerification.js <requestId> [tier] [note]
```

**Features**:
- ✅ Validates request exists and is pending
- ✅ Updates verification request status to `APPROVED`
- ✅ Sets `reviewedAt` timestamp
- ✅ Updates artist's `verificationTier`
- ✅ Stores admin note
- ✅ Uses database transaction for atomicity

**Example**:
```bash
node scripts/approveVerification.js clx123456 RED "Approved - excellent portfolio"
```

### 2. banUser.js
**File**: `scripts/banUser.js`

**Purpose**: Ban or unban users by setting the `banned` flag.

**Usage**:
```bash
node scripts/banUser.js <userId> [ban|unban]
```

**Features**:
- ✅ Validates user exists
- ✅ Sets/unsets `banned` flag
- ✅ Displays user information
- ✅ Prevents duplicate operations

**Example**:
```bash
node scripts/banUser.js clx123456 ban
node scripts/banUser.js clx123456 unban
```

### 3. recomputeSearchScores.js
**File**: `scripts/recomputeSearchScores.js`

**Purpose**: Recompute search scores for all artists.

**Usage**:
```bash
node scripts/recomputeSearchScores.js
```

**Features**:
- ✅ Processes all artists in batches (100 at a time)
- ✅ Computes score: `verificationTier * 100 + profileViews`
- ✅ Creates or updates `SearchIndexHint` records
- ✅ Shows progress and top scores
- ✅ Error handling per artist (continues on error)

**Score Formula**:
```
score = (tierWeight * 100) + profileViews

Tier Weights:
- NONE: 0
- RED: 1
- BLACK: 2
- PLATINUM: 3
```

**Example Output**:
```
🔄 Starting search score recomputation...
📊 Found 150 artists to process
   Processed 100/150 artists...
✅ Search score recomputation complete
   Created: 10
   Updated: 140
   Errors: 0
```

## Scheduling Options

### 1. Cron (Linux/macOS)
```bash
# Daily at 2 AM
0 2 * * * cd /path/to/ekko && node scripts/recomputeSearchScores.js
```

### 2. Vercel Cron
- Configure in `vercel.json`
- Create API route `/api/cron/recompute-scores`
- Use `CRON_SECRET` for authentication

### 3. GitHub Actions
- Schedule via `.github/workflows/recompute-scores.yml`
- Run on schedule or manual trigger
- Use repository secrets for `DATABASE_URL`

### 4. Node-cron (Programmatic)
- Run within application using `node-cron` package
- Schedule programmatically

## Documentation

### README Updates
- Added "Admin CLI Scripts" section
- Included usage examples
- Provided scheduling options
- Added environment variable requirements

### Admin CLI Guide
**File**: `ADMIN_CLI_GUIDE.md`

**Contents**:
- Detailed script documentation
- Usage examples
- Scheduling options with code examples
- Troubleshooting guide
- Security best practices

## Files Created

### Scripts
- `scripts/approveVerification.js` - Approve verification requests
- `scripts/banUser.js` - Ban/unban users
- `scripts/recomputeSearchScores.js` - Recompute search scores

### Documentation
- `ADMIN_CLI_GUIDE.md` - Comprehensive CLI guide
- `TASK_10_IMPLEMENTATION.md` - This file
- Updated `README.md` with admin CLI section

### Schema Updates
- Updated `prisma/schema.prisma` with `banned` field

## Usage Examples

### Approve Verification
```bash
# Get request ID from database or admin panel
node scripts/approveVerification.js clx1234567890 RED "Looks good!"
```

### Ban User
```bash
# Ban a user
node scripts/banUser.js clx1234567890 ban

# Unban a user
node scripts/banUser.js clx1234567890 unban
```

### Recompute Scores
```bash
# Run manually
node scripts/recomputeSearchScores.js

# Or schedule via cron
0 2 * * * cd /path/to/ekko && node scripts/recomputeSearchScores.js
```

## Prerequisites

1. **Node.js 18+**
2. **Database connection** (`DATABASE_URL` in `.env.local`)
3. **Prisma Client generated**:
   ```bash
   npm run db:generate
   ```

## Database Migration

After adding the `banned` field, run:

```bash
npm run db:push
# or
npx prisma migrate dev --name add_banned_flag
```

## Error Handling

All scripts include:
- Input validation
- Error messages with usage instructions
- Graceful error handling
- Database connection cleanup
- Exit codes (0 = success, 1 = error)

## Security Considerations

1. **Access Control**: Scripts should only be run by trusted administrators
2. **Environment Variables**: Store sensitive data in `.env.local`
3. **Cron Authentication**: Use `CRON_SECRET` for Vercel cron endpoints
4. **Logging**: Monitor script execution and errors
5. **Backup**: Backup database before running admin scripts

## Status: ✅ COMPLETE

All requirements met:
- ✅ `approveVerification.js` script created
- ✅ `banUser.js` script created (with `banned` field)
- ✅ `recomputeSearchScores.js` script created
- ✅ README updated with instructions
- ✅ Scheduling options documented
- ✅ Comprehensive guide provided

