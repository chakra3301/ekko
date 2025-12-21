# Admin CLI Scripts Guide

This guide explains how to use the admin CLI scripts for moderation and background tasks.

## Prerequisites

1. **Node.js 18+** installed
2. **Database connection** configured (`DATABASE_URL` in `.env.local`)
3. **Prisma Client** generated:
   ```bash
   npm run db:generate
   ```

## Scripts Overview

### 1. Approve Verification Request

**File**: `scripts/approveVerification.js`

**Purpose**: Approve a pending verification request and update artist's verification tier.

**Usage**:
```bash
node scripts/approveVerification.js <requestId> [tier] [note]
```

**Arguments**:
- `<requestId>` (required): The verification request ID from the database
- `[tier]` (optional): Verification tier - `RED`, `BLACK`, or `PLATINUM` (default: `RED`)
- `[note]` (optional): Admin note explaining the approval (default: "Approved via CLI")

**Examples**:
```bash
# Approve with default RED tier
node scripts/approveVerification.js clx1234567890

# Approve with BLACK tier
node scripts/approveVerification.js clx1234567890 BLACK

# Approve with note
node scripts/approveVerification.js clx1234567890 RED "Excellent portfolio, verified identity"
```

**What it does**:
1. Finds the verification request by ID
2. Validates it's in `PENDING` status
3. Updates request status to `APPROVED`
4. Sets `reviewedAt` timestamp
5. Updates artist's `verificationTier`
6. Stores admin note

**Error handling**:
- Exits with error if request not found
- Exits if request is not pending
- Exits if invalid tier provided

---

### 2. Ban/Unban User

**File**: `scripts/banUser.js`

**Purpose**: Ban or unban a user by setting the `banned` flag.

**Usage**:
```bash
node scripts/banUser.js <userId> [ban|unban]
```

**Arguments**:
- `<userId>` (required): The user ID to ban/unban
- `[action]` (optional): `ban` or `unban` (default: `ban`)

**Examples**:
```bash
# Ban a user
node scripts/banUser.js clx1234567890 ban

# Unban a user
node scripts/banUser.js clx1234567890 unban

# Default action is ban
node scripts/banUser.js clx1234567890
```

**What it does**:
1. Finds the user by ID
2. Checks current ban status
3. Updates `banned` flag
4. Displays user information (name, email, role)

**Note**: The `banned` flag is stored in the database. You'll need to add application logic to check this flag and prevent banned users from accessing the platform.

---

### 3. Recompute Search Scores

**File**: `scripts/recomputeSearchScores.js`

**Purpose**: Recompute search scores for all artists based on verification tier and profile views.

**Usage**:
```bash
node scripts/recomputeSearchScores.js
```

**What it does**:
1. Fetches all artist profiles
2. Computes score for each: `verificationTier * 100 + profileViews`
3. Creates or updates `SearchIndexHint` records
4. Processes in batches of 100 for performance
5. Displays progress and top 5 scores

**Score Formula**:
```
score = (tierWeight * 100) + profileViews

Tier Weights:
- NONE: 0
- RED: 1
- BLACK: 2
- PLATINUM: 3
```

**Example Scores**:
- RED tier, 25 views: `(1 * 100) + 25 = 125`
- BLACK tier, 100 views: `(2 * 100) + 100 = 300`
- PLATINUM tier, 500 views: `(3 * 100) + 500 = 800`

**Output**:
```
🔄 Starting search score recomputation...
📊 Found 150 artists to process
   Processed 100/150 artists...
   Processed 150/150 artists...
✅ Search score recomputation complete
   Created: 10
   Updated: 140
   Errors: 0
   Total: 150

📈 Top 5 scores:
   1. John Photography: 850 (PLATINUM, 550 views)
   2. Jane Design: 320 (BLACK, 120 views)
   ...
```

---

## Scheduling Background Tasks

### Option 1: Cron (Linux/macOS)

For local or server deployments, use cron to schedule the search score recomputation:

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * cd /path/to/ekko && node scripts/recomputeSearchScores.js >> /var/log/ekko-scores.log 2>&1

# Or with environment variables
0 2 * * * cd /path/to/ekko && /usr/bin/env $(cat .env.local | xargs) node scripts/recomputeSearchScores.js
```

### Option 2: Vercel Cron

For Vercel deployments, use Vercel Cron:

1. **Create `vercel.json`**:
```json
{
  "crons": [
    {
      "path": "/api/cron/recompute-scores",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. **Create API route** `app/api/cron/recompute-scores/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(req: Request) {
  // Verify cron secret (recommended)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync('node scripts/recomputeSearchScores.js');
    return NextResponse.json({ 
      success: true, 
      output: stdout,
      errors: stderr 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

3. **Set environment variable**:
```bash
CRON_SECRET=your-secret-key
```

### Option 3: GitHub Actions

For automated runs via GitHub Actions:

1. **Create `.github/workflows/recompute-scores.yml`**:
```yaml
name: Recompute Search Scores

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allows manual trigger

jobs:
  recompute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npm run db:generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Recompute search scores
        run: node scripts/recomputeSearchScores.js
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

2. **Add secret** in GitHub repository settings:
   - Go to Settings → Secrets and variables → Actions
   - Add `DATABASE_URL` secret

### Option 4: Node-cron (Programmatic)

For running within the application:

```typescript
// lib/cron.ts
import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running search score recomputation...');
  try {
    const { stdout } = await execAsync('node scripts/recomputeSearchScores.js');
    console.log(stdout);
  } catch (error) {
    console.error('Error recomputing scores:', error);
  }
});
```

---

## Troubleshooting

### "Prisma Client not generated"

```bash
npm run db:generate
```

### "Cannot find module '@prisma/client'"

```bash
npm install
npm run db:generate
```

### "Database connection error"

Check your `DATABASE_URL` in `.env.local`:
```bash
echo $DATABASE_URL
```

### "Permission denied" (Linux/macOS)

Make scripts executable:
```bash
chmod +x scripts/*.js
```

Or run with node explicitly:
```bash
node scripts/approveVerification.js ...
```

---

## Best Practices

1. **Backup database** before running admin scripts
2. **Test scripts** on staging environment first
3. **Monitor logs** when running scheduled tasks
4. **Set up alerts** for script failures
5. **Use environment-specific** `.env` files
6. **Document** any manual admin actions

---

## Security Notes

- Admin scripts should only be run by trusted administrators
- Consider adding authentication/authorization to cron endpoints
- Store sensitive credentials in environment variables
- Use `CRON_SECRET` for Vercel cron endpoints
- Restrict access to scripts directory in production

