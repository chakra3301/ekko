#!/usr/bin/env node
/**
 * Admin CLI script to ban/unban users
 * Usage: node scripts/banUser.js <userId> [ban|unban]
 * 
 * Example:
 *   node scripts/banUser.js clx123456 ban
 *   node scripts/banUser.js clx123456 unban
 * 
 * Note: Run with tsx for TypeScript support:
 *   npx tsx scripts/banUser.js <userId> [ban|unban]
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Error: User ID is required');
    console.error('Usage: node scripts/banUser.js <userId> [ban|unban]');
    console.error('  Default action: ban');
    process.exit(1);
  }

  const userId = args[0];
  const action = (args[1] || 'ban').toLowerCase();
  const shouldBan = action === 'ban';

  if (action !== 'ban' && action !== 'unban') {
    console.error(`Error: Invalid action "${action}"`);
    console.error('Valid actions: ban, unban');
    process.exit(1);
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artistProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        clientProfile: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`Error: User "${userId}" not found`);
      process.exit(1);
    }

    if (user.banned === shouldBan) {
      console.log(`ℹ️  User is already ${shouldBan ? 'banned' : 'unbanned'}`);
      process.exit(0);
    }

    // Update banned status
    await prisma.user.update({
      where: { id: userId },
      data: {
        banned: shouldBan,
      },
    });

    const displayName =
      user.artistProfile?.displayName ||
      user.clientProfile?.companyName ||
      user.name ||
      user.email;

    console.log(`✅ User ${shouldBan ? 'banned' : 'unbanned'} successfully`);
    console.log(`   User: ${displayName} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${shouldBan ? 'BANNED' : 'ACTIVE'}`);
  } catch (error) {
    console.error('Error updating user ban status:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

