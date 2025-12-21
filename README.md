# EKKO MVP

A Next.js (App Router) TypeScript project scaffold with authentication, payments, and storage integrations.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email + Google providers)
- **Payments**: Stripe
- **Storage**: S3-compatible interface with local mock

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (local or remote)
- (Optional) Stripe account for payments
- (Optional) Google OAuth credentials for authentication

### Installation

1. **Clone and install dependencies:**

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your configuration values:

- **Database**: Set `DATABASE_URL` to your PostgreSQL connection string
- **NextAuth**: Generate `NEXTAUTH_SECRET` with: `openssl rand -base64 32`
- **Email**: Configure SMTP settings for email authentication
- **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- **Stripe**: Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/)

3. **Set up the database:**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create a migration (for production)
npm run db:migrate
```

4. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ekko/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── webhooks/     # Webhook handlers (Stripe, etc.)
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
├── lib/                   # Utility functions and helpers
│   ├── nextauth.ts       # NextAuth configuration
│   ├── prisma.ts         # Prisma Client singleton
│   ├── stripe.ts         # Stripe integration helpers
│   └── storage.ts        # Storage interface and implementations
├── pages/                 # Legacy pages (for compatibility)
│   └── api/              # Legacy API routes
├── prisma/                # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── styles/                # Global styles
│   └── globals.css       # Tailwind CSS and global styles
└── tests/                 # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database (dev)
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

### Required for Development
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for JWT encryption

### Optional (for full functionality)
- `EMAIL_SERVER` - SMTP server for email authentication
- `EMAIL_FROM` - Email sender address
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STORAGE_*` - S3-compatible storage configuration

## Development Checklist

### Immediate Next Steps

- [ ] Set up PostgreSQL database and configure `DATABASE_URL`
- [ ] Generate `NEXTAUTH_SECRET` and add to `.env.local`
- [ ] Configure email provider (SMTP) for email authentication
- [ ] Set up Google OAuth credentials in Google Cloud Console
- [ ] Create initial Prisma models based on your requirements
- [ ] Run `npm run db:push` to sync database schema
- [ ] Test authentication flow (sign in with email/Google)
- [ ] Configure Stripe account and add API keys
- [ ] Test Stripe webhook endpoint (use Stripe CLI for local testing)
- [ ] Implement S3 storage or continue using local mock
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking (Sentry, etc.)
- [ ] Set up logging and monitoring

### Authentication Setup

1. **Email Provider:**
   - Configure SMTP server in `EMAIL_SERVER` (format: `smtp://user:pass@host:port`)
   - Set `EMAIL_FROM` to your sender email

2. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env.local`

### Stripe Setup

1. **Get API Keys:**
   - Sign up at [stripe.com](https://stripe.com)
   - Get test keys from Dashboard → Developers → API keys
   - Add to `.env.local`

2. **Webhook Testing (Local):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Database Setup

1. **Local PostgreSQL:**
   ```bash
   # Using Docker
   docker run --name ekko-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ekko -p 5432:5432 -d postgres
   ```

2. **Remote PostgreSQL:**
   - Use services like Supabase, Railway, or Neon
   - Copy connection string to `DATABASE_URL`

## Code Quality

- **ESLint**: Configured with TypeScript, React, and Next.js rules
- **Prettier**: Code formatting with Tailwind CSS plugin
- **Husky**: Pre-commit hooks for linting and formatting
- **TypeScript**: Strict mode enabled for type safety

## Storage

The project includes a storage interface that supports:
- **Local Storage** (default): Mock implementation for development
- **S3-Compatible**: Interface ready for AWS S3, DigitalOcean Spaces, etc.

Switch between implementations using `STORAGE_PROVIDER` environment variable.

## Authentication

NextAuth.js is configured with:
- **Email**: Magic link authentication via email
- **Google**: OAuth 2.0 authentication

Add more providers by extending `lib/nextauth.ts`.

## Payments

Stripe integration includes:
- Server-side Stripe client helper
- Checkout session creation
- Customer management
- Webhook event handling

Implement payment flows in your API routes using `lib/stripe.ts`.

## Admin CLI Scripts

The project includes Node.js CLI scripts for administrative tasks. These scripts require:
- Node.js 18+
- Database connection (`DATABASE_URL` in `.env.local`)
- Prisma Client generated (`npm run db:generate`)

### Running Scripts

All scripts use ES modules and can be run directly with Node.js:

```bash
# Make sure Prisma Client is generated
npm run db:generate

