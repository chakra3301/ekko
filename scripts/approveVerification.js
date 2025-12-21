#!/usr/bin/env node
/**
 * Admin CLI script to approve verification requests
 * Usage: node scripts/approveVerification.js <requestId> [tier] [note]
 * 
 * Example:
 *   node scripts/approveVerification.js clx123456 RED "Approved - excellent portfolio"
 * 
 * Note: Run with tsx for TypeScript support:
 *   npx tsx scripts/approveVerification.js <requestId> [tier] [note]
 */

const { PrismaClient, VerificationStatus, VerificationTier } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: Verification request ID is required');
    console.error('Usage: node scripts/approveVerification.js <requestId> [tier] [note]');
    console.error('  tier: RED, BLACK, or PLATINUM (default: RED)');
    console.error('  note: Optional admin note');
    process.exit(1);
  }

  const requestId = args[0];
  const tier = (args[1] || 'RED').toUpperCase();
  const note = args.slice(2).join(' ') || 'Approved via CLI';

  // Validate tier
  if (!Object.values(VerificationTier).includes(tier)) {
    console.error(`Error: Invalid tier "${tier}"`);
    console.error('Valid tiers: RED, BLACK, PLATINUM');
    process.exit(1);
  }

  try {
    // Find the verification request
    const request = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
            userId: true,
          },
        },
      },
    });

    if (!request) {
      console.error(`Error: Verification request "${requestId}" not found`);
      process.exit(1);
    }

    if (request.status !== VerificationStatus.PENDING) {
      console.error(`Error: Request is not pending (current status: ${request.status})`);
      process.exit(1);
    }

    // Approve the request
    await prisma.$transaction([
      prisma.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
          adminNote: note,
        },
      }),
      prisma.artistProfile.update({
        where: { id: request.artistId },
        data: {
          verificationTier: tier,
        },
      }),
    ]);

    console.log(`✅ Verification request "${requestId}" approved`);
    console.log(`   Artist: ${request.artist.displayName}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Note: ${note}`);
  } catch (error) {
    console.error('Error approving verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

