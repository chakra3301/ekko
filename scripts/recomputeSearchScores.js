#!/usr/bin/env node
/**
 * Background task to recompute search scores for all artists
 * Formula: verificationTier * 100 + profileViews
 * 
 * Usage: node scripts/recomputeSearchScores.js
 * 
 * This script can be run:
 * - Manually: node scripts/recomputeSearchScores.js
 * - Via cron: Add to crontab for scheduled runs
 * - Via Vercel Cron: Configure in vercel.json
 * 
 * Note: Run with tsx for TypeScript support:
 *   npx tsx scripts/recomputeSearchScores.js
 */

const { PrismaClient, VerificationTier } = require('@prisma/client');

const prisma = new PrismaClient();

// Tier weights for scoring
const TIER_WEIGHTS = {
  [VerificationTier.NONE]: 0,
  [VerificationTier.RED]: 1,
  [VerificationTier.BLACK]: 2,
  [VerificationTier.PLATINUM]: 3,
};

/**
 * Compute search score for an artist
 * Formula: verificationTier * 100 + profileViews
 */
function computeScore(verificationTier, profileViews) {
  const tierWeight = TIER_WEIGHTS[verificationTier] || 0;
  return tierWeight * 100 + profileViews;
}

async function main() {
  console.log('🔄 Starting search score recomputation...');

  try {
    // Get all artists
    const artists = await prisma.artistProfile.findMany({
      select: {
        id: true,
        verificationTier: true,
        profileViews: true,
      },
    });

    console.log(`📊 Found ${artists.length} artists to process`);

    let updated = 0;
    let created = 0;
    let errors = 0;

    // Process in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (artist) => {
          try {
            const score = computeScore(artist.verificationTier, artist.profileViews);

            // Upsert search index hint
            await prisma.searchIndexHint.upsert({
              where: { artistId: artist.id },
              create: {
                artistId: artist.id,
                score,
              },
              update: {
                score,
              },
            });

            // Track if it was created or updated
            const existing = await prisma.searchIndexHint.findUnique({
              where: { artistId: artist.id },
            });

            if (existing) {
              updated++;
            } else {
              created++;
            }
          } catch (error) {
            console.error(`Error processing artist ${artist.id}:`, error);
            errors++;
          }
        })
      );

      // Progress indicator
      if ((i + batchSize) % 500 === 0 || i + batchSize >= artists.length) {
        console.log(`   Processed ${Math.min(i + batchSize, artists.length)}/${artists.length} artists...`);
      }
    }

    console.log('✅ Search score recomputation complete');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${artists.length}`);

    // Show some example scores
    const topScores = await prisma.searchIndexHint.findMany({
      take: 5,
      orderBy: { score: 'desc' },
      include: {
        artist: {
          select: {
            displayName: true,
            verificationTier: true,
            profileViews: true,
          },
        },
      },
    });

    if (topScores.length > 0) {
      console.log('\n📈 Top 5 scores:');
      topScores.forEach((hint, index) => {
        console.log(
          `   ${index + 1}. ${hint.artist.displayName}: ${hint.score} (${hint.artist.verificationTier}, ${hint.artist.profileViews} views)`
        );
      });
    }
  } catch (error) {
    console.error('Error recomputing search scores:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