# Run scripts with node
node scripts/approveVerification.js <requestId> [tier] [note]
node scripts/banUser.js <userId> [ban|unban]
node scripts/recomputeSearchScores.js
```

### Available Scripts

#### 1. Approve Verification Request

```bash
node scripts/approveVerification.js <requestId> [tier] [note]
```

**Example**:
```bash
node scripts/approveVerification.js clx123456 RED "Approved - excellent portfolio"
node scripts/approveVerification.js clx789012 BLACK
```

**Arguments**:
- `requestId` (required): Verification request ID
- `tier` (optional): RED, BLACK, or PLATINUM (default: RED)
- `note` (optional): Admin note (default: "Approved via CLI")

**What it does**:
- Updates verification request status to `APPROVED`
- Sets `reviewedAt` timestamp
- Updates artist's `verificationTier`
- Stores admin note

#### 2. Ban/Unban User

```bash
node scripts/banUser.js <userId> [ban|unban]
```

**Example**:
```bash
node scripts/banUser.js clx123456 ban
node scripts/banUser.js clx123456 unban
```

**Arguments**:
- `userId` (required): User ID to ban/unban
- `action` (optional): `ban` or `unban` (default: `ban`)

**What it does**:
- Sets `banned` flag on User model
- Banned users can be filtered out in application logic

#### 3. Recompute Search Scores

```bash
node scripts/recomputeSearchScores.js
```

**What it does**:
- Recomputes `SearchIndexHint.score` for all artists
- Formula: `verificationTier * 100 + profileViews`
- Creates or updates search index hints
- Processes in batches for performance

**Score Formula**:
- NONE tier: 0 * 100 = 0
- RED tier: 1 * 100 = 100
- BLACK tier: 2 * 100 = 200
- PLATINUM tier: 3 * 100 = 300
- Plus profile views (e.g., 50 views = +50)

**Example scores**:
- RED tier with 25 views: 125
- BLACK tier with 100 views: 300
- PLATINUM tier with 500 views: 800

### Scheduled Tasks

#### Option 1: Cron (Linux/macOS)

Add to crontab for daily recomputation:

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * cd /path/to/ekko && node scripts/recomputeSearchScores.js >> /var/log/ekko-scores.log 2>&1
```

#### Option 2: Vercel Cron

Create `vercel.json`:

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

Create API route `app/api/cron/recompute-scores/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function GET(req: Request) {
  // Verify cron secret (recommended)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Run script
  const script = spawn('node', ['scripts/recomputeSearchScores.js'], {
    cwd: process.cwd(),
    env: process.env,
  });

  script.stdout.on('data', (data) => console.log(data.toString()));
  script.stderr.on('data', (data) => console.error(data.toString()));

  return NextResponse.json({ success: true });
}
```

#### Option 3: GitHub Actions

Create `.github/workflows/recompute-scores.yml`:

```yaml
name: Recompute Search Scores

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  recompute:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:generate
      - run: node scripts/recomputeSearchScores.js
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Environment Variables

All scripts require these environment variables:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ekko
```

Optional for cron API route:
```bash
CRON_SECRET=your-secret-key
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment checklist:
1. Set up environment variables (see `.env.example`)
2. Run database migrations: `npm run db:migrate`
3. Deploy to Vercel (or your preferred platform)
4. Configure Stripe webhooks
5. Set up monitoring (Sentry, etc.)

## License

[Add your license here]

## Support

[Add support information here]

